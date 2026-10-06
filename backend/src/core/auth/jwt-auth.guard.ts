import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../database/prisma.service';
import { AuthException } from './auth.exception';
import { AuthenticatedUser } from './auth.types';
import { IS_PUBLIC_KEY } from './public.decorator';
import { TokenService } from './token.service';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly tokens: TokenService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]) ?? false;
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const bearer = this.extractBearer(request);
    if (!bearer) {
      if (isPublic) return true;
      throw new AuthException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    try {
      const claims = this.tokens.verifyAccessToken(bearer);
      const active = await this.prisma.refreshToken.findFirst({
        where: { familyId: claims.sid, revokedAt: null },
        select: { user: { select: { id: true, email: true } } },
      });
      if (!active) throw new AuthException('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
      request.user = { id: active.user.id, email: active.user.email, sessionId: claims.sid };
      return true;
    } catch (error) {
      // A stale or revoked token must not lock the client out of login/refresh.
      if (isPublic) return true;
      if (error instanceof AuthException) throw error;
      throw new AuthException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
  }

  private extractBearer(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) return undefined;
    const [scheme, token, extra] = authorization.split(' ');
    if (extra !== undefined || scheme !== 'Bearer' || !token) return undefined;
    return token;
  }
}

