import { Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { AppConfigService } from '../config/app-config.service';
import { MailPayload, MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

const payload: MailPayload = {
  to: 'listener@example.com',
  subject: 'Verify your email',
  text: 'Open http://localhost:3000/api/auth/verify?token=dev-token',
  html: '<p>verification</p>',
};

function config(overrides: Record<string, unknown> = {}): AppConfigService {
  const values: Record<string, unknown> = {
    NODE_ENV: 'development',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 587,
    SMTP_USER: 'noreply@example.com',
    SMTP_PASSWORD: 'change-me',
    MAIL_FROM: 'Music Room <noreply@example.com>',
    ...overrides,
  };
  return { get: jest.fn((key: string) => values[key]) } as unknown as AppConfigService;
}

describe('MailService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('prints mail to the terminal when development uses placeholder SMTP settings', async () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const service = new MailService(config());

    await service.send(payload);

    expect(nodemailer.createTransport).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining(payload.text));
  });

  it('prints mail when a configured development SMTP server is unavailable', async () => {
    const sendMail = jest.fn().mockRejectedValue(new Error('offline'));
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const service = new MailService(config({
      SMTP_HOST: 'smtp.local',
      SMTP_USER: 'local-user',
      SMTP_PASSWORD: 'local-password',
    }));

    await service.send(payload);

    expect(sendMail).toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining(payload.text));
  });

  it('does not expose unsent email content in production', async () => {
    const sendMail = jest.fn().mockRejectedValue(new Error('offline'));
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const service = new MailService(config({
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp.local',
      SMTP_USER: 'production-user',
      SMTP_PASSWORD: 'production-password',
    }));

    await expect(service.send(payload)).rejects.toThrow('offline');
    expect(log).not.toHaveBeenCalled();
  });
});
