import { Injectable, Logger } from '@nestjs/common';
import { EmailTokenType } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { AppConfigService } from '../../core/config/app-config.service';
import { PrismaService } from '../../core/database/prisma.service';
import { MailService } from '../../core/mail/mail.service';
import { parseTtlMs } from '../../core/auth/ttl';

export interface EmailVerificationPayload {
  userId: string;
  email: string;
  displayName: string;
}

@Injectable()
export class EmailVerificationNotifier {
  private readonly logger = new Logger(EmailVerificationNotifier.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly mail: MailService,
  ) {}

  async notify(payload: EmailVerificationPayload): Promise<void> {
    try {
      const token = randomBytes(32).toString('base64url');
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + parseTtlMs(this.config.get('EMAIL_VERIFY_TTL')));
      await this.prisma.emailToken.create({
        data: { type: EmailTokenType.VERIFY_EMAIL, tokenHash, userId: payload.userId, expiresAt },
      });
      const verifyUrl = `${this.config.get('APP_URL')}/api/auth/verify?token=${encodeURIComponent(token)}`;
      await this.mail.send({
        to: payload.email,
        subject: 'Verify your Music Room email',
        text: `Hi ${payload.displayName},\n\nVerify your Music Room email:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
        html: `<p>Hi ${escapeHtml(payload.displayName)},</p><p>Verify your Music Room email:</p><p><a href="${escapeHtml(verifyUrl)}">${escapeHtml(verifyUrl)}</a></p><p>This link expires in 24 hours.</p>`,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email for user ${payload.userId}`, error instanceof Error ? error.stack : String(error));
    }
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
