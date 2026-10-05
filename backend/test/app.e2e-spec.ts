import { Body, Controller, Get, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString } from 'class-validator';
import request from 'supertest';
import { Server } from 'node:http';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/core/database/prisma.service';

class TestDto {
  @IsString()
  name!: string;
}

@Controller('test')
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

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule], controllers: [TestController],
    }).compile();
    app = module.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
  });

  afterAll(async () => { await app?.close(); });

  beforeEach(async () => {
    await prisma.actionLog.deleteMany();
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
            { action: 'screen_view', meta: { screen: 'home', password: 'super-secret' } },
            { action: 'play', meta: { token: 'client-token', nested: { accessToken: 'access-token' } } },
          ],
        })
        .expect(202, { accepted: 2 });

      const rows = await waitForActionLogCount(prisma, 'CLIENT', 2);
      expect(rows).toHaveLength(2);
      expect(JSON.stringify(rows.map((row) => row.meta))).not.toMatch(/super-secret|client-token|access-token/);
      expect(JSON.stringify(rows.map((row) => row.meta))).toContain('[Redacted]');
      expect(written.join('')).not.toMatch(/super-secret|client-token|access-token/);
    } finally {
      stdout.mockRestore();
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

async function waitForActionLog(prisma: PrismaService, where: { kind: 'HTTP' | 'CLIENT' | 'SOCKET' }) {
  const rows = await waitForActionLogCount(prisma, where.kind, 1);
  return rows[0];
}

async function waitForActionLogCount(prisma: PrismaService, kind: 'HTTP' | 'CLIENT' | 'SOCKET', count: number) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const rows = await prisma.actionLog.findMany({ where: { kind }, orderBy: { id: 'desc' } });
    if (rows.length >= count) return rows;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return prisma.actionLog.findMany({ where: { kind }, orderBy: { id: 'desc' } });
}
