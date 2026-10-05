import { Module } from '@nestjs/common';
import { AppConfigModule } from './core/config/app-config.module';
import { PrismaModule } from './core/database/prisma.module';
import { LoggingModule } from './core/logging/logging.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { LogsModule } from './modules/logs/logs.module';

@Module({ imports: [AppConfigModule, PrismaModule, LoggingModule, HealthModule, LogsModule, AuthModule] })
export class AppModule {}
