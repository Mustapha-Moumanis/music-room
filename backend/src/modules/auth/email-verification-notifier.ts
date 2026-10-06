import { Injectable, Logger } from '@nestjs/common';

export interface EmailVerificationPayload {
  userId: string;
  email: string;
  displayName: string;
}

@Injectable()
export class EmailVerificationNotifier {
  private readonly logger = new Logger(EmailVerificationNotifier.name);

  async notify(payload: EmailVerificationPayload): Promise<void> {
    this.logger.debug(`Email verification notification skipped for user ${payload.userId}`);
  }
}

