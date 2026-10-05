import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: AppConfigService) {
    const adapter = new PrismaPg({ connectionString: config.get('DATABASE_URL') });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: { close: () => Promise<void> }): Promise<void> {
    process.once('beforeExit', () => {
      void app.close().catch((error: unknown) => {
        this.logger.error('Failed to close Nest app during Prisma shutdown', error instanceof Error ? error.stack : String(error));
      });
    });
  }
}
