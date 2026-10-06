import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { AppConfigService } from '../config/app-config.service';
import { AccessTokenClaims } from './auth.types';
import { parseTtlMs } from './ttl';

export interface IssuedRefreshToken {
  id: string;
  secretHash: string;
  token: string;
  expiresAt: Date;
}

export interface ParsedRefreshToken {
  id: string;
  secret: string;
}

@Injectable()
export class TokenService {
  constructor(private readonly config: AppConfigService, private readonly jwt: JwtService) {}

  signAccessToken(userId: string, sessionId: string): { accessToken: string; accessTokenExpiresIn: number } {
    const ttlMs = parseTtlMs(this.config.get('JWT_ACCESS_TTL'));
    const payload: AccessTokenClaims = { sub: userId, sid: sessionId, typ: 'access' };
    return {
      accessToken: this.jwt.sign(payload, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        algorithm: 'HS256',
        expiresIn: Math.floor(ttlMs / 1000),
      }),
      accessTokenExpiresIn: Math.floor(ttlMs / 1000),
    };
  }

  verifyAccessToken(token: string): AccessTokenClaims {
    const payload = this.jwt.verify<Partial<AccessTokenClaims>>(token, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      algorithms: ['HS256'],
    });
    if (!payload.sub || !payload.sid || payload.typ !== 'access') throw new Error('Invalid access token claims');
    return { sub: payload.sub, sid: payload.sid, typ: payload.typ };
  }

  issueRefreshToken(now = new Date()): IssuedRefreshToken {
    const id = randomUUID();
    const secret = randomBytes(32).toString('base64url');
    return {
      id,
      secretHash: this.hashRefreshSecret(secret),
      token: `${id}.${secret}`,
      expiresAt: new Date(now.getTime() + parseTtlMs(this.config.get('JWT_REFRESH_TTL'))),
    };
  }

  parseRefreshToken(refreshToken: string): ParsedRefreshToken | undefined {
    const [id, secret, extra] = refreshToken.split('.');
    if (extra !== undefined || !id || !secret) return undefined;
    if (!/^[A-Za-z0-9_-]{20,}$/.test(secret)) return undefined;
    return { id, secret };
  }

  hashRefreshSecret(secret: string): string {
    return createHash('sha256').update(secret).digest('base64url');
  }
}

