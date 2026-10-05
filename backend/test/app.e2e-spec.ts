import { Body, Controller, Get, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString } from 'class-validator';
import request from 'supertest';
import { Server } from 'node:http';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

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

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule], controllers: [TestController],
    }).compile();
    app = module.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => { await app?.close(); });

  it('serves health without an Origin header (native mobile)', async () => {
    const response = await request(server).get('/api/health').expect(200);
    expect(response.body).toEqual({ status: 'ok', uptime: expect.any(Number), timestamp: expect.any(String) });
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
