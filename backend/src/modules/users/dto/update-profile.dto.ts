import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileVisibility } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayUnique, IsArray, IsEnum, IsIn, IsObject, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength,
  Validate, ValidateIf, ValidateNested, ValidatorConstraint, ValidatorConstraintInterface,
} from 'class-validator';
import { MUSIC_GENRES, PROFILE_LIMITS } from '../profile.constants';

type TransformInput = { value: unknown };

const trim = ({ value }: TransformInput): unknown => typeof value === 'string' ? value.trim() : value;
/** Optional text fields: surrounding spaces are dropped and an empty string clears the field. */
const trimOrNull = ({ value }: TransformInput): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};
const normalizeTags = ({ value }: TransformInput): unknown => Array.isArray(value)
  ? value.map((tag: unknown) => typeof tag === 'string' ? tag.trim().toLowerCase() : tag)
  : value;
const isPresent = (_object: object, value: unknown): boolean => value !== undefined;

@ValidatorConstraint({ name: 'BirthDateValidator', async: false })
export class BirthDateValidator implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    // Round-trip check rejects impossible dates such as 2026-02-30.
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
      && value >= '1900-01-01' && date.getTime() <= Date.now();
  }

  defaultMessage(): string {
    return 'birthDate must be a real past date formatted YYYY-MM-DD';
  }
}

export class PublicInfoUpdateDto {
  @ApiPropertyOptional({ example: 'DJ Ana', minLength: 1, maxLength: PROFILE_LIMITS.displayName })
  @ValidateIf(isPresent)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(PROFILE_LIMITS.displayName)
  displayName?: string;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: PROFILE_LIMITS.bio })
  @Transform(trimOrNull)
  @IsOptional()
  @IsString()
  @MaxLength(PROFILE_LIMITS.bio)
  bio?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'https://example.com/me.png' })
  @Transform(trimOrNull)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(PROFILE_LIMITS.avatarUrl)
  avatarUrl?: string | null;
}

export class FriendsInfoUpdateDto {
  @ApiPropertyOptional({ type: String, nullable: true, maxLength: PROFILE_LIMITS.realName })
  @Transform(trimOrNull)
  @IsOptional()
  @IsString()
  @MaxLength(PROFILE_LIMITS.realName)
  realName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: PROFILE_LIMITS.city })
  @Transform(trimOrNull)
  @IsOptional()
  @IsString()
  @MaxLength(PROFILE_LIMITS.city)
  city?: string | null;
}

export class PrivateInfoUpdateDto {
  @ApiPropertyOptional({ type: String, nullable: true, example: '1999-04-21', description: 'YYYY-MM-DD' })
  @Transform(trimOrNull)
  @IsOptional()
  @Validate(BirthDateValidator)
  birthDate?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '+212 600 000 000' })
  @Transform(trimOrNull)
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9 ().-]{6,20}$/, { message: 'phone must contain 6-20 digits, spaces or + ( ) . -' })
  phone?: string | null;
}

export class MusicPreferencesUpdateDto {
  @ApiPropertyOptional({ enum: MUSIC_GENRES, isArray: true, maxItems: PROFILE_LIMITS.musicItems })
  @ValidateIf(isPresent)
  @IsArray()
  @ArrayMaxSize(PROFILE_LIMITS.musicItems)
  @ArrayUnique()
  @IsIn(MUSIC_GENRES, { each: true })
  genres?: string[];

  @ApiPropertyOptional({ type: String, isArray: true, maxItems: PROFILE_LIMITS.musicItems, example: ['90s', 'road trip'] })
  @ValidateIf(isPresent)
  @Transform(normalizeTags)
  @IsArray()
  @ArrayMaxSize(PROFILE_LIMITS.musicItems)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(PROFILE_LIMITS.tag, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ProfileVisibility, description: 'Who can see your music preferences' })
  @ValidateIf(isPresent)
  @IsEnum(ProfileVisibility)
  visibility?: ProfileVisibility;
}

/** Every group and every field is optional: only what is sent is changed, and null clears a field. */
export class UpdateProfileDto {
  @ApiPropertyOptional({ type: PublicInfoUpdateDto })
  @ValidateIf(isPresent)
  @IsObject()
  @ValidateNested()
  @Type(() => PublicInfoUpdateDto)
  public?: PublicInfoUpdateDto;

  @ApiPropertyOptional({ type: FriendsInfoUpdateDto })
  @ValidateIf(isPresent)
  @IsObject()
  @ValidateNested()
  @Type(() => FriendsInfoUpdateDto)
  friends?: FriendsInfoUpdateDto;

  @ApiPropertyOptional({ type: PrivateInfoUpdateDto })
  @ValidateIf(isPresent)
  @IsObject()
  @ValidateNested()
  @Type(() => PrivateInfoUpdateDto)
  private?: PrivateInfoUpdateDto;

  @ApiPropertyOptional({ type: MusicPreferencesUpdateDto })
  @ValidateIf(isPresent)
  @IsObject()
  @ValidateNested()
  @Type(() => MusicPreferencesUpdateDto)
  music?: MusicPreferencesUpdateDto;
}
