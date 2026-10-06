import { Injectable } from '@nestjs/common';
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
  private readonly transporter?: Transporter;
  private readonly sent: SentMailRecord[] = [];

  constructor(private readonly config: AppConfigService) {
    if (this.config.get('NODE_ENV') === 'test') return;
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASSWORD');
    const port = this.config.get('SMTP_PORT');
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
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
    await this.transporter?.sendMail(record);
  }

  getSentMail(): SentMailRecord[] {
    return [...this.sent];
  }

  clearSentMail(): void {
    this.sent.length = 0;
  }
}
