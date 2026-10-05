import { Module } from '@nestjs/common';
import { AppConfigModule } from './core/config/app-config.module';
import { HealthModule } from './modules/health/health.module';

@Module({ imports: [AppConfigModule, HealthModule] })
export class AppModule {}
