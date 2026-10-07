import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FriendshipStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { FriendDto, FriendRequestsDto, Relationship, RelationshipDto, UserSummaryDto } from './dto/friend.dto';

export const USER_SUMMARY_SELECT = { id: true, displayName: true, profile: { select: { avatarUrl: true } } } as const;

type UserSummaryRow = { id: string; displayName: string; profile: { avatarUrl: string | null } | null };

export function toUserSummary(user: UserSummaryRow): UserSummaryDto {
  return { id: user.id, displayName: user.displayName, avatarUrl: user.profile?.avatarUrl ?? null };
}

/** Either direction: a friendship row is stored once, from requester to addressee. */
function pairWhere(a: string, b: string): Prisma.FriendshipWhereInput {
  return { OR: [{ requesterId: a, addresseeId: b }, { requesterId: b, addresseeId: a }] };
}

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<FriendDto[]> {
    const rows = await this.prisma.friendship.findMany({
      where: { status: FriendshipStatus.ACCEPTED, OR: [{ requesterId: userId }, { addresseeId: userId }] },
      select: { requesterId: true, updatedAt: true, requester: { select: USER_SUMMARY_SELECT }, addressee: { select: USER_SUMMARY_SELECT } },
    });
    return rows
      .map((row) => ({ ...toUserSummary(row.requesterId === userId ? row.addressee : row.requester), since: row.updatedAt }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  async requests(userId: string): Promise<FriendRequestsDto> {
    const [incoming, outgoing] = await Promise.all([
      this.prisma.friendship.findMany({
        where: { addresseeId: userId, status: FriendshipStatus.PENDING },
        select: { createdAt: true, requester: { select: USER_SUMMARY_SELECT } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.friendship.findMany({
        where: { requesterId: userId, status: FriendshipStatus.PENDING },
        select: { createdAt: true, addressee: { select: USER_SUMMARY_SELECT } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      incoming: incoming.map((row) => ({ user: toUserSummary(row.requester), createdAt: row.createdAt })),
      outgoing: outgoing.map((row) => ({ user: toUserSummary(row.addressee), createdAt: row.createdAt })),
    };
  }

  /** Idempotent; a request to someone who already asked us accepts theirs. */
  async sendRequest(userId: string, targetId: string): Promise<RelationshipDto> {
    if (userId === targetId) {
      throw new BadRequestException({ code: 'CANNOT_FRIEND_SELF', message: 'You cannot send a friend request to yourself.' });
    }
    await this.assertActiveUser(targetId);
    const relationship = await this.withPairLock(userId, targetId, async (tx): Promise<Relationship> => {
      const existing = await tx.friendship.findFirst({ where: pairWhere(userId, targetId) });
      if (!existing) {
        await tx.friendship.create({ data: { requesterId: userId, addresseeId: targetId } });
        return 'REQUEST_SENT';
      }
      if (existing.status === FriendshipStatus.ACCEPTED) return 'FRIENDS';
      if (existing.requesterId === userId) return 'REQUEST_SENT';
      await tx.friendship.update({ where: { id: existing.id }, data: { status: FriendshipStatus.ACCEPTED } });
      return 'FRIENDS';
    });
    return { userId: targetId, relationship };
  }

  async accept(userId: string, requesterId: string): Promise<RelationshipDto> {
    await this.withPairLock(userId, requesterId, async (tx) => {
      const existing = await tx.friendship.findFirst({ where: pairWhere(userId, requesterId) });
      if (existing?.status === FriendshipStatus.ACCEPTED) return;
      if (existing?.requesterId !== requesterId) {
        throw new NotFoundException({ code: 'FRIEND_REQUEST_NOT_FOUND', message: 'No pending friend request from this user.' });
      }
      await tx.friendship.update({ where: { id: existing.id }, data: { status: FriendshipStatus.ACCEPTED } });
    });
    return { userId: requesterId, relationship: 'FRIENDS' };
  }

  async decline(userId: string, requesterId: string): Promise<void> {
    await this.withPairLock(userId, requesterId, (tx) => tx.friendship.deleteMany({
      where: { requesterId, addresseeId: userId, status: FriendshipStatus.PENDING },
    }));
  }

  async cancel(userId: string, addresseeId: string): Promise<void> {
    await this.withPairLock(userId, addresseeId, (tx) => tx.friendship.deleteMany({
      where: { requesterId: userId, addresseeId, status: FriendshipStatus.PENDING },
    }));
  }

  async remove(userId: string, friendId: string): Promise<void> {
    await this.withPairLock(userId, friendId, (tx) => tx.friendship.deleteMany({
      where: { status: FriendshipStatus.ACCEPTED, ...pairWhere(userId, friendId) },
    }));
  }

  async relationship(viewerId: string, targetId: string): Promise<Relationship> {
    return (await this.relationships(viewerId, [targetId])).get(targetId) ?? 'NONE';
  }

  async relationships(viewerId: string, targetIds: string[]): Promise<Map<string, Relationship>> {
    const result = new Map<string, Relationship>(targetIds.map((id) => [id, id === viewerId ? 'SELF' : 'NONE']));
    const others = targetIds.filter((id) => id !== viewerId);
    if (others.length === 0) return result;
    const rows = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: viewerId, addresseeId: { in: others } },
          { addresseeId: viewerId, requesterId: { in: others } },
        ],
      },
      select: { requesterId: true, addresseeId: true, status: true },
    });
    for (const row of rows) {
      const sent = row.requesterId === viewerId;
      const otherId = sent ? row.addresseeId : row.requesterId;
      result.set(otherId, row.status === FriendshipStatus.ACCEPTED ? 'FRIENDS' : sent ? 'REQUEST_SENT' : 'REQUEST_RECEIVED');
    }
    return result;
  }

  /** Unverified accounts cannot log in, so they are invisible to other users. */
  private async assertActiveUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { id: userId, emailVerifiedAt: { not: null } }, select: { id: true } });
    if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found.' });
  }

  /**
   * Serialises writes for one pair of users with a transaction-scoped advisory lock, so two people
   * requesting each other at the same moment end up with one friendship instead of two requests.
   */
  private withPairLock<T>(a: string, b: string, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    const key = `friendship:${[a, b].sort().join(':')}`;
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
      return work(tx);
    });
  }
}
