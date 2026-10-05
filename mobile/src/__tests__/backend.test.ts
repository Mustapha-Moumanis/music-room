import { BackendUrlError, normalizeBackendUrl } from '../config/backend';

describe('normalizeBackendUrl', () => {
  it.each([
    [' http://192.168.1.10:3000/api/// ', 'http://192.168.1.10:3000'],
    ['https://EXAMPLE.com///', 'https://example.com'],
    ['http://10.0.2.2:3000', 'http://10.0.2.2:3000'],
    ['https://example.com:443/api', 'https://example.com'],
    ['http://[::1]:3000/api/', 'http://[::1]:3000'],
  ])('normalizes %s', (input, expected) => expect(normalizeBackendUrl(input)).toBe(expected));

  it.each(['', 'http:///localhost', 'localhost:3000', 'ftp://example.com', 'https://', 'http://a:99999', 'http://a/b', 'https://a?x=1', 'http://a/#x', 'http://u:p@a', 'http://a b', 'http://a\\b'])('rejects %s with a typed error', (input) => {
    expect(() => normalizeBackendUrl(input)).toThrow(BackendUrlError);
  });
});
