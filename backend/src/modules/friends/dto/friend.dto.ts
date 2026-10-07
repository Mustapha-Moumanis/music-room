import { ApiProperty } from '@nestjs/swagger';

export const RELATIONSHIPS = ['SELF', 'FRIENDS', 'REQUEST_SENT', 'REQUEST_RECEIVED', 'NONE'] as const;

/** How the viewer relates to another user; drives what of their profile is visible. */
export type Relationship = (typeof RELATIONSHIPS)[number];

export class UserSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl!: string | null;
}

export class FriendDto extends UserSummaryDto {
  @ApiProperty({ description: 'When the friendship was accepted' })
  since!: Date;
}

export class FriendRequestDto {
  @ApiProperty({ type: UserSummaryDto, description: 'The other user: the sender for incoming, the recipient for outgoing' })
  user!: UserSummaryDto;

  @ApiProperty()
  createdAt!: Date;
}

export class FriendRequestsDto {
  @ApiProperty({ type: FriendRequestDto, isArray: true })
  incoming!: FriendRequestDto[];

  @ApiProperty({ type: FriendRequestDto, isArray: true })
  outgoing!: FriendRequestDto[];
}

export class RelationshipDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: RELATIONSHIPS })
  relationship!: Relationship;
}
