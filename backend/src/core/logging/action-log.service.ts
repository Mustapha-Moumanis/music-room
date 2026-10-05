import { Injectable, Logger } from '@nestjs/common';
import { ActionLogKind, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { capMeta } from './redaction';

export interface ActionLogEntry {
  userId?: string;
  kind: ActionLogKind;
  action: string;
  method?: string;
  route?: string;
  statusCode?: number;
  platform: string;
  device: string;
  appVersion: string;
  requestId?: string;
  durationMs?: number;
  ip?: string;
  meta?: unknown;
  createdAt?: Date;
}

@Injectable()
export class ActionLogService {
  private readonly logger = new Logger(ActionLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  record(entry: ActionLogEntry): void {
    void this.write(entry);
  }

  async recordMany(entries: ActionLogEntry[]): Promise<void> {
    await Promise.all(entries.map((entry) => this.write(entry)));
  }

  private async write(entry: ActionLogEntry): Promise<void> {
    try {
      await this.prisma.actionLog.create({
        data: {
          userId: entry.userId,
          kind: entry.kind,
          action: entry.action.slice(0, 128),
          method: entry.method,
          route: entry.route,
          statusCode: entry.statusCode,
          platform: entry.platform,
          device: entry.device,
          appVersion: entry.appVersion,
          requestId: entry.requestId,
          durationMs: entry.durationMs,
          ip: entry.ip,
          meta: entry.meta === undefined ? undefined : capMeta(entry.meta) as Prisma.InputJsonValue,
          createdAt: entry.createdAt,
        },
      });
    } catch (error) {
      this.logger.warn(`Action log write failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
