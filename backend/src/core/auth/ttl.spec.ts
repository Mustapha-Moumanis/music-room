import { parseTtlMs } from './ttl';

describe('parseTtlMs', () => {
  it.each([
    ['15m', 15 * 60 * 1000],
    ['30d', 30 * 24 * 60 * 60 * 1000],
    ['24h', 24 * 60 * 60 * 1000],
    ['500ms', 500],
  ])('parses %s', (input, expected) => {
    expect(parseTtlMs(input)).toBe(expected);
  });

  it.each(['0m', '15', 'm15', '1.5h', ''])('rejects %s', (input) => {
    expect(() => parseTtlMs(input)).toThrow('Invalid TTL');
  });
});

