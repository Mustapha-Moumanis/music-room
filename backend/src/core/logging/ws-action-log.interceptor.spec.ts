import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ActionLogKind } from '@prisma/client';
import { of } from 'rxjs';
import { ActionLogService } from './action-log.service';
import { WsActionLogInterceptor } from './ws-action-log.interceptor';

describe('WsActionLogInterceptor', () => {
  it('records socket events with client info from auth and headers', (done) => {
    const service = { record: jest.fn() } as unknown as ActionLogService;
    const interceptor = new WsActionLogInterceptor(service);
    const socket = {
      id: 'socket-1',
      handshake: {
        address: '127.0.0.1',
        headers: { 'x-device': 'Pixel 8' },
        auth: { platform: 'android', appVersion: '1.0.0 (1)', requestId: 'req-1' },
      },
      data: { user: { id: 'user-1' } },
    };
    const context = {
      getType: () => 'ws',
      getHandler: () => ({ name: 'fallbackEvent' }),
      switchToWs: () => ({ getClient: () => socket, getData: () => 'vote:create' }),
    } as unknown as ExecutionContext;
    const next = { handle: () => of({ ok: true }) } as CallHandler;

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(service.record).toHaveBeenCalledWith(expect.objectContaining({
          kind: ActionLogKind.SOCKET,
          action: 'vote:create',
          userId: 'user-1',
          platform: 'android',
          device: 'Pixel 8',
          appVersion: '1.0.0 (1)',
          requestId: 'req-1',
        }));
        done();
      },
    });
  });
});
