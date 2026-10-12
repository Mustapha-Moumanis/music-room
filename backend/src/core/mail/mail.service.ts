import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { AppConfigService } from '../config/app-config.service';

export interface SentMailRecord {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

export interface MailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter?: Transporter;
  private readonly sent: SentMailRecord[] = [];
  private readonly terminalFallback: boolean;

  constructor(private readonly config: AppConfigService) {
    const environment = this.config.get('NODE_ENV');
    const host = this.config.get('SMTP_HOST');
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASSWORD');
    this.terminalFallback = environment === 'development' && isPlaceholderConfig(host, user, pass);
    if (environment === 'test' || this.terminalFallback) return;
    const port = this.config.get('SMTP_PORT');
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(payload: MailPayload): Promise<void> {
    const from = this.config.get('MAIL_FROM');
    const record = { from, ...payload };
    if (this.config.get('NODE_ENV') === 'test') {
      this.sent.push(record);
      return;
    }
    if (this.terminalFallback) {
      this.logger.warn('SMTP is not configured; printing email to the development terminal.');
      this.printToTerminal(record);
      return;
    }
    try {
      await this.transporter?.sendMail(record);
    } catch (error) {
      if (this.config.get('NODE_ENV') !== 'development') throw error;
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`SMTP delivery failed (${message}); printing email to the development terminal.`);
      this.printToTerminal(record);
    }
  }

  private printToTerminal(record: SentMailRecord): void {
    this.logger.log([
      '--- DEVELOPMENT EMAIL ---', `To: ${record.to}`, `From: ${record.from}`,
      `Subject: ${record.subject}`, '', record.text, '--- END DEVELOPMENT EMAIL ---',
    ].join('\n'));
  }

  getSentMail(): SentMailRecord[] {
    return [...this.sent];
  }

  clearSentMail(): void {
    this.sent.length = 0;
  }
}

function isPlaceholderConfig(host: string, user?: string, pass?: string): boolean {
  return host === 'smtp.example.com'
    || pass === 'change-me'
    || (host.endsWith('.example.com') && user === 'noreply@example.com');
}
