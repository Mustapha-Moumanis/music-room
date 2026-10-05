import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class ClientEventDto {
  @ApiProperty({ maxLength: 64, example: 'screen_view' })
  @IsString()
  @MaxLength(64)
  action!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  at?: string;

  @ApiPropertyOptional({ type: Object, description: 'Optional client metadata. Sensitive keys are redacted and payloads are size capped.' })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}

export class ClientEventsDto {
  @ApiProperty({ type: [ClientEventDto], minItems: 1, maxItems: 50 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ClientEventDto)
  events!: ClientEventDto[];
}

export class ClientEventsAcceptedDto {
  @ApiProperty({ example: 2 })
  accepted!: number;
}
