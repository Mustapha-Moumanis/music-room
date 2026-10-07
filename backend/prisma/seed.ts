import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, IdentityProvider } from '@prisma/client';
import argon2 from 'argon2';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(__dirname, '../../.env') });
loadEnv({ path: resolve(__dirname, '../.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function upsertDemoUser(email: string, displayName: string, password: string): Promise<string> {
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const user = await prisma.user.upsert({
    where: { email },
    update: { displayName, passwordHash, emailVerifiedAt: new Date() },
    create: {
      email,
      displayName,
      passwordHash,
      emailVerifiedAt: new Date(),
      identities: { create: { provider: IdentityProvider.LOCAL, providerId: email } },
      profile: {
        create: {
          bio: `${displayName} is a demo listener.`,
          musicGenres: ['house', 'pop'],
        },
      },
    },
  });
  await prisma.identity.upsert({
    where: { provider_providerId: { provider: IdentityProvider.LOCAL, providerId: email } },
    update: { userId: user.id },
    create: { provider: IdentityProvider.LOCAL, providerId: email, userId: user.id },
  });
  return user.id;
}

async function main(): Promise<void> {
  const users = await Promise.all([
    upsertDemoUser('demo1@musicroom.local', 'Demo One', 'Password123!'),
    upsertDemoUser('demo2@musicroom.local', 'Demo Two', 'Password123!'),
  ]);
  console.log(`Seeded demo users: ${users.join(', ')}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
