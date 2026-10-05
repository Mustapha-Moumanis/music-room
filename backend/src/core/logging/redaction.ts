const SENSITIVE_KEYS = new Set(['authorization', 'cookie', 'password', 'token', 'refreshtoken', 'idtoken', 'accesstoken']);
const MAX_META_BYTES = 2048;

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry) => redactSensitive(entry));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, isSensitiveKey(key) ? '[Redacted]' : redactSensitive(entry)]),
  );
}

export function capMeta(value: unknown, maxBytes = MAX_META_BYTES): unknown {
  const redacted = redactSensitive(value);
  const serialized = JSON.stringify(redacted);
  if (serialized.length <= maxBytes) return redacted;
  return {
    truncated: true,
    bytes: serialized.length,
  };
}

export const pinoRedactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.token',
  'req.body.refreshToken',
  'req.body.idToken',
  'req.body.accessToken',
  'res.headers["set-cookie"]',
  '*.password',
  '*.token',
  '*.refreshToken',
  '*.idToken',
  '*.accessToken',
];
