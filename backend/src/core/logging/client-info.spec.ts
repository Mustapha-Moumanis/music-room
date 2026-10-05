import { extractClientInfo, extractClientInfoFromAuth } from './client-info';
import { capMeta, redactSensitive } from './redaction';

describe('client info extraction and redaction', () => {
  it('extracts known headers and defaults missing values to unknown', () => {
    expect(extractClientInfo({
      'x-platform': ' android ',
      'x-device': 'Pixel 8',
      'x-app-version': '1.0.0 (1)',
      'x-request-id': 'req-1',
    })).toEqual({ platform: 'android', device: 'Pixel 8', appVersion: '1.0.0 (1)', requestId: 'req-1' });
    expect(extractClientInfo({})).toEqual({ platform: 'unknown', device: 'unknown', appVersion: 'unknown', requestId: '' });
  });

  it('prefers socket auth client info over handshake headers', () => {
    expect(extractClientInfoFromAuth({ platform: 'ios', device: 'iPhone', appVersion: '2' }, { 'x-platform': 'android' }))
      .toMatchObject({ platform: 'ios', device: 'iPhone', appVersion: '2' });
  });

  it('redacts sensitive keys recursively and caps oversized metadata', () => {
    expect(redactSensitive({
      password: 'secret',
      nested: { token: 'secret', ok: true },
      idToken: 'secret',
    })).toEqual({
      password: '[Redacted]',
      nested: { token: '[Redacted]', ok: true },
      idToken: '[Redacted]',
    });
    expect(capMeta({ value: 'x'.repeat(3000) })).toEqual({ truncated: true, bytes: expect.any(Number) });
  });
});
