import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { AppConfigService } from '../config/app-config.service';
import { ActionLogInterceptor } from './action-log.interceptor';
import { ActionLogService } from './action-log.service';
import { pinoRedactPaths } from './redaction';
import { WsActionLogInterceptor } from './ws-action-log.interceptor';

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL'),
          genReqId: (req) => {
            const header = req.headers['x-request-id'];
            return (Array.isArray(header) ? header[0] : header) || randomUUID();
          },
          redact: { paths: pinoRedactPaths, censor: '[Redacted]' },
          transport: config.get('NODE_ENV') === 'development'
            ? { target: 'pino-pretty', options: { singleLine: true, colorize: false } }
            : undefined,
        },
      }),
    }),
  ],
  providers: [
    ActionLogService,
    WsActionLogInterceptor,
    { provide: APP_INTERCEPTOR, useClass: ActionLogInterceptor },
  ],
  exports: [ActionLogService, WsActionLogInterceptor],
})
export class LoggingModule {}
