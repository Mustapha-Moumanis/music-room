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
};

export class AuthException extends HttpException {
  constructor(code: AuthErrorCode, status: HttpStatus, message = DEFAULT_MESSAGES[code]) {
    super({ message, code }, status);
  }
}

