import 'reflect-metadata';
import { testEnv } from '../../../test/setup-env';
import { validate } from './env.validation';

describe('environment validation', () => {
  it('converts numbers and splits origins, allowing empty optional settings', () => {
    const env = validate(testEnv);
    expect(env.BACKEND_PORT).toBe(3000);
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:8081', 'http://localhost:3000']);
    expect(env.SMTP_USER).toBe('');
  });

  it.each(Object.keys(testEnv).filter((key) => !['SMTP_USER', 'SMTP_PASSWORD', 'GOOGLE_WEB_CLIENT_ID'].includes(key)))(
    'rejects missing %s', (key) => {
      const env: Record<string, unknown> = { ...testEnv };
      delete env[key];
      expect(() => validate(env)).toThrow(key);
    },
  );

  it.each([
    ['BACKEND_PORT', '65536'], ['SMTP_PORT', 'abc'], ['THROTTLE_LIMIT', '0'],
    ['NODE_ENV', 'staging'], ['JWT_ACCESS_TTL', 'forever'], ['CORS_ORIGINS', '*'],
    ['CORS_ORIGINS', 'http://localhost:3000,'], ['APP_URL', 'invalid'],
    ['DATABASE_URL', 'https://example.com'], ['MAIL_FROM', 'bad-mail'],
    ['LOG_LEVEL', 'verbose'], ['DEEZER_API_URL', 'ftp://example.com'],
  ])('rejects invalid %s', (key, value) => {
    expect(() => validate({ ...testEnv, [key]: value })).toThrow(key);
  });

  it('does not include secret values in failures', () => {
    expect(() => validate({ ...testEnv, DATABASE_URL: 'private-secret' })).toThrow('Invalid environment variables: DATABASE_URL');
  });
});
