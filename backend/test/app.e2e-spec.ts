import { Body, Controller, Get, INestApplication, Post } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { IsString } from 'class-validator';
import request from 'supertest';
import { Server } from 'node:http';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { IS_PUBLIC_KEY, Public } from '../src/core/auth/public.decorator';
import { PrismaService } from '../src/core/database/prisma.service';
import { MailService } from '../src/core/mail/mail.service';
import { hashToken } from '../src/modules/auth/email-verification-notifier';
import { GoogleIdTokenVerificationError, GoogleIdTokenVerifier } from '../src/modules/auth/google-id-token.verifier';
import { createVerifiedSession } from './helpers';

class TestDto {
  @IsString()
  name!: string;
}

@Controller('test')
@Public()
class TestController {
  @Post('validate')
  validate(@Body() dto: TestDto): { transformed: boolean } {
    return { transformed: dto instanceof TestDto };
  }

  @Get('error')
  error(): never {
    throw new Error('private failure details');
  }
}

describe('Application setup (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let mail: MailService;
  const googleVerifier = { verify: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule], controllers: [TestController],
    }).overrideProvider(GoogleIdTokenVerifier).useValue(googleVerifier).compile();
    app = module.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
    mail = app.get(MailService);
  });

  afterAll(async () => { await app?.close(); });

  beforeEach(async () => {
    await prisma.actionLog.deleteMany();
    mail.clearSentMail();
    googleVerifier.verify.mockReset();
  });

  it('serves health without an Origin header (native mobile)', async () => {
    const response = await request(server).get('/api/health').expect(200);
    expect(response.body).toEqual({ status: 'ok', db: 'up', uptime: expect.any(Number), timestamp: expect.any(String) });
  });

  it('serves Swagger HTML and local scripts with compatible CSP', async () => {
    const response = await request(server).get('/api/docs').expect(200).expect('Content-Type', /html/);
    expect(response.text).toContain('swagger-ui');
    expect(response.headers['content-security-policy']).toContain("script-src 'self'");
    await request(server).get('/api/docs/swagger-ui-init.js').expect(200);
    await request(server).get('/api/docs/swagger-ui-bundle.js').expect(200);
  });

  it('serves OpenAPI with the prefix and bearer security scheme', async () => {
    const response = await request(server).get('/api/docs-json').expect(200);
    expect(response.body.info.title).toBe('Music Room API');
    expect(response.body.paths['/api/health']).toBeDefined();
    expect(response.body.components.securitySchemes.bearer.scheme).toBe('bearer');
  });

  it('rejects unknown fields', async () => {
    const response = await request(server).post('/api/test/validate').send({ name: 'valid', unknown: true }).expect(400);
    expect(response.body.message).toContain('property unknown should not exist');
  });

  it('transforms valid DTOs', async () => {
    await request(server).post('/api/test/validate').send({ name: 'valid' }).expect(201, { transformed: true });
  });

  it('returns a generic 500 with no internal details or stack', async () => {
    const response = await request(server).get('/api/test/error').expect(500);
    expect(response.body).toEqual({
      statusCode: 500, error: 'Internal Server Error', message: 'Internal server error',
      path: '/api/test/error', timestamp: expect.any(String),
    });
    expect(response.text).not.toMatch(/stack|private failure details/);
  });

  it('logs HTTP requests with supplied client headers', async () => {
    await request(server)
      .post('/api/test/validate')
      .set('X-Platform', 'android')
      .set('X-Device', 'Pixel 8')
      .set('X-App-Version', '1.0.0 (1)')
      .send({ name: 'valid' })
      .expect(201);

    const row = await waitForActionLog(prisma, { kind: 'HTTP' });
    expect(row).toMatchObject({
      kind: 'HTTP',
      method: 'POST',
      platform: 'android',
      device: 'Pixel 8',
      appVersion: '1.0.0 (1)',
      statusCode: 201,
    });
    expect(row.route).toContain('/api/test/validate');
  });

  it('logs HTTP requests without client headers as unknown', async () => {
    await request(server).post('/api/test/validate').send({ name: 'valid' }).expect(201);
    const row = await waitForActionLog(prisma, { kind: 'HTTP' });
    expect(row).toMatchObject({ platform: 'unknown', device: 'unknown', appVersion: 'unknown' });
  });

  it('accepts client logs and redacts sensitive metadata from persisted rows and pino output', async () => {
    const written: string[] = [];
    const stdout = jest.spyOn(process.stdout, 'write').mockImplementation((chunk: string | Uint8Array) => {
      written.push(String(chunk));
      return true;
    });
    try {
      await request(server)
        .post('/api/logs/client')
        .set('X-Platform', 'android')
        .set('X-Device', 'Pixel 8')
        .set('X-App-Version', '1.0.0 (1)')
        .send({
          events: [
            { action: 'screen_view', meta: { screen: 'home', password: 'super-secret', refreshToken: 'refresh-token' } },
            { action: 'play', meta: { token: 'client-token', nested: { accessToken: 'access-token' } } },
          ],
        })
        .expect(202, { accepted: 2 });

      const rows = await waitForActionLogCount(prisma, 'CLIENT', 2);
      expect(rows).toHaveLength(2);
      expect(JSON.stringify(rows.map((row) => row.meta))).not.toMatch(/super-secret|client-token|access-token|refresh-token/);
      expect(JSON.stringify(rows.map((row) => row.meta))).toContain('[Redacted]');
      expect(written.join('')).not.toMatch(/super-secret|client-token|access-token|refresh-token/);
    } finally {
      stdout.mockRestore();
    }
  });

  it('supports email/password registration, verified login, /auth/me, and refresh reuse revocation', async () => {
    const email = `auth-${Date.now()}@example.com`;
    const password = 'musicRoom42';
    const registerBody = { message: 'If the address can be used, a verification email has been sent.' };

    await request(server).post('/api/auth/register').send({ email: ` ${email.toUpperCase()} `, password, displayName: 'Auth User' })
      .expect(201, registerBody);
    await request(server).post('/api/auth/register').send({ email, password, displayName: 'Auth User' })
      .expect(201, registerBody);

    const unverified = await request(server).post('/api/auth/login').send({ email, password }).expect(403);
    expect(unverified.body).toMatchObject({ statusCode: 403, code: 'EMAIL_NOT_VERIFIED', message: 'Email address is not verified.' });

    const wrong = await request(server).post('/api/auth/login').send({ email, password: 'wrongPassword1' }).expect(401);
    const unknown = await request(server).post('/api/auth/login').send({ email: `unknown-${email}`, password: 'wrongPassword1' }).expect(401);
    expect(stripVolatileError(wrong.body)).toEqual(stripVolatileError(unknown.body));
    expect(wrong.body).toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });

    const verifyLink = extractVerifyLink(mail.getSentMail()[0].text);
    const verify = await request(server).get(verifyLink).expect(200).expect('Content-Type', /html/);
    expect(verify.text).toContain('Email verified');
    const secondClick = await request(server).get(verifyLink).expect(400).expect('Content-Type', /html/);
    expect(secondClick.text).toContain('invalid, expired, or has already been used');

    const login = await request(server).post('/api/auth/login').send({ email, password }).expect(200);
    expect(login.body).toMatchObject({
      accessToken: expect.any(String),
      accessTokenExpiresIn: 900,
      refreshToken: expect.any(String),
      refreshTokenExpiresAt: expect.any(String),
      user: { email, displayName: 'Auth User' },
    });

    await request(server).get('/api/auth/me').expect(401);
    const me = await request(server).get('/api/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`).expect(200);
    expect(me.body).toMatchObject({ email, displayName: 'Auth User', emailVerified: true, hasPassword: true, providers: ['LOCAL'] });
    const meLog = await waitForActionLog(prisma, { kind: 'HTTP', route: '/api/auth/me' });
    expect(meLog.userId).toBe(login.body.user.id);

    const refresh = await request(server).post('/api/auth/refresh').send({ refreshToken: login.body.refreshToken }).expect(200);
    expect(refresh.body.refreshToken).not.toBe(login.body.refreshToken);
    await request(server).get('/api/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`).expect(200);

    const replay = await request(server).post('/api/auth/refresh').send({ refreshToken: login.body.refreshToken }).expect(401);
    expect(replay.body).toMatchObject({ code: 'REFRESH_TOKEN_REUSED' });
    const newestFails = await request(server).post('/api/auth/refresh').send({ refreshToken: refresh.body.refreshToken }).expect(401);
    expect(newestFails.body).toMatchObject({ code: 'REFRESH_TOKEN_REUSED' });
    const revokedAccess = await request(server).get('/api/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`).expect(401);
    expect(revokedAccess.body).toMatchObject({ code: 'SESSION_REVOKED' });

    // The client still sends its revoked access token; public routes must not be blocked by it.
    const relogin = await request(server).post('/api/auth/login')
      .set('Authorization', `Bearer ${login.body.accessToken}`).send({ email, password }).expect(200);
    await request(server).get('/api/auth/me').set('Authorization', `Bearer ${relogin.body.accessToken}`).expect(200);
  });

  it('returns HTML errors for expired verification tokens and resends only for unverified local accounts', async () => {
    const email = `verify-${Date.now()}@example.com`;
    const password = 'musicRoom42';
    await request(server).post('/api/auth/register').send({ email, password, displayName: 'Verify User' }).expect(201);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const expired = 'expired-verification-token';
    await prisma.emailToken.create({
      data: {
        userId: user.id,
        type: 'VERIFY_EMAIL',
        tokenHash: hashToken(expired),
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    const expiredResponse = await request(server).get(`/api/auth/verify?token=${expired}`).expect(400).expect('Content-Type', /html/);
    expect(expiredResponse.text).toContain('invalid, expired, or has already been used');

    mail.clearSentMail();
    await request(server).post('/api/auth/verify/resend').send({ email: `missing-${email}` }).expect(202);
    expect(mail.getSentMail()).toHaveLength(0);
    await request(server).post('/api/auth/verify/resend').send({ email }).expect(202);
    expect(mail.getSentMail()).toHaveLength(1);
    const verifyLink = extractVerifyLink(mail.getSentMail()[0].text);
    await request(server).get(verifyLink).expect(200);
    mail.clearSentMail();
    await request(server).post('/api/auth/verify/resend').send({ email }).expect(202);
    expect(mail.getSentMail()).toHaveLength(0);
  });

  it('handles forgot/reset password codes, attempt invalidation, and revokes existing sessions', async () => {
    const email = `reset-${Date.now()}@example.com`;
    const oldPassword = 'musicRoom42';
    const newPassword = 'newMusicRoom42';
    await request(server).post('/api/auth/password/forgot').send({ email: `missing-${email}` }).expect(200);
    expect(mail.getSentMail()).toHaveLength(0);

    const session = await createVerifiedSession(prisma, server, email, oldPassword);
    mail.clearSentMail();
    await request(server).post('/api/auth/password/forgot').send({ email }).expect(200);
    expect(mail.getSentMail()).toHaveLength(1);
    const firstCode = extractResetCode(mail.getSentMail()[0].text);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await request(server).post('/api/auth/password/reset')
        .send({ email, code: '000000', newPassword }).expect(400);
      expect(response.body).toMatchObject({ code: 'INVALID_RESET_CODE' });
    }
    const afterLockout = await request(server).post('/api/auth/password/reset')
      .send({ email, code: firstCode, newPassword }).expect(400);
    expect(afterLockout.body).toMatchObject({ code: 'INVALID_RESET_CODE' });

    mail.clearSentMail();
    await request(server).post('/api/auth/password/forgot').send({ email }).expect(200);
    const secondCode = extractResetCode(mail.getSentMail()[0].text);
    await request(server).post('/api/auth/password/reset').send({ email, code: secondCode, newPassword }).expect(200);
    await request(server).post('/api/auth/refresh').send({ refreshToken: session.refreshToken }).expect(401);
    const oldAccess = await request(server).get('/api/auth/me').set('Authorization', `Bearer ${session.accessToken}`).expect(401);
    expect(oldAccess.body).toMatchObject({ code: 'SESSION_REVOKED' });
    await request(server).post('/api/auth/login').send({ email, password: oldPassword }).expect(401);
    await request(server).post('/api/auth/login').send({ email, password: newPassword }).expect(200);
  });

  it('caps reset-code guesses even when they arrive in parallel', async () => {
    const email = `reset-race-${Date.now()}@example.com`;
    await createVerifiedSession(prisma, server, email);
    mail.clearSentMail();
    await request(server).post('/api/auth/password/forgot').send({ email }).expect(200);
    const code = extractResetCode(mail.getSentMail()[0].text);
    const wrong = code === '000000' ? '111111' : '000000';
    const burst = await Promise.all(Array.from({ length: 8 }, () =>
      request(server).post('/api/auth/password/reset').send({ email, code: wrong, newPassword: 'raceMusicRoom42' })));
    expect(burst.every((response) => response.status === 400)).toBe(true);
    const token = await prisma.emailToken.findFirstOrThrow({
      where: { user: { email }, type: 'RESET_PASSWORD' }, orderBy: { createdAt: 'desc' },
    });
    expect(token.attempts).toBeLessThanOrEqual(5);
    await request(server).post('/api/auth/password/reset').send({ email, code, newPassword: 'raceMusicRoom42' }).expect(400);
  });

  it('logs out one refresh-token family and all sessions', async () => {
    const email = `logout-${Date.now()}@example.com`;
    const first = await createVerifiedSession(prisma, server, email);
    await request(server).post('/api/auth/logout').send({ refreshToken: first.refreshToken }).expect(204);
    await request(server).post('/api/auth/logout').send({ refreshToken: 'unknown.bad' }).expect(204);
    await request(server).post('/api/auth/refresh').send({ refreshToken: first.refreshToken }).expect(401);

    const second = await request(server).post('/api/auth/login').send({ email, password: 'musicRoom42' }).expect(200);
    const third = await request(server).post('/api/auth/login').send({ email, password: 'musicRoom42' }).expect(200);
    await request(server).post('/api/auth/logout-all').set('Authorization', `Bearer ${second.body.accessToken}`).send({}).expect(204);
    await request(server).post('/api/auth/refresh').send({ refreshToken: second.body.refreshToken }).expect(401);
    await request(server).post('/api/auth/refresh').send({ refreshToken: third.body.refreshToken }).expect(401);
  });

  it('supports Google sign-in contract branches', async () => {
    const googleEmail = `google-${Date.now()}@example.com`;
    googleVerifier.verify.mockResolvedValue({ sub: 'google-sub-1', email: googleEmail, name: 'Google User' });
    const created = await request(server).post('/api/auth/google').send({ idToken: 'google-1' }).expect(200);
    expect(created.body.user).toMatchObject({ email: googleEmail, displayName: 'Google User' });
    const me = await request(server).get('/api/auth/me').set('Authorization', `Bearer ${created.body.accessToken}`).expect(200);
    expect(me.body).toMatchObject({ email: googleEmail, hasPassword: false, providers: ['GOOGLE'] });
    const same = await request(server).post('/api/auth/google').send({ idToken: 'google-1-again' }).expect(200);
    expect(same.body.user.id).toBe(created.body.user.id);

    const localEmail = `google-local-${Date.now()}@example.com`;
    await request(server).post('/api/auth/register').send({ email: localEmail, password: 'musicRoom42', displayName: 'Local' }).expect(201);
    googleVerifier.verify.mockResolvedValueOnce({ sub: 'google-sub-2', email: localEmail, name: 'Local Google' });
    const conflict = await request(server).post('/api/auth/google').send({ idToken: 'email-conflict' }).expect(409);
    expect(conflict.body).toMatchObject({ code: 'ACCOUNT_EXISTS_LINK_REQUIRED' });

    googleVerifier.verify.mockRejectedValueOnce(new GoogleIdTokenVerificationError('bad', 'invalid_token'));
    const invalid = await request(server).post('/api/auth/google').send({ idToken: 'bad' }).expect(401);
    expect(invalid.body).toMatchObject({ code: 'INVALID_GOOGLE_TOKEN' });

    await request(server).post('/api/auth/login').send({ email: googleEmail, password: 'not-a-real-password-1' }).expect(401);
  });

  it('links and unlinks Google accounts', async () => {
    const email = `link-${Date.now()}@example.com`;
    const local = await createVerifiedSession(prisma, server, email);
    googleVerifier.verify.mockResolvedValue({ sub: 'link-sub-1', email: `different-${email}`, name: 'Linked' });
    const linked = await request(server).post('/api/auth/link/google')
      .set('Authorization', `Bearer ${local.accessToken}`).send({ idToken: 'link-1' }).expect(200);
    expect(linked.body.providers).toEqual(['GOOGLE', 'LOCAL']);
    const idempotent = await request(server).post('/api/auth/link/google')
      .set('Authorization', `Bearer ${local.accessToken}`).send({ idToken: 'link-1' }).expect(200);
    expect(idempotent.body.providers).toEqual(['GOOGLE', 'LOCAL']);
    googleVerifier.verify.mockResolvedValueOnce({ sub: 'link-sub-second', email: `second-${email}`, name: 'Second' });
    const secondGoogle = await request(server).post('/api/auth/link/google')
      .set('Authorization', `Bearer ${local.accessToken}`).send({ idToken: 'link-second' }).expect(409);
    expect(secondGoogle.body).toMatchObject({ code: 'GOOGLE_ALREADY_LINKED' });
    const googleLogin = await request(server).post('/api/auth/google').send({ idToken: 'link-1' }).expect(200);
    expect(googleLogin.body.user.id).toBe(local.user.id);

    googleVerifier.verify.mockResolvedValueOnce({ sub: 'owned-by-google-user', email: `owner-${email}`, name: 'Owner' });
    await request(server).post('/api/auth/google').send({ idToken: 'owner' }).expect(200);
    googleVerifier.verify.mockResolvedValueOnce({ sub: 'owned-by-google-user', email: `owner-${email}`, name: 'Owner' });
    const alreadyLinked = await request(server).post('/api/auth/link/google')
      .set('Authorization', `Bearer ${local.accessToken}`).send({ idToken: 'owner' }).expect(409);
    expect(alreadyLinked.body).toMatchObject({ code: 'GOOGLE_ALREADY_LINKED' });

    const unlinked = await request(server).delete('/api/auth/link/google')
      .set('Authorization', `Bearer ${local.accessToken}`).send({}).expect(200);
    expect(unlinked.body.providers).toEqual(['LOCAL']);
    const missing = await request(server).delete('/api/auth/link/google')
      .set('Authorization', `Bearer ${local.accessToken}`).send({}).expect(404);
    expect(missing.body).toMatchObject({ code: 'GOOGLE_NOT_LINKED' });

    googleVerifier.verify.mockResolvedValueOnce({ sub: 'google-only-unlink', email: `google-only-${email}`, name: 'Google Only' });
    const googleOnly = await request(server).post('/api/auth/google').send({ idToken: 'google-only' }).expect(200);
    const passwordRequired = await request(server).delete('/api/auth/link/google')
      .set('Authorization', `Bearer ${googleOnly.body.accessToken}`).send({}).expect(400);
    expect(passwordRequired.body).toMatchObject({ code: 'PASSWORD_REQUIRED_TO_UNLINK' });
  });

  it('rejects a weak password at registration with the policy message', async () => {
    const weak = await request(server).post('/api/auth/register')
      .send({ email: `weak-${Date.now()}@example.com`, password: 'short', displayName: 'Weak' }).expect(400);
    expect(JSON.stringify(weak.body.message)).toContain('password must be 10-128 chars');
  });

  it('allows only one concurrent refresh with the same token', async () => {
    const { refreshToken } = await createVerifiedSession(prisma, server, `race-${Date.now()}@example.com`);
    const results = await Promise.all([
      request(server).post('/api/auth/refresh').send({ refreshToken }),
      request(server).post('/api/auth/refresh').send({ refreshToken }),
    ]);
    expect(results.map((response) => response.status).sort()).toEqual([200, 401]);
    expect(results.find((response) => response.status === 401)?.body.code).toBe('REFRESH_TOKEN_REUSED');
  });

  it('rejects every discovered non-public route without a bearer token', async () => {
    const protectedRoutes = discoverControllerRoutes(app).filter((route) => !route.isPublic);
    expect(protectedRoutes.map((route) => `${route.method} ${route.path}`)).toContain('GET /api/auth/me');
    for (const route of protectedRoutes) {
      await request(server)[route.method.toLowerCase() as 'get' | 'post' | 'delete' | 'patch'](route.path).send({}).expect(401);
    }
  });

  it('returns a consistent JSON 404', async () => {
    const response = await request(server).post('/api/health').send({}).expect(404);
    expect(response.body).toMatchObject({ statusCode: 404, error: 'Not Found', path: '/api/health' });
    expect(response.body).not.toHaveProperty('stack');
  });

  it('allows configured browser origins and excludes other origins', async () => {
    await request(server).get('/api/health').set('Origin', 'http://localhost:8081')
      .expect('Access-Control-Allow-Origin', 'http://localhost:8081').expect(200);
    const response = await request(server).get('/api/health').set('Origin', 'https://untrusted.example').expect(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});

async function waitForActionLog(prisma: PrismaService, where: { kind: 'HTTP' | 'CLIENT' | 'SOCKET'; route?: string }) {
  const rows = await waitForActionLogCount(prisma, where.kind, 1, where.route);
  return rows[0];
}

async function waitForActionLogCount(prisma: PrismaService, kind: 'HTTP' | 'CLIENT' | 'SOCKET', count: number, route?: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const rows = await prisma.actionLog.findMany({ where: { kind, route }, orderBy: { id: 'desc' } });
    if (rows.length >= count) return rows;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return prisma.actionLog.findMany({ where: { kind, route }, orderBy: { id: 'desc' } });
}

function stripVolatileError(body: Record<string, unknown>): Record<string, unknown> {
  const stable = { ...body };
  delete stable.timestamp;
  return stable;
}

function extractVerifyLink(text: string): string {
  const match = text.match(/http:\/\/localhost:3000(\/api\/auth\/verify\?token=[A-Za-z0-9_-]+)/);
  if (!match) throw new Error(`No verification link found in ${text}`);
  return match[1];
}

function extractResetCode(text: string): string {
  const match = text.match(/\b(\d{6})\b/);
  if (!match) throw new Error(`No reset code found in ${text}`);
  return match[1];
}

// RequestMethod values from @nestjs/common: GET=0, POST=1, DELETE=3, PATCH=4.
const ROUTE_METHODS: Partial<Record<number, DiscoveredRoute['method']>> = { 0: 'GET', 1: 'POST', 3: 'DELETE', 4: 'PATCH' };

interface DiscoveredRoute {
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  path: string;
  isPublic: boolean;
}

function discoverControllerRoutes(app: INestApplication): DiscoveredRoute[] {
  const modules = app.get(ModulesContainer);
  const reflector = app.get(Reflector);
  const routes: DiscoveredRoute[] = [];
  for (const moduleRef of modules.values()) {
    for (const wrapper of moduleRef.controllers.values()) {
      const instance = wrapper.instance as object | undefined;
      if (!instance) continue;
      const controller = instance.constructor;
      const controllerPath = pathValue(Reflect.getMetadata(PATH_METADATA, controller));
      const controllerPublic = reflector.get<boolean>(IS_PUBLIC_KEY, controller) ?? false;
      for (const property of Object.getOwnPropertyNames(Object.getPrototypeOf(instance))) {
        if (property === 'constructor') continue;
        const handler = (instance as Record<string, unknown>)[property];
        if (typeof handler !== 'function') continue;
        const routePath = pathValue(Reflect.getMetadata(PATH_METADATA, handler));
        const method = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
        if (routePath === undefined || method === undefined) continue;
        const name = ROUTE_METHODS[method];
        if (!name) continue;
        routes.push({
          method: name,
          path: joinApiPath(controllerPath, routePath),
          isPublic: reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, controller]) ?? controllerPublic,
        });
      }
    }
  }
  return routes;
}

function pathValue(value: unknown): string | undefined {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return typeof value === 'string' ? value : undefined;
}

function joinApiPath(controllerPath = '', routePath = ''): string {
  return `/${['api', controllerPath, routePath].filter(Boolean).join('/')}`.replace(/\/+/g, '/');
}
