import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { RELATIONSHIPS, Relationship, UserSummaryDto } from '../../friends/dto/friend.dto';

export class SearchUsersQueryDto {
  @ApiProperty({ description: 'Part of a display name', minLength: 2, maxLength: 50, example: 'ana' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  q!: string;
}

export class UserSearchResultDto extends UserSummaryDto {
  @ApiProperty({ enum: RELATIONSHIPS })
  relationship!: Relationship;
}
