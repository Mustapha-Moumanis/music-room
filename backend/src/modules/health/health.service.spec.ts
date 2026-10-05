import { PrismaService } from '../../core/database/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports the database as up when SELECT 1 succeeds', async () => {
    const service = new HealthService({ $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) } as unknown as PrismaService);
    await expect(service.getHealth()).resolves.toMatchObject({ status: 'ok', db: 'up' });
  });

  it('reports degraded status when the database query fails', async () => {
    const service = new HealthService({ $queryRaw: jest.fn().mockRejectedValue(new Error('down')) } as unknown as PrismaService);
    await expect(service.getHealth()).resolves.toMatchObject({ status: 'degraded', db: 'down' });
  });
});
