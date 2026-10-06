import 'reflect-metadata';

export const testEnv = {
  NODE_ENV: 'test',
  BACKEND_PORT: '3000',
  APP_URL: 'http://localhost:3000',
  CORS_ORIGINS: 'http://localhost:8081, http://localhost:3000',
  LOG_LEVEL: 'silent',
  DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgresql://musicroom:change-me@localhost:5433/musicroom_test?schema=public',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgresql://musicroom:change-me@localhost:5433/musicroom_test?schema=public',
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_ACCESS_TTL: '15m',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_REFRESH_TTL: '30d',
  EMAIL_VERIFY_TTL: '24h',
  PASSWORD_RESET_TTL: '15m',
  THROTTLE_TTL_MS: '60000',
  THROTTLE_LIMIT: '100',
  AUTH_THROTTLE_LIMIT: '100',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  SMTP_USER: '',
  SMTP_PASSWORD: '',
  MAIL_FROM: 'Music Room <no-reply@musicroom.local>',
  GOOGLE_WEB_CLIENT_ID: '',
  DEEZER_API_URL: 'https://api.deezer.com',
};
Object.assign(process.env, testEnv);
