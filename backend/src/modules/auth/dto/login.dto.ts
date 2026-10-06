import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import { normalizeEmail } from '../password-policy';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? normalizeEmail(value) : value)
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'musicRoom42' })
  @IsString()
  password!: string;
}

class LoginUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  displayName!: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ example: 900 })
  accessTokenExpiresIn!: number;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  refreshTokenExpiresAt!: string;

  @ApiProperty({ type: LoginUserDto })
  user!: LoginUserDto;
}

