import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ActionLogKind } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppConfigService } from './core/config/app-config.service';
import { PrismaService } from './core/database/prisma.service';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { ActionLogService } from './core/logging/action-log.service';
import { extractClientInfo } from './core/logging/client-info';

export function configureApp(app: INestApplication): void {
  const config = app.get(AppConfigService);
  app.setGlobalPrefix('api');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        // Avoid upgrading local HTTP Swagger assets to HTTPS in development.
        upgradeInsecureRequests: config.get('NODE_ENV') === 'production' ? [] : null,
      },
    },
  }));
  app.enableCors({
    origin: config.get('CORS_ORIGINS'),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();
  const prisma = app.get(PrismaService, { strict: false });
  void prisma?.enableShutdownHooks?.(app);

  const options = new DocumentBuilder().setTitle('Music Room API').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, options);
  const actionLogs = app.get(ActionLogService, { strict: false });
  app.use('/api/docs-json', (req: Request, res: Response, next: NextFunction) => {
    const started = Date.now();
    res.on('finish', () => {
      const info = extractClientInfo(req.headers);
      actionLogs.record({
        kind: ActionLogKind.HTTP,
        action: `${req.method} /api/docs-json`,
        method: req.method,
        route: '/api/docs-json',
        statusCode: res.statusCode,
        durationMs: Date.now() - started,
        ip: req.ip,
        platform: info.platform,
        device: info.device,
        appVersion: info.appVersion,
        requestId: info.requestId,
      });
    });
    next();
  });
  SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/docs-json' });
}
