import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from './auth.types';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedUser | undefined => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
});

