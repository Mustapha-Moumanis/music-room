import { HttpStatus, Injectable } from '@nestjs/common';
import { IdentityProvider, Prisma, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { Request } from 'express';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { AuthException } from '../../core/auth/auth.exception';
import { TokenService } from '../../core/auth/token.service';
import { PrismaService } from '../../core/database/prisma.service';
import { extractClientInfo } from '../../core/logging/client-info';
import { EmailVerificationNotifier } from './email-verification-notifier';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { MeResponseDto } from './dto/me.dto';
import { RefreshResponseDto } from './dto/refresh.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { normalizeEmail, validatePasswordPolicy } from './password-policy';

const GENERIC_REGISTER_RESPONSE: RegisterResponseDto = { message: 'If the address can be used, a verification email has been sent.' };
const DUMMY_HASH = '$argon2id$v=19$m=19456,t=2,p=1$zknhCbd0m/DS7TyVKU5sng$UpoADxamCbKD0F2tSDj0X7NQ73jCl/E+iIA3tzhDgY0';
const ARGON_OPTIONS = { type: argon2.argon2id as 2, memoryCost: 19456, timeCost: 2, parallelism: 1 };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly emailVerificationNotifier: EmailVerificationNotifier,
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
      select: { id: true, email: true, displayName: true, emailVerifiedAt: true },
    });
    return { id: user.id, email: user.email, displayName: user.displayName, emailVerified: Boolean(user.emailVerifiedAt) };
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
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function isUniqueConstraint(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
