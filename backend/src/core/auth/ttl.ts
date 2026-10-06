const TTL_PATTERN = /^([1-9]\d*)(ms|s|m|h|d|w|y)$/;
const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  y: 365 * 24 * 60 * 60 * 1000,
};

export function parseTtlMs(value: string): number {
  const match = TTL_PATTERN.exec(value);
  if (!match) throw new Error(`Invalid TTL: ${value}`);
  const amount = Number(match[1]);
  const unit = match[2];
  return amount * UNIT_MS[unit];
}

