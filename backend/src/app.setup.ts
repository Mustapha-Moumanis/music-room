import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppConfigService } from './core/config/app-config.service';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';

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

  const options = new DocumentBuilder().setTitle('Music Room API').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/docs-json' });
}
