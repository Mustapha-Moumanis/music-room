import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ActionLogKind } from '@prisma/client';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ActionLogService } from './action-log.service';
import { HeaderLike, extractClientInfoFromAuth } from './client-info';

interface SocketLike {
  id?: string;
  handshake?: {
    address?: string;
    headers?: HeaderLike;
    auth?: unknown;
  };
  data?: { user?: { id?: string; userId?: string; sub?: string } };
}

@Injectable()
export class WsActionLogInterceptor implements NestInterceptor {
  constructor(private readonly actionLogs: ActionLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<'ws'>() !== 'ws') return next.handle();
    const socket = context.switchToWs().getClient<SocketLike>();
    const eventName = String(context.switchToWs().getData<unknown>() ?? context.getHandler().name);
    const started = Date.now();
    return next.handle().pipe(
      tap(() => this.record(socket, eventName, started)),
      catchError((error: unknown) => {
        this.record(socket, eventName, started, 500);
        return throwError(() => error);
      }),
    );
  }

  private record(socket: SocketLike, action: string, started: number, statusCode = 200): void {
    const info = extractClientInfoFromAuth(socket.handshake?.auth, socket.handshake?.headers);
    const user = socket.data?.user;
    this.actionLogs.record({
      kind: ActionLogKind.SOCKET,
      action,
      statusCode,
      durationMs: Date.now() - started,
      ip: socket.handshake?.address,
      userId: user?.id ?? user?.userId ?? user?.sub,
      platform: info.platform,
      device: info.device,
      appVersion: info.appVersion,
      requestId: info.requestId || socket.id,
    });
  }
}
