import { isAxiosError } from 'axios';

export type ApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'HTTP'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_REFRESH_TOKEN'
  | 'REFRESH_TOKEN_REUSED'
  | 'UNAUTHORIZED'
  | 'SESSION_REVOKED'
  | 'INVALID_RESET_CODE'
  | 'INVALID_GOOGLE_TOKEN'
  | 'ACCOUNT_EXISTS_LINK_REQUIRED'
  | 'GOOGLE_ALREADY_LINKED'
  | 'PASSWORD_REQUIRED_TO_UNLINK'
  | 'GOOGLE_NOT_LINKED';

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status?: number,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function toApiError(error: unknown, origin?: string, endpoint?: string): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) {
    const server = origin ? ` at ${origin}` : '';
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('TIMEOUT', `Server unreachable${server} (timeout after 8 s)`, undefined, error);
    }
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const code = typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string'
        ? data.code as ApiErrorCode
        : 'HTTP';
      return new ApiError(code, `Reached server but ${endpoint ?? 'the request'} returned ${status}`, status, error);
    }
    return new ApiError('NETWORK', `Server unreachable${server} — check the address and your network connection`, undefined, error);
  }
  return new ApiError('UNKNOWN', 'Could not complete the request. Please try again.', undefined, error);
}
