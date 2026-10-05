export interface ClientInfo {
  platform: string;
  device: string;
  appVersion: string;
  requestId?: string;
}

export interface HeaderLike {
  [key: string]: string | string[] | undefined;
}

const MAX_HEADER_LENGTH = 128;

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function cleanHeader(value: string | string[] | undefined, fallback = 'unknown'): string {
  const trimmed = firstHeader(value)?.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, MAX_HEADER_LENGTH);
}

export function extractClientInfo(headers: HeaderLike = {}): ClientInfo {
  return {
    platform: cleanHeader(headers['x-platform']),
    device: cleanHeader(headers['x-device']),
    appVersion: cleanHeader(headers['x-app-version']),
    requestId: cleanHeader(headers['x-request-id'], ''),
  };
}

export function extractClientInfoFromAuth(auth: unknown, headers: HeaderLike = {}): ClientInfo {
  if (!auth || typeof auth !== 'object') return extractClientInfo(headers);
  const authRecord = auth as Record<string, unknown>;
  return {
    platform: cleanHeader(asHeader(authRecord.platform) ?? headers['x-platform']),
    device: cleanHeader(asHeader(authRecord.device) ?? headers['x-device']),
    appVersion: cleanHeader(asHeader(authRecord.appVersion) ?? headers['x-app-version']),
    requestId: cleanHeader(asHeader(authRecord.requestId) ?? headers['x-request-id'], ''),
  };
}

function asHeader(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
