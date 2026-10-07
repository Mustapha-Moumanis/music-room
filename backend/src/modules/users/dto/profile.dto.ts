import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileVisibility } from '@prisma/client';
import { RELATIONSHIPS, Relationship } from '../../friends/dto/friend.dto';
import { MUSIC_GENRES } from '../profile.constants';

export class PublicInfoDto {
  @ApiProperty()
  displayName!: string;

  @ApiProperty({ type: String, nullable: true })
  bio!: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl!: string | null;
}

export class FriendsInfoDto {
  @ApiProperty({ type: String, nullable: true })
  realName!: string | null;

  @ApiProperty({ type: String, nullable: true })
  city!: string | null;
}

export class PrivateInfoDto {
  @ApiProperty({ type: String, nullable: true, example: '1999-04-21' })
  birthDate!: string | null;

  @ApiProperty({ type: String, nullable: true })
  phone!: string | null;
}

export class MusicPreferencesDto {
  @ApiProperty({ enum: MUSIC_GENRES, isArray: true })
  genres!: string[];

  @ApiProperty({ type: String, isArray: true })
  tags!: string[];

  @ApiProperty({ enum: ProfileVisibility })
  visibility!: ProfileVisibility;
}

export class MyProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: PublicInfoDto })
  public!: PublicInfoDto;

  @ApiProperty({ type: FriendsInfoDto })
  friends!: FriendsInfoDto;

  @ApiProperty({ type: PrivateInfoDto })
  private!: PrivateInfoDto;

  @ApiProperty({ type: MusicPreferencesDto })
  music!: MusicPreferencesDto;
}

/** Another user's profile: groups the viewer may not see are left out entirely. */
export class UserProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: RELATIONSHIPS })
  relationship!: Relationship;

  @ApiProperty({ type: PublicInfoDto })
  public!: PublicInfoDto;

  @ApiPropertyOptional({ type: FriendsInfoDto, description: 'Only for friends and yourself' })
  friends?: FriendsInfoDto;

  @ApiPropertyOptional({ type: PrivateInfoDto, description: 'Only for yourself' })
  private?: PrivateInfoDto;

  @ApiPropertyOptional({ type: MusicPreferencesDto, description: 'Depends on the visibility the owner chose' })
  music?: MusicPreferencesDto;
}

export class GenresResponseDto {
  @ApiProperty({ enum: MUSIC_GENRES, isArray: true })
  genres!: string[];
}
