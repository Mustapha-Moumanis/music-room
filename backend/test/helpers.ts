import { randomUUID } from 'node:crypto';
import { Server } from 'node:http';
import request from 'supertest';
import { PrismaService } from '../src/core/database/prisma.service';

export interface TestSession {
  accessToken: string;
  refreshToken: string;
  user: { id: string };
}

export async function createVerifiedSession(
  prisma: PrismaService, server: Server, email: string, password = 'musicRoom42', displayName = 'Race User',
): Promise<TestSession> {
  await request(server).post('/api/auth/register').send({ email, password, displayName }).expect(201);
  await prisma.user.update({ where: { email }, data: { emailVerifiedAt: new Date() } });
  const login = await request(server).post('/api/auth/login').send({ email, password }).expect(200);
  return login.body as TestSession;
}

/** Unique per call so spec files can share one database without clashing on emails. */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}@example.com`;
}
