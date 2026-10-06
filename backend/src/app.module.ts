import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppConfigService } from './core/config/app-config.service';
import { AppConfigModule } from './core/config/app-config.module';
import { PrismaModule } from './core/database/prisma.module';
import { LoggingModule } from './core/logging/logging.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { LogsModule } from './modules/logs/logs.module';

@Module({
  imports: [
    AppConfigModule,
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => [{
        ttl: config.get('THROTTLE_TTL_MS'),
        limit: config.get('THROTTLE_LIMIT'),
      }],
    }),
    PrismaModule,
    LoggingModule,
    HealthModule,
    LogsModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
