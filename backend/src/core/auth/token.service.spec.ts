import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service';
import { TokenService } from './token.service';

describe('TokenService', () => {
  const config = {
    get: jest.fn((key: string) => ({
      JWT_ACCESS_SECRET: 'unit-access-secret',
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL: '30d',
    })[key]),
  } as unknown as AppConfigService;
  const service = new TokenService(config, new JwtService());

  it('signs and verifies access tokens with access claims', () => {
    const signed = service.signAccessToken('user-1', 'family-1');
    expect(signed.accessTokenExpiresIn).toBe(900);
    expect(service.verifyAccessToken(signed.accessToken)).toEqual({ sub: 'user-1', sid: 'family-1', typ: 'access' });
  });

  it('issues opaque refresh tokens and stores only secret hashes', () => {
    const issued = service.issueRefreshToken(new Date('2026-01-01T00:00:00.000Z'));
    const parsed = service.parseRefreshToken(issued.token);
    expect(parsed).toEqual({ id: issued.id, secret: expect.any(String) });
    expect(issued.secretHash).toBe(service.hashRefreshSecret(parsed?.secret ?? ''));
    expect(issued.token).not.toContain(issued.secretHash);
    expect(issued.expiresAt.toISOString()).toBe('2026-01-31T00:00:00.000Z');
  });

  it('rejects malformed refresh token formats', () => {
    expect(service.parseRefreshToken('missing-dot')).toBeUndefined();
    expect(service.parseRefreshToken('id.too.short')).toBeUndefined();
    expect(service.parseRefreshToken('id.short')).toBeUndefined();
  });
});

