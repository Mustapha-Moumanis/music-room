import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { HealthResponseDto } from './health-response.dto';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<HealthResponseDto> {
    const base = { uptime: process.uptime(), timestamp: new Date().toISOString() };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'up', ...base };
    } catch {
      return { status: 'degraded', db: 'down', ...base };
    }
  }
}
