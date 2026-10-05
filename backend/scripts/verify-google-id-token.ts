import { config as loadEnv } from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import { resolve } from 'node:path';

loadEnv({ path: resolve(__dirname, '../../.env') });
loadEnv({ path: resolve(__dirname, '../.env') });

async function main(): Promise<void> {
  const idToken = process.argv[2];
  const audience = process.env.GOOGLE_WEB_CLIENT_ID;
  if (!idToken) throw new Error('Usage: npm run google:verify -- <idToken>');
  if (!audience) throw new Error('GOOGLE_WEB_CLIENT_ID is not configured');

  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({ idToken, audience });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Google token payload is empty');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) throw new Error(`Untrusted issuer: ${payload.iss}`);
  if (payload.email_verified !== true) throw new Error('Google email is not verified');

  console.log(JSON.stringify({
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    iss: payload.iss,
    aud: payload.aud,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
