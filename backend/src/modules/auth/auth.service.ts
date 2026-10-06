import { HttpStatus, Injectable } from '@nestjs/common';
import { EmailTokenType, IdentityProvider, Prisma, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { Request } from 'express';
import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { AuthException } from '../../core/auth/auth.exception';
import { TokenService } from '../../core/auth/token.service';
import { parseTtlMs } from '../../core/auth/ttl';
import { AppConfigService } from '../../core/config/app-config.service';
import { PrismaService } from '../../core/database/prisma.service';
import { MailService } from '../../core/mail/mail.service';
import { extractClientInfo } from '../../core/logging/client-info';
import { EmailVerificationNotifier, hashToken } from './email-verification-notifier';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { MeResponseDto } from './dto/me.dto';
import { RefreshResponseDto } from './dto/refresh.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { GoogleIdTokenVerifier, GoogleIdTokenVerificationError } from './google-id-token.verifier';
import { normalizeEmail, validatePasswordPolicy } from './password-policy';

const GENERIC_REGISTER_RESPONSE: RegisterResponseDto = { message: 'If the address can be used, a verification email has been sent.' };
const GENERIC_RESEND_RESPONSE = { message: 'If the account exists and needs verification, a verification email has been sent.' };
const GENERIC_FORGOT_RESPONSE = { message: 'If the account exists, a password reset code has been sent.' };
const PASSWORD_RESET_RESPONSE = { message: 'Password has been reset.' };
const DUMMY_HASH = '$argon2id$v=19$m=19456,t=2,p=1$zknhCbd0m/DS7TyVKU5sng$UpoADxamCbKD0F2tSDj0X7NQ73jCl/E+iIA3tzhDgY0';
const ARGON_OPTIONS = { type: argon2.argon2id as 2, memoryCost: 19456, timeCost: 2, parallelism: 1 };
const MAX_RESET_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly emailVerificationNotifier: EmailVerificationNotifier,
    private readonly config: AppConfigService,
    private readonly mail: MailService,
    private readonly googleVerifier: GoogleIdTokenVerifier,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const email = normalizeEmail(dto.email);
    if (!validatePasswordPolicy(dto.password, email)) {
      throw new AuthException('WEAK_PASSWORD', HttpStatus.BAD_REQUEST);
    }
    const passwordHash = await argon2.hash(dto.password, ARGON_OPTIONS);
    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return GENERIC_REGISTER_RESPONSE;

    try {
      const user = await this.prisma.$transaction(async (tx) => tx.user.create({
        data: {
          email,
          passwordHash,
          displayName: dto.displayName,
          identities: { create: { provider: IdentityProvider.LOCAL, providerId: email } },
          profile: { create: {} },
        },
      }));
      await this.emailVerificationNotifier.notify({ userId: user.id, email: user.email, displayName: user.displayName });
    } catch (error) {
      if (isUniqueConstraint(error)) return GENERIC_REGISTER_RESPONSE;
      throw error;
    }
    return GENERIC_REGISTER_RESPONSE;
  }

  async login(dto: LoginDto, req: Request): Promise<LoginResponseDto> {
    const email = normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const valid = await argon2.verify(hash, dto.password).catch(() => false);
    if (!user || !user.passwordHash || !valid) throw new AuthException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
    if (!user.emailVerifiedAt) throw new AuthException('EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
    return this.issueSession(user, req);
  }

  async refresh(refreshToken: string, req: Request): Promise<RefreshResponseDto> {
    const parsed = this.tokens.parseRefreshToken(refreshToken);
    if (!parsed) throw new AuthException('INVALID_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);
    const secretHash = this.tokens.hashRefreshSecret(parsed.secret);
    const now = new Date();

    const result = await this.prisma.$transaction(async (tx): Promise<RefreshResponseDto | 'reused'> => {
      const rows = await tx.$queryRaw<Array<{
        id: string;
        tokenHash: string;
        familyId: string;
        userId: string;
        expiresAt: Date;
        revokedAt: Date | null;
        replacedById: string | null;
      }>>`SELECT id, "tokenHash", "familyId", "userId", "expiresAt", "revokedAt", "replacedById"
          FROM "RefreshToken" WHERE id = ${parsed.id} FOR UPDATE`;
      const current = rows[0];
      if (!current) throw new AuthException('INVALID_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);
      if (!safeEqual(current.tokenHash, secretHash)) throw new AuthException('INVALID_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);
      if (current.expiresAt <= now) throw new AuthException('INVALID_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);
      if (current.revokedAt || current.replacedById) {
        await tx.refreshToken.updateMany({ where: { familyId: current.familyId, revokedAt: null }, data: { revokedAt: now } });
        return 'reused';
      }
      const next = this.tokens.issueRefreshToken(now);
      const info = extractClientInfo(req.headers);
      await tx.refreshToken.create({
        data: {
          id: next.id,
          tokenHash: next.secretHash,
          familyId: current.familyId,
          userId: current.userId,
          expiresAt: next.expiresAt,
          userAgent: req.headers['user-agent'],
          device: info.device,
          ip: req.ip,
        },
      });
      await tx.refreshToken.update({ where: { id: current.id }, data: { replacedById: next.id } });
      const access = this.tokens.signAccessToken(current.userId, current.familyId);
      return { ...access, refreshToken: next.token, refreshTokenExpiresAt: next.expiresAt.toISOString() };
    });
    if (result === 'reused') throw new AuthException('REFRESH_TOKEN_REUSED', HttpStatus.UNAUTHORIZED);
    return result;
  }

  async me(userId: string): Promise<MeResponseDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, emailVerifiedAt: true, passwordHash: true, identities: { select: { provider: true } } },
    });
    return this.toMe(user);
  }

  async verifyEmail(token: string | undefined): Promise<{ status: number; html: string }> {
    if (!token) return { status: HttpStatus.BAD_REQUEST, html: verificationHtml(false) };
    const now = new Date();
    const tokenHash = hashToken(token);
    const ok = await this.prisma.$transaction(async (tx) => {
      const emailToken = await tx.emailToken.findFirst({
        where: { type: EmailTokenType.VERIFY_EMAIL, tokenHash },
        select: { id: true, userId: true, expiresAt: true, usedAt: true },
      });
      if (!emailToken || emailToken.usedAt || emailToken.expiresAt <= now) return false;
      const claimed = await tx.emailToken.updateMany({
        where: { id: emailToken.id, usedAt: null },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) return false;
      await tx.user.update({ where: { id: emailToken.userId }, data: { emailVerifiedAt: now } });
      return true;
    });
    return { status: ok ? HttpStatus.OK : HttpStatus.BAD_REQUEST, html: verificationHtml(ok) };
  }

  async resendVerification(email: string): Promise<typeof GENERIC_RESEND_RESPONSE> {
    const normalized = normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true, email: true, displayName: true, passwordHash: true, emailVerifiedAt: true },
    });
    if (user?.passwordHash && !user.emailVerifiedAt) {
      await this.prisma.emailToken.updateMany({
        where: { userId: user.id, type: EmailTokenType.VERIFY_EMAIL, usedAt: null },
        data: { usedAt: new Date() },
      });
      await this.emailVerificationNotifier.notify({ userId: user.id, email: user.email, displayName: user.displayName });
    }
    return GENERIC_RESEND_RESPONSE;
  }

  async forgotPassword(email: string): Promise<typeof GENERIC_FORGOT_RESPONSE> {
    const normalized = normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true, email: true, displayName: true, passwordHash: true },
    });
    if (!user?.passwordHash) return GENERIC_FORGOT_RESPONSE;

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const expiresAt = new Date(Date.now() + parseTtlMs(this.config.get('PASSWORD_RESET_TTL')));
    await this.prisma.$transaction(async (tx) => {
      await tx.emailToken.updateMany({
        where: { userId: user.id, type: EmailTokenType.RESET_PASSWORD, usedAt: null },
        data: { usedAt: new Date() },
      });
      await tx.emailToken.create({
        data: { userId: user.id, type: EmailTokenType.RESET_PASSWORD, tokenHash: this.hashResetCode(normalized, code), expiresAt },
      });
    });
    try {
      await this.mail.send({
        to: user.email,
        subject: 'Your Music Room password reset code',
        text: `Hi ${user.displayName},\n\nYour Music Room password reset code is ${code}.\n\nIt expires in 15 minutes.`,
        html: `<p>Hi ${escapeHtml(user.displayName)},</p><p>Your Music Room password reset code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`,
      });
    } catch {
      // Keep the public response generic.
    }
    return GENERIC_FORGOT_RESPONSE;
  }

  async resetPassword(dto: PasswordResetDto): Promise<typeof PASSWORD_RESET_RESPONSE> {
    const email = normalizeEmail(dto.email);
    if (!validatePasswordPolicy(dto.newPassword, email)) throw new AuthException('WEAK_PASSWORD', HttpStatus.BAD_REQUEST);
    // Hash first so known and unknown emails take the same time.
    const passwordHash = await argon2.hash(dto.newPassword, ARGON_OPTIONS);
    const user = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) throw new AuthException('INVALID_RESET_CODE', HttpStatus.BAD_REQUEST);

    const now = new Date();
    const tokenHash = this.hashResetCode(email, dto.code);
    const token = await this.prisma.emailToken.findFirst({
      where: { userId: user.id, type: EmailTokenType.RESET_PASSWORD, usedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, tokenHash: true },
    });
    if (!token) throw new AuthException('INVALID_RESET_CODE', HttpStatus.BAD_REQUEST);

    // Claim an attempt atomically before comparing, so parallel guesses can't exceed the limit.
    const claimed = await this.prisma.emailToken.updateMany({
      where: { id: token.id, usedAt: null, attempts: { lt: MAX_RESET_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    if (claimed.count !== 1 || !safeEqual(token.tokenHash, tokenHash)) {
      await this.prisma.emailToken.updateMany({
        where: { id: token.id, usedAt: null, attempts: { gte: MAX_RESET_ATTEMPTS } },
        data: { usedAt: now },
      });
      throw new AuthException('INVALID_RESET_CODE', HttpStatus.BAD_REQUEST);
    }

    const ok = await this.prisma.$transaction(async (tx) => {
      const consumed = await tx.emailToken.updateMany({ where: { id: token.id, usedAt: null }, data: { usedAt: now } });
      if (consumed.count !== 1) return false;
      await tx.user.update({ where: { id: user.id }, data: { passwordHash, emailVerifiedAt: now } });
      await tx.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } });
      return true;
    });
    if (!ok) throw new AuthException('INVALID_RESET_CODE', HttpStatus.BAD_REQUEST);
    return PASSWORD_RESET_RESPONSE;
  }

  async logout(refreshToken: string): Promise<void> {
    const parsed = this.tokens.parseRefreshToken(refreshToken);
    if (!parsed) return;
    const secretHash = this.tokens.hashRefreshSecret(parsed.secret);
    const token = await this.prisma.refreshToken.findUnique({ where: { id: parsed.id }, select: { tokenHash: true, familyId: true } });
    if (!token || !safeEqual(token.tokenHash, secretHash)) return;
    await this.prisma.refreshToken.updateMany({ where: { familyId: token.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async google(idToken: string, req: Request): Promise<LoginResponseDto> {
    const claims = await this.verifyGoogle(idToken);
    const identity = await this.prisma.identity.findUnique({
      where: { provider_providerId: { provider: IdentityProvider.GOOGLE, providerId: claims.sub } },
      select: { user: true },
    });
    if (identity) return this.issueSession(identity.user, req);
    const email = normalizeEmail(claims.email);
    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new AuthException('ACCOUNT_EXISTS_LINK_REQUIRED', HttpStatus.CONFLICT);
    const displayName = claims.name?.trim() || email.split('@')[0];
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          displayName,
          emailVerifiedAt: new Date(),
          identities: { create: { provider: IdentityProvider.GOOGLE, providerId: claims.sub } },
          profile: { create: {} },
        },
      });
      return await this.issueSession(user, req);
    } catch (error) {
      if (!isUniqueConstraint(error)) throw error;
      // Lost a race with a concurrent sign-in (double tap): use the account it created.
      const raced = await this.prisma.identity.findUnique({
        where: { provider_providerId: { provider: IdentityProvider.GOOGLE, providerId: claims.sub } },
        select: { user: true },
      });
      if (raced) return this.issueSession(raced.user, req);
      throw new AuthException('ACCOUNT_EXISTS_LINK_REQUIRED', HttpStatus.CONFLICT);
    }
  }

  async linkGoogle(userId: string, idToken: string): Promise<MeResponseDto> {
    const claims = await this.verifyGoogle(idToken);
    const existing = await this.prisma.identity.findUnique({
      where: { provider_providerId: { provider: IdentityProvider.GOOGLE, providerId: claims.sub } },
      select: { userId: true },
    });
    if (existing?.userId && existing.userId !== userId) throw new AuthException('GOOGLE_ALREADY_LINKED', HttpStatus.CONFLICT);
    if (!existing) {
      // One Google account per user (@@unique([provider, userId])); a second one, or a racing link, is a conflict.
      try {
        await this.prisma.identity.create({ data: { provider: IdentityProvider.GOOGLE, providerId: claims.sub, userId } });
      } catch (error) {
        if (isUniqueConstraint(error)) throw new AuthException('GOOGLE_ALREADY_LINKED', HttpStatus.CONFLICT);
        throw error;
      }
    }
    return this.me(userId);
  }

  async unlinkGoogle(userId: string): Promise<MeResponseDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { passwordHash: true, identities: { where: { provider: IdentityProvider.GOOGLE }, select: { id: true } } },
    });
    const google = user.identities[0];
    if (!google) throw new AuthException('GOOGLE_NOT_LINKED', HttpStatus.NOT_FOUND);
    if (!user.passwordHash) throw new AuthException('PASSWORD_REQUIRED_TO_UNLINK', HttpStatus.BAD_REQUEST);
    await this.prisma.identity.delete({ where: { id: google.id } });
    return this.me(userId);
  }

  private async issueSession(user: User, req: Request): Promise<LoginResponseDto> {
    const familyId = randomUUID();
    const refresh = this.tokens.issueRefreshToken();
    const info = extractClientInfo(req.headers);
    await this.prisma.refreshToken.create({
      data: {
        id: refresh.id,
        tokenHash: refresh.secretHash,
        familyId,
        userId: user.id,
        expiresAt: refresh.expiresAt,
        userAgent: req.headers['user-agent'],
        device: info.device,
        ip: req.ip,
      },
    });
    return {
      ...this.tokens.signAccessToken(user.id, familyId),
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt.toISOString(),
      user: { id: user.id, email: user.email, displayName: user.displayName },
    };
  }

  private hashResetCode(email: string, code: string): string {
    return createHmac('sha256', this.config.get('JWT_REFRESH_SECRET')).update(`${email}:${code}`).digest('base64url');
  }

  private async verifyGoogle(idToken: string) {
    try {
      return await this.googleVerifier.verify(idToken);
    } catch (error) {
      if (error instanceof GoogleIdTokenVerificationError) throw new AuthException('INVALID_GOOGLE_TOKEN', HttpStatus.UNAUTHORIZED);
      throw error;
    }
  }

  private toMe(user: {
    id: string;
    email: string;
    displayName: string;
    emailVerifiedAt: Date | null;
    passwordHash: string | null;
    identities: Array<{ provider: IdentityProvider }>;
  }): MeResponseDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: Boolean(user.emailVerifiedAt),
      hasPassword: Boolean(user.passwordHash),
      providers: user.identities.map((identity) => identity.provider).sort(),
    };
  }
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function isUniqueConstraint(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

function verificationHtml(success: boolean): string {
  const title = success ? 'Email verified' : 'Verification link invalid';
  const message = success
    ? 'Email verified — you can go back to the Music Room app and log in.'
    : 'This verification link is invalid, expired, or has already been used.';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f7f4;color:#20201d}.box{max-width:34rem;padding:2rem;text-align:center}h1{font-size:1.75rem;margin:0 0 1rem}p{line-height:1.5;margin:0}</style></head><body><main class="box"><h1>${title}</h1><p>${message}</p></main></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
