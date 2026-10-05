import { isAxiosError } from 'axios';

export type ApiErrorCode = 'NETWORK' | 'TIMEOUT' | 'HTTP' | 'INVALID_RESPONSE' | 'UNKNOWN';

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
      return new ApiError('HTTP', `Reached server but ${endpoint ?? 'the request'} returned ${status}`, status, error);
    }
    return new ApiError('NETWORK', `Server unreachable${server} — check the address and your network connection`, undefined, error);
  }
  return new ApiError('UNKNOWN', 'Could not complete the request. Please try again.', undefined, error);
}
