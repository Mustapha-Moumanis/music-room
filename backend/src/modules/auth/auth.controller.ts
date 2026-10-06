import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { Public } from '../../core/auth/public.decorator';
import { AuthenticatedUser } from '../../core/auth/auth.types';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { MeResponseDto } from './dto/me.dto';
import { RefreshDto, RefreshResponseDto } from './dto/refresh.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: Number(process.env.AUTH_THROTTLE_LIMIT ?? 5), ttl: Number(process.env.THROTTLE_TTL_MS ?? 60000) } })
  @ApiOperation({ summary: 'Register with email and password' })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: Number(process.env.AUTH_THROTTLE_LIMIT ?? 5), ttl: Number(process.env.THROTTLE_TTL_MS ?? 60000) } })
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'INVALID_CREDENTIALS' })
  login(@Body() dto: LoginDto, @Req() req: Request): Promise<LoginResponseDto> {
    return this.auth.login(dto, req);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: Number(process.env.AUTH_THROTTLE_LIMIT ?? 5), ttl: Number(process.env.THROTTLE_TTL_MS ?? 60000) } })
  @ApiOperation({ summary: 'Rotate a refresh token' })
  @ApiOkResponse({ type: RefreshResponseDto })
  @ApiUnauthorizedResponse({ description: 'INVALID_REFRESH_TOKEN or REFRESH_TOKEN_REUSED' })
  refresh(@Body() dto: RefreshDto, @Req() req: Request): Promise<RefreshResponseDto> {
    return this.auth.refresh(dto.refreshToken, req);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiOkResponse({ type: MeResponseDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponseDto> {
    return this.auth.me(user.id);
  }
}
