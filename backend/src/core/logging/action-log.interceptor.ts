import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ActionLogKind } from '@prisma/client';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Request, Response } from 'express';
import { ActionLogService } from './action-log.service';
import { extractClientInfo } from './client-info';

interface RequestWithUser extends Request {
  user?: { id?: string; userId?: string; sub?: string };
}

@Injectable()
export class ActionLogInterceptor implements NestInterceptor {
  constructor(private readonly actionLogs: ActionLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const http = context.switchToHttp();
    const req = http.getRequest<RequestWithUser>();
    const res = http.getResponse<Response>();
    const started = Date.now();

    if (shouldSkip(req.originalUrl ?? req.url)) return next.handle();

    return next.handle().pipe(
      tap(() => this.record(req, res, started)),
      catchError((error: unknown) => {
        this.record(req, res, started, getErrorStatus(error));
        return throwError(() => error);
      }),
    );
  }

  private record(req: RequestWithUser, res: Response, started: number, errorStatus?: number): void {
    const info = extractClientInfo(req.headers);
    this.actionLogs.record({
      kind: ActionLogKind.HTTP,
      action: `${req.method} ${getRoutePattern(req)}`,
      method: req.method,
      route: getRoutePattern(req),
      statusCode: errorStatus ?? res.statusCode,
      durationMs: Date.now() - started,
      ip: req.ip,
      userId: req.user?.id ?? req.user?.userId ?? req.user?.sub,
      platform: info.platform,
      device: info.device,
      appVersion: info.appVersion,
      requestId: info.requestId || requestId(req),
    });
  }
}

function requestId(req: Request): string | undefined {
  const id = (req as Request & { id?: unknown }).id;
  return typeof id === 'string' ? id : undefined;
}

function shouldSkip(url = ''): boolean {
  return url.startsWith('/api/health') || url.startsWith('/api/docs/');
}

function getRoutePattern(req: Request): string {
  const routePath = typeof req.route?.path === 'string' ? req.route.path : undefined;
  const baseUrl = req.baseUrl || '';
  if (routePath) return `${baseUrl}${routePath}`.replace(/\/+/g, '/');
  return req.originalUrl?.split('?')[0] ?? req.url.split('?')[0] ?? 'unknown';
}

function getErrorStatus(error: unknown): number {
  if (error && typeof error === 'object' && 'getStatus' in error && typeof error.getStatus === 'function') {
    return error.getStatus();
  }
  return 500;
}
