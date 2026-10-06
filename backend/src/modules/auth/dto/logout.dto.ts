import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: '22a85df0-146b-43cd-bcf3-b025598c546c.zZ2rQ-32-byte-secret' })
  @IsString()
  refreshToken!: string;
}
