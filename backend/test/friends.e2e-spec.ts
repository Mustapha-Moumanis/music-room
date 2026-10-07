import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/core/database/prisma.service';
import { createVerifiedSession, TestSession, uniqueEmail } from './helpers';

describe('Friends and user search (e2e)', () => {
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

  const signUp = (displayName: string): Promise<TestSession> =>
    createVerifiedSession(prisma, server, uniqueEmail('friend'), 'musicRoom42', displayName);
  const as = (session: TestSession) => ({
    get: (path: string) => request(server).get(`/api${path}`).auth(session.accessToken, { type: 'bearer' }),
    post: (path: string) => request(server).post(`/api${path}`).auth(session.accessToken, { type: 'bearer' }),
    delete: (path: string) => request(server).delete(`/api${path}`).auth(session.accessToken, { type: 'bearer' }),
  });
  const pairRows = (a: string, b: string) => prisma.friendship.findMany({
    where: { OR: [{ requesterId: a, addresseeId: b }, { requesterId: b, addresseeId: a }] },
  });

  describe('GET /users/search', () => {
    it('matches display names case-insensitively, excluding me and unverified accounts', async () => {
      const tag = randomUUID().slice(0, 6);
      const me = await signUp(`Seeker ${tag}`);
      const ana = await signUp(`Ana ${tag}`);
      const anabel = await signUp(`ANABEL ${tag}`);
      await request(server).post('/api/auth/register')
        .send({ email: uniqueEmail('unverified'), password: 'musicRoom42', displayName: `Anais ${tag}` }).expect(201);
      await as(me).post(`/friends/requests/${anabel.user.id}`).expect(200);

      const response = await as(me).get(`/users/search?q=ana ${tag}`).expect(200);
      expect(response.body).toEqual([
        { id: ana.user.id, displayName: `Ana ${tag}`, avatarUrl: null, relationship: 'NONE' },
      ]);
      const broad = await as(me).get(`/users/search?q=${tag}`).expect(200);
      expect(broad.body.map((user: { displayName: string; relationship: string }) => [user.displayName, user.relationship])).toEqual([
        [`Ana ${tag}`, 'NONE'],
        [`ANABEL ${tag}`, 'REQUEST_SENT'],
      ]);
    });

    it('rejects a missing or too short query', async () => {
      const me = await signUp('Short Query');
      await as(me).get('/users/search').expect(400);
      await as(me).get('/users/search?q=%20a%20').expect(400);
    });
  });

  describe('/friends', () => {
    it('request then accept makes the friendship symmetric', async () => {
      const ana = await signUp('Ana Friend');
      const ben = await signUp('Ben Friend');

      await as(ana).post(`/friends/requests/${ben.user.id}`).expect(200, { userId: ben.user.id, relationship: 'REQUEST_SENT' });
      const anaRequests = await as(ana).get('/friends/requests').expect(200);
      expect(anaRequests.body).toEqual({
        incoming: [],
        outgoing: [{ user: { id: ben.user.id, displayName: 'Ben Friend', avatarUrl: null }, createdAt: expect.any(String) }],
      });
      const benRequests = await as(ben).get('/friends/requests').expect(200);
      expect(benRequests.body.incoming).toEqual([
        { user: { id: ana.user.id, displayName: 'Ana Friend', avatarUrl: null }, createdAt: expect.any(String) },
      ]);
      await as(ana).get('/friends').expect(200, []);

      await as(ben).post(`/friends/requests/${ana.user.id}/accept`).expect(200, { userId: ana.user.id, relationship: 'FRIENDS' });
      const anaFriends = await as(ana).get('/friends').expect(200);
      const benFriends = await as(ben).get('/friends').expect(200);
      expect(anaFriends.body).toEqual([{ id: ben.user.id, displayName: 'Ben Friend', avatarUrl: null, since: expect.any(String) }]);
      expect(benFriends.body).toEqual([{ id: ana.user.id, displayName: 'Ana Friend', avatarUrl: null, since: expect.any(String) }]);
      await as(ben).get('/friends/requests').expect(200, { incoming: [], outgoing: [] });

      // Accepting again, or asking again once friends, changes nothing.
      await as(ben).post(`/friends/requests/${ana.user.id}/accept`).expect(200, { userId: ana.user.id, relationship: 'FRIENDS' });
      await as(ana).post(`/friends/requests/${ben.user.id}`).expect(200, { userId: ben.user.id, relationship: 'FRIENDS' });
      expect(await pairRows(ana.user.id, ben.user.id)).toHaveLength(1);
    });

    it('treats duplicate requests as one, even in parallel', async () => {
      const ana = await signUp('Ana Dup');
      const ben = await signUp('Ben Dup');
      const responses = await Promise.all(Array.from({ length: 5 }, () => as(ana).post(`/friends/requests/${ben.user.id}`)));
      expect(responses.map((response) => [response.status, response.body.relationship])).toEqual(
        Array.from({ length: 5 }, () => [200, 'REQUEST_SENT']),
      );
      expect(await pairRows(ana.user.id, ben.user.id)).toHaveLength(1);
    });

    it('turns crossed requests into one friendship, even when they race', async () => {
      const ana = await signUp('Ana Cross');
      const ben = await signUp('Ben Cross');
      await Promise.all([
        ...Array.from({ length: 3 }, () => as(ana).post(`/friends/requests/${ben.user.id}`).expect(200)),
        ...Array.from({ length: 3 }, () => as(ben).post(`/friends/requests/${ana.user.id}`).expect(200)),
      ]);
      const rows = await pairRows(ana.user.id, ben.user.id);
      expect(rows).toHaveLength(1);
      expect(rows[0].status).toBe('ACCEPTED');
    });

    it('declines, cancels and removes, each idempotently', async () => {
      const ana = await signUp('Ana Undo');
      const ben = await signUp('Ben Undo');

      await as(ana).post(`/friends/requests/${ben.user.id}`).expect(200);
      await as(ben).post(`/friends/requests/${ana.user.id}/decline`).expect(204);
      await as(ben).post(`/friends/requests/${ana.user.id}/decline`).expect(204);
      expect(await pairRows(ana.user.id, ben.user.id)).toHaveLength(0);

      await as(ana).post(`/friends/requests/${ben.user.id}`).expect(200);
      await as(ana).delete(`/friends/requests/${ben.user.id}`).expect(204);
      await as(ana).delete(`/friends/requests/${ben.user.id}`).expect(204);
      expect(await pairRows(ana.user.id, ben.user.id)).toHaveLength(0);

      await as(ana).post(`/friends/requests/${ben.user.id}`).expect(200);
      await as(ben).post(`/friends/requests/${ana.user.id}/accept`).expect(200);
      await as(ben).delete(`/friends/${ana.user.id}`).expect(204);
      await as(ben).delete(`/friends/${ana.user.id}`).expect(204);
      await as(ana).get('/friends').expect(200, []);
      await as(ben).get('/friends').expect(200, []);
    });

    it('does not let a request recipient be removed as a friend or the sender accept their own request', async () => {
      const ana = await signUp('Ana Edge');
      const ben = await signUp('Ben Edge');
      await as(ana).post(`/friends/requests/${ben.user.id}`).expect(200);

      const ownAccept = await as(ana).post(`/friends/requests/${ben.user.id}/accept`).expect(404);
      expect(ownAccept.body.code).toBe('FRIEND_REQUEST_NOT_FOUND');
      await as(ana).delete(`/friends/${ben.user.id}`).expect(204);
      expect(await pairRows(ana.user.id, ben.user.id)).toEqual([expect.objectContaining({ status: 'PENDING' })]);
    });

    it('rejects requests to myself, unknown users and unverified accounts', async () => {
      const ana = await signUp('Ana Invalid');
      const self = await as(ana).post(`/friends/requests/${ana.user.id}`).expect(400);
      expect(self.body.code).toBe('CANNOT_FRIEND_SELF');

      const unknown = await as(ana).post('/friends/requests/does-not-exist').expect(404);
      expect(unknown.body.code).toBe('USER_NOT_FOUND');

      const email = uniqueEmail('unverified');
      await request(server).post('/api/auth/register').send({ email, password: 'musicRoom42', displayName: 'Pending' }).expect(201);
      const pending = await prisma.user.findUniqueOrThrow({ where: { email } });
      await as(ana).post(`/friends/requests/${pending.id}`).expect(404);

      const noRequest = await as(ana).post(`/friends/requests/${pending.id}/accept`).expect(404);
      expect(noRequest.body.code).toBe('FRIEND_REQUEST_NOT_FOUND');
    });
  });
});
