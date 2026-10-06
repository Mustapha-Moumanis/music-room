import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../core/auth/public.decorator';
import { HealthResponseDto } from './health-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check API availability' })
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiServiceUnavailableResponse({ type: HealthResponseDto })
  async getHealth(@Res({ passthrough: true }) response: Response): Promise<HealthResponseDto> {
    const health = await this.healthService.getHealth();
    if (health.db === 'down') response.status(HttpStatus.SERVICE_UNAVAILABLE);
    return health;
  }
}
