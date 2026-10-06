import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength, Validate } from 'class-validator';
import { normalizeEmail } from '../password-policy';
import { PasswordPolicyValidator } from './register.dto';

export class PasswordResetDto {
  @ApiProperty({ example: 'john@example.com' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? normalizeEmail(value) : value)
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;

  @ApiProperty({ example: 'newMusicRoom42', minLength: 10, maxLength: 128 })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Validate(PasswordPolicyValidator)
  newPassword!: string;
}
