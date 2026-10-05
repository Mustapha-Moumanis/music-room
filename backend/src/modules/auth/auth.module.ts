import { Module } from '@nestjs/common';
import { GoogleIdTokenVerifier } from './google-id-token.verifier';

@Module({
  providers: [GoogleIdTokenVerifier],
  exports: [GoogleIdTokenVerifier],
})
export class AuthModule {}
