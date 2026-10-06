import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail, IsString, MaxLength, MinLength, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface,
} from 'class-validator';
import { normalizeEmail, validatePasswordPolicy } from '../password-policy';

@ValidatorConstraint({ name: 'PasswordPolicyValidator', async: false })
class PasswordPolicyValidator implements ValidatorConstraintInterface {
  validate(password: unknown, args?: ValidationArguments): boolean {
    const dto = args?.object as Partial<RegisterDto> | undefined;
    return typeof password === 'string' && validatePasswordPolicy(password, dto?.email ?? '');
  }

  defaultMessage(): string {
    return 'password must be 10-128 chars, include at least one letter and one digit, and not equal the email';
  }
}

export class RegisterDto {
  @ApiProperty({ example: 'hajar@example.com' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? normalizeEmail(value) : value)
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'musicRoom42', minLength: 10, maxLength: 128 })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Validate(PasswordPolicyValidator)
  password!: string;

  @ApiProperty({ example: 'Hajar', minLength: 1, maxLength: 80 })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  displayName!: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'If the address can be used, a verification email has been sent.' })
  message!: string;
}
