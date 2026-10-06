import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { TokenService } from '../../core/auth/token.service';
import { MailModule } from '../../core/mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationNotifier } from './email-verification-notifier';
import { GoogleIdTokenVerifier } from './google-id-token.verifier';

@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    EmailVerificationNotifier,
    GoogleIdTokenVerifier,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [GoogleIdTokenVerifier, TokenService],
})
export class AuthModule {}
