export class BackendUrlError extends Error {
  readonly code = 'INVALID_BACKEND_URL';

  constructor(message = 'Invalid URL — must start with http:// or https://') {
    super(message);
    this.name = 'BackendUrlError';
  }
}

/** Accept an origin or the API root, never silently discard another path. */
export function normalizeBackendUrl(input: string): string {
  const value = input.trim().replace(/\/+$/, '').replace(/\/api$/, '');
  if (!/^https?:\/\/[^/]/i.test(value)) throw new BackendUrlError();
  try {
    const url = new URL(value);
    if (
      !url.hostname ||
      url.username || url.password || url.search || url.hash ||
      (url.pathname !== '' && url.pathname !== '/') ||
      /\s/.test(value) || /\\/.test(value)
    ) {
      throw new BackendUrlError('Invalid URL — use a server origin, without credentials, a path, query, or fragment');
    }
    return url.origin;
  } catch (error) {
    if (error instanceof BackendUrlError) throw error;
    throw new BackendUrlError();
  }
}

// A malformed build-time value must not prevent opening Settings to repair it.
function defaultBackendUrl(): string {
  try {
    return normalizeBackendUrl(process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000');
  } catch {
    return 'http://10.0.2.2:3000';
  }
}
export const DEFAULT_BACKEND_URL = defaultBackendUrl();
