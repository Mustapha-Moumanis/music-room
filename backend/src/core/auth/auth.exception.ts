import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthErrorCode } from './auth.types';

const DEFAULT_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  WEAK_PASSWORD: 'Password does not meet policy.',
  EMAIL_NOT_VERIFIED: 'Email address is not verified.',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token.',
  REFRESH_TOKEN_REUSED: 'Refresh token reuse detected.',
  SESSION_REVOKED: 'Session has been revoked.',
  UNAUTHORIZED: 'Authentication is required.',
  INVALID_RESET_CODE: 'Invalid or expired reset code.',
  INVALID_GOOGLE_TOKEN: 'Invalid Google token.',
  ACCOUNT_EXISTS_LINK_REQUIRED: 'An account with this email already exists. Log in and link Google from settings.',
  GOOGLE_ALREADY_LINKED: 'This Google account is already linked.',
  GOOGLE_NOT_LINKED: 'Google is not linked to this account.',
  PASSWORD_REQUIRED_TO_UNLINK: 'Set a password before unlinking Google.',
};

export class AuthException extends HttpException {
  constructor(code: AuthErrorCode, status: HttpStatus, message = DEFAULT_MESSAGES[code]) {
    super({ message, code }, status);
  }
}
