import { Body, Controller, Post, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiAcceptedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActionLogKind } from '@prisma/client';
import { Request } from 'express';
import { Public } from '../../core/auth/public.decorator';
import { ActionLogService } from '../../core/logging/action-log.service';
import { extractClientInfo } from '../../core/logging/client-info';
import { ClientEventsAcceptedDto, ClientEventsDto } from './client-event.dto';

interface RequestWithUser extends Request {
  user?: { id?: string; userId?: string; sub?: string };
}

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly actionLogs: ActionLogService) {}

  @Post('client')
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Accept client-side action logs', description: 'Public until auth lands in M1; req.user can be consumed here once guards are added.' })
  @ApiAcceptedResponse({ type: ClientEventsAcceptedDto })
  async recordClientEvents(@Body() dto: ClientEventsDto, @Req() req: RequestWithUser): Promise<ClientEventsAcceptedDto> {
    const info = extractClientInfo(req.headers);
    await this.actionLogs.recordMany(dto.events.map((event) => ({
      kind: ActionLogKind.CLIENT,
      action: event.action,
      platform: info.platform,
      device: info.device,
      appVersion: info.appVersion,
      requestId: info.requestId,
      ip: req.ip,
      userId: req.user?.id ?? req.user?.userId ?? req.user?.sub,
      meta: event.meta,
      createdAt: event.at ? new Date(event.at) : undefined,
    })));
    return { accepted: dto.events.length };
  }
}
