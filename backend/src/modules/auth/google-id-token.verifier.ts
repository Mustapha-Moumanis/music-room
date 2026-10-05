import { Injectable } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { AppConfigService } from '../../core/config/app-config.service';

export interface GoogleIdTokenClaims {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export class GoogleIdTokenVerificationError extends Error {
  constructor(message: string, public readonly code: 'missing_audience' | 'invalid_token' | 'invalid_issuer' | 'email_not_verified' | 'missing_claim') {
    super(message);
  }
}

@Injectable()
export class GoogleIdTokenVerifier {
  private readonly client = new OAuth2Client();

  constructor(private readonly config: AppConfigService) {}

  async verify(idToken: string): Promise<GoogleIdTokenClaims> {
    const audience = this.config.get('GOOGLE_WEB_CLIENT_ID');
    if (!audience) throw new GoogleIdTokenVerificationError('GOOGLE_WEB_CLIENT_ID is not configured', 'missing_audience');
    try {
      const ticket = await this.client.verifyIdToken({ idToken, audience });
      const payload = ticket.getPayload();
      return this.parsePayload(payload);
    } catch (error) {
      if (error instanceof GoogleIdTokenVerificationError) throw error;
      throw new GoogleIdTokenVerificationError(error instanceof Error ? error.message : 'Invalid Google idToken', 'invalid_token');
    }
  }

  private parsePayload(payload: TokenPayload | undefined): GoogleIdTokenClaims {
    if (!payload?.sub || !payload.email) throw new GoogleIdTokenVerificationError('Google token is missing required claims', 'missing_claim');
    if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
      throw new GoogleIdTokenVerificationError('Google token issuer is not trusted', 'invalid_issuer');
    }
    if (payload.email_verified !== true) throw new GoogleIdTokenVerificationError('Google email is not verified', 'email_not_verified');
    return { sub: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
  }
}
