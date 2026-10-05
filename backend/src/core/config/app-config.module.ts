import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AppConfigService } from './app-config.service';
import { validate } from './env.validation';

@Global()
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [resolve(process.cwd(), '../.env'), resolve(process.cwd(), '.env')],
    ignoreEnvFile: process.env.NODE_ENV === 'test',
    skipProcessEnv: true,
    validate,
  })],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
