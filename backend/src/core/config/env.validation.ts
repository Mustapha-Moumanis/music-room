import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty, IsArray, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional,
  IsString, IsUrl, Matches, Max, Min, validateSync,
} from 'class-validator';

const httpUrl = { protocols: ['http', 'https'], require_protocol: true, require_tld: false };

export class EnvironmentVariables {
  @IsIn(['development', 'test', 'production'])
  NODE_ENV!: 'development' | 'test' | 'production';

  @Type(() => Number) @IsInt() @Min(1) @Max(65535)
  BACKEND_PORT!: number;

  @IsUrl(httpUrl)
  APP_URL!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',').map((origin) => origin.trim()) : value)
  @IsArray() @ArrayNotEmpty() @IsUrl(httpUrl, { each: true })
  @Matches(/^https?:\/\/[^/?#]+$/, { each: true })
  CORS_ORIGINS!: string[];

  @IsIn(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  LOG_LEVEL!: string;

  @IsUrl({ protocols: ['postgres', 'postgresql'], require_protocol: true, require_tld: false })
  DATABASE_URL!: string;

  @IsString() @Matches(/\S/)
  JWT_ACCESS_SECRET!: string;

  @Matches(/^[1-9]\d*(ms|s|m|h|d|w|y)$/)
  JWT_ACCESS_TTL!: string;

  @IsString() @Matches(/\S/)
  JWT_REFRESH_SECRET!: string;

  @Matches(/^[1-9]\d*(ms|s|m|h|d|w|y)$/)
  JWT_REFRESH_TTL!: string;

  @Matches(/^[1-9]\d*(ms|s|m|h|d|w|y)$/)
  EMAIL_VERIFY_TTL!: string;

  @Matches(/^[1-9]\d*(ms|s|m|h|d|w|y)$/)
  PASSWORD_RESET_TTL!: string;

  @Type(() => Number) @IsInt() @Min(1)
  THROTTLE_TTL_MS!: number;

  @Type(() => Number) @IsInt() @Min(1)
  THROTTLE_LIMIT!: number;

  @Type(() => Number) @IsInt() @Min(1)
  AUTH_THROTTLE_LIMIT!: number;

  @IsString() @IsNotEmpty() @Matches(/^\S+$/)
  SMTP_HOST!: string;

  @Type(() => Number) @IsInt() @Min(1) @Max(65535)
  SMTP_PORT!: number;

  @IsOptional() @IsString()
  SMTP_USER?: string;

  @IsOptional() @IsString()
  SMTP_PASSWORD?: string;

  @IsEmail({ allow_display_name: true, require_tld: false })
  MAIL_FROM!: string;

  @IsOptional() @IsString()
  GOOGLE_WEB_CLIENT_ID?: string;

  @IsUrl(httpUrl)
  DEEZER_API_URL!: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(validated, {
    skipMissingProperties: false,
    validationError: { target: false, value: false },
  });
  if (errors.length) {
    // Report field names only: configuration errors must not expose secret values.
    throw new Error(`Invalid environment variables: ${errors.map((error) => error.property).join(', ')}`);
  }
  return validated;
}
