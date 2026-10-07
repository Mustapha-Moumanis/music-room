import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/core/database/prisma.service';
import { createVerifiedSession, TestSession, uniqueEmail } from './helpers';

describe('Profiles (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
  });

  afterAll(async () => { await app?.close(); });

  const signUp = (prefix: string, displayName: string): Promise<TestSession> =>
    createVerifiedSession(prisma, server, uniqueEmail(prefix), 'musicRoom42', displayName);

  describe('/users/me', () => {
    it('returns every profile group, empty for a new account', async () => {
      const email = uniqueEmail('me');
      const session = await createVerifiedSession(prisma, server, email, 'musicRoom42', 'Ana');
      const response = await request(server).get('/api/users/me').auth(session.accessToken, { type: 'bearer' }).expect(200);
      expect(response.body).toEqual({
        id: session.user.id,
        email,
        public: { displayName: 'Ana', bio: null, avatarUrl: null },
        friends: { realName: null, city: null },
        private: { birthDate: null, phone: null },
        music: { genres: [], tags: [], visibility: 'PUBLIC' },
      });
    });

    it('updates every group and keeps /auth/me in sync with the display name', async () => {
      const session = await signUp('update', 'Ana');
      const patch = {
        public: { displayName: '  DJ Ana ', bio: 'Vinyl digger', avatarUrl: 'https://example.com/ana.png' },
        friends: { realName: 'Ana Lopez', city: 'Casablanca' },
        private: { birthDate: '1999-04-21', phone: '+212 600 000 000' },
        music: { genres: ['house', 'jazz'], tags: [' Road Trip ', '90s'], visibility: 'FRIENDS' },
      };
      const updated = await request(server).patch('/api/users/me').auth(session.accessToken, { type: 'bearer' })
        .send(patch).expect(200);
      expect(updated.body).toMatchObject({
        public: { displayName: 'DJ Ana', bio: 'Vinyl digger', avatarUrl: 'https://example.com/ana.png' },
        friends: { realName: 'Ana Lopez', city: 'Casablanca' },
        private: { birthDate: '1999-04-21', phone: '+212 600 000 000' },
        music: { genres: ['house', 'jazz'], tags: ['road trip', '90s'], visibility: 'FRIENDS' },
      });

      const read = await request(server).get('/api/users/me').auth(session.accessToken, { type: 'bearer' }).expect(200);
      expect(read.body).toEqual(updated.body);
      const me = await request(server).get('/api/auth/me').auth(session.accessToken, { type: 'bearer' }).expect(200);
      expect(me.body.displayName).toBe('DJ Ana');
    });

    it('changes only the fields sent; null or an empty string clears a field', async () => {
      const session = await signUp('partial', 'Ana');
      await request(server).patch('/api/users/me').auth(session.accessToken, { type: 'bearer' })
        .send({ public: { bio: 'Hello' }, friends: { realName: 'Ana Lopez', city: 'Rabat' } }).expect(200);

      const response = await request(server).patch('/api/users/me').auth(session.accessToken, { type: 'bearer' })
        .send({ friends: { city: null }, public: { bio: '   ' } }).expect(200);
      expect(response.body.public).toEqual({ displayName: 'Ana', bio: null, avatarUrl: null });
      expect(response.body.friends).toEqual({ realName: 'Ana Lopez', city: null });
    });

    it.each([
      ['an unknown top-level field', { role: 'admin' }, 'property role should not exist'],
      ['an unknown nested field', { private: { email: 'x@example.com' } }, 'private.property email should not exist'],
      ['a null display name', { public: { displayName: null } }, 'public.displayName must be a string'],
      ['an empty display name', { public: { displayName: '  ' } }, 'public.displayName must be longer than or equal to 1 characters'],
      ['a non-URL avatar', { public: { avatarUrl: 'not a url' } }, 'public.avatarUrl must be a URL address'],
      ['an impossible birth date', { private: { birthDate: '2001-02-30' } }, 'private.birthDate must be a real past date formatted YYYY-MM-DD'],
      ['a future birth date', { private: { birthDate: '2999-01-01' } }, 'private.birthDate must be a real past date formatted YYYY-MM-DD'],
      ['a phone with letters', { private: { phone: 'call me' } }, 'private.phone must contain 6-20 digits, spaces or + ( ) . -'],
      ['an unknown genre', { music: { genres: ['polka'] } }, expect.stringContaining('music.each value in genres must be one of')],
      ['duplicate tags after normalising', { music: { tags: ['Rock', 'rock '] } }, 'music.All tags\'s elements must be unique'],
      ['too many tags', { music: { tags: Array.from({ length: 11 }, (_, i) => `tag${i}`) } }, 'music.tags must contain no more than 10 elements'],
      ['an unknown visibility', { music: { visibility: 'EVERYONE' } }, expect.stringContaining('music.visibility must be one of')],
      ['a group that is not an object', { public: 'Ana' }, expect.stringContaining('public')],
    ])('rejects %s with 400', async (_case, body, message) => {
      const session = await signUp('invalid', 'Ana');
      const response = await request(server).patch('/api/users/me').auth(session.accessToken, { type: 'bearer' })
        .send(body).expect(400);
      expect(response.body.message).toEqual(expect.arrayContaining([message]));
    });

    it('lists the accepted genres', async () => {
      const session = await signUp('genres', 'Ana');
      const response = await request(server).get('/api/users/genres').auth(session.accessToken, { type: 'bearer' }).expect(200);
      expect(response.body.genres).toEqual(expect.arrayContaining(['house', 'jazz', 'rock']));
    });
  });
});
