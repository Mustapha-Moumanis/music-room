import { execFileSync } from 'node:child_process';
import { Client } from 'pg';
import { testEnv } from './setup-env';

function adminUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  url.pathname = '/postgres';
  return url.toString();
}

export default async function globalSetup(): Promise<void> {
  Object.assign(process.env, testEnv);
  const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('TEST_DATABASE_URL or DATABASE_URL is required for e2e tests');

  const target = new URL(databaseUrl);
  const dbName = target.pathname.slice(1);
  const admin = new Client({ connectionString: adminUrl(databaseUrl) });
  await admin.connect();
  const exists = await admin.query('select 1 from pg_database where datname = $1', [dbName]);
  if (exists.rowCount === 0) {
    await admin.query(`create database "${dbName.replace(/"/g, '""')}"`);
  }
  await admin.end();

  const targetClient = new Client({ connectionString: databaseUrl });
  await targetClient.connect();
  await targetClient.query('drop schema if exists public cascade');
  await targetClient.query('create schema public');
  await targetClient.end();

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
}
