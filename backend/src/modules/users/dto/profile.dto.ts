import { ApiProperty } from '@nestjs/swagger';
import { ProfileVisibility } from '@prisma/client';
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

export class GenresResponseDto {
  @ApiProperty({ enum: MUSIC_GENRES, isArray: true })
  genres!: string[];
}
