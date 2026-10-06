export interface AccessTokenClaims {
  sub: string;
  sid: string;
  typ: 'access';
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  sessionId: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'WEAK_PASSWORD'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_REFRESH_TOKEN'
  | 'REFRESH_TOKEN_REUSED'
  | 'SESSION_REVOKED'
  | 'UNAUTHORIZED';

