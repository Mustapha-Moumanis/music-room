import { HttpStatus } from '@nestjs/common';
import { TokenService } from '../../core/auth/token.service';
import { PrismaService } from '../../core/database/prisma.service';
import { AuthService } from './auth.service';
import { EmailVerificationNotifier } from './email-verification-notifier';

describe('AuthService refresh rotation', () => {
  const req = { headers: { 'user-agent': 'jest', 'x-device': 'unit' }, ip: '127.0.0.1' } as never;
  let tokens: jest.Mocked<Pick<TokenService, 'parseRefreshToken' | 'hashRefreshSecret' | 'issueRefreshToken' | 'signAccessToken'>>;

  beforeEach(() => {
    tokens = {
      parseRefreshToken: jest.fn().mockReturnValue({ id: 'old-id', secret: 'secret' }),
      hashRefreshSecret: jest.fn().mockReturnValue('hash'),
      issueRefreshToken: jest.fn().mockReturnValue({
        id: 'new-id',
        secretHash: 'new-hash',
        token: 'new-id.new-secret',
        expiresAt: new Date('2026-02-01T00:00:00.000Z'),
      }),
      signAccessToken: jest.fn().mockReturnValue({ accessToken: 'access', accessTokenExpiresIn: 900 }),
    };
  });

  it('rotates an active refresh token in one transaction', async () => {
    const tx = transactionClient({ replacedById: null, revokedAt: null });
    const prisma = prismaWithTransaction(tx);
    const service = new AuthService(prisma, tokens as unknown as TokenService, notifier());

    await expect(service.refresh('old-id.secret', req)).resolves.toEqual({
      accessToken: 'access',
      accessTokenExpiresIn: 900,
      refreshToken: 'new-id.new-secret',
      refreshTokenExpiresAt: '2026-02-01T00:00:00.000Z',
    });
    expect(tx.refreshToken.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ id: 'new-id', familyId: 'family-1' }) }));
    expect(tx.refreshToken.update).toHaveBeenCalledWith({ where: { id: 'old-id' }, data: { replacedById: 'new-id' } });
  });

  it('revokes the family when a rotated token is reused', async () => {
    const tx = transactionClient({ replacedById: 'new-id', revokedAt: null });
    const service = new AuthService(prismaWithTransaction(tx), tokens as unknown as TokenService, notifier());

    await expect(service.refresh('old-id.secret', req)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
      response: expect.objectContaining({ code: 'REFRESH_TOKEN_REUSED' }),
    });
    expect(tx.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { familyId: 'family-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});

function transactionClient(overrides: { replacedById: string | null; revokedAt: Date | null }) {
  return {
    $queryRaw: jest.fn().mockResolvedValue([{
      id: 'old-id',
      tokenHash: 'hash',
      familyId: 'family-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: overrides.revokedAt,
      replacedById: overrides.replacedById,
    }]),
    refreshToken: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
}

function prismaWithTransaction(tx: ReturnType<typeof transactionClient>): PrismaService {
  return {
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
  } as unknown as PrismaService;
}

function notifier(): EmailVerificationNotifier {
  return { notify: jest.fn() } as unknown as EmailVerificationNotifier;
}
