import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { normalizeEmail } from '../password-policy';

export class EmailDto {
  @ApiProperty({ example: 'john@example.com' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? normalizeEmail(value) : value)
  @IsEmail()
  email!: string;
}

export class MessageResponseDto {
  @ApiProperty()
  message!: string;
}
