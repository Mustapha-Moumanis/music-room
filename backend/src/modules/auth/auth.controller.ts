import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiAcceptedResponse, ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { Public } from '../../core/auth/public.decorator';
import { AuthenticatedUser } from '../../core/auth/auth.types';
import { AuthService } from './auth.service';
import { EmailDto, MessageResponseDto } from './dto/email.dto';
import { GoogleIdTokenDto } from './dto/google.dto';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { MeResponseDto } from './dto/me.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
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

  @Public()
  @Get('verify')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({ summary: 'Verify an email address' })
  @ApiOkResponse({ description: 'Email verified HTML page' })
  async verify(@Query('token') token: string | undefined, @Res({ passthrough: true }) res: Response): Promise<string> {
    const result = await this.auth.verifyEmail(token);
    res.status(result.status);
    return result.html;
  }

  @Public()
  @Post('verify/resend')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: Number(process.env.AUTH_THROTTLE_LIMIT ?? 5), ttl: Number(process.env.THROTTLE_TTL_MS ?? 60000) } })
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiAcceptedResponse({ type: MessageResponseDto })
  resendVerification(@Body() dto: EmailDto): Promise<MessageResponseDto> {
    return this.auth.resendVerification(dto.email);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: Number(process.env.AUTH_THROTTLE_LIMIT ?? 5), ttl: Number(process.env.THROTTLE_TTL_MS ?? 60000) } })
  @ApiOperation({ summary: 'Request a password reset code' })
  @ApiOkResponse({ type: MessageResponseDto })
  forgotPassword(@Body() dto: EmailDto): Promise<MessageResponseDto> {
    return this.auth.forgotPassword(dto.email);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: Number(process.env.AUTH_THROTTLE_LIMIT ?? 5), ttl: Number(process.env.THROTTLE_TTL_MS ?? 60000) } })
  @ApiOperation({ summary: 'Reset password with an emailed code' })
  @ApiOkResponse({ type: MessageResponseDto })
  resetPassword(@Body() dto: PasswordResetDto): Promise<MessageResponseDto> {
    return this.auth.resetPassword(dto);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out one refresh-token family' })
  @ApiNoContentResponse()
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out all sessions' })
  @ApiNoContentResponse()
  async logoutAll(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.auth.logoutAll(user.id);
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: Number(process.env.AUTH_THROTTLE_LIMIT ?? 5), ttl: Number(process.env.THROTTLE_TTL_MS ?? 60000) } })
  @ApiOperation({ summary: 'Log in with Google' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'INVALID_GOOGLE_TOKEN' })
  google(@Body() dto: GoogleIdTokenDto, @Req() req: Request): Promise<LoginResponseDto> {
    return this.auth.google(dto.idToken, req);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiOkResponse({ type: MeResponseDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponseDto> {
    return this.auth.me(user.id);
  }

  @Post('link/google')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link Google to the current account' })
  @ApiOkResponse({ type: MeResponseDto })
  linkGoogle(@CurrentUser() user: AuthenticatedUser, @Body() dto: GoogleIdTokenDto): Promise<MeResponseDto> {
    return this.auth.linkGoogle(user.id, dto.idToken);
  }

  @Delete('link/google')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink Google from the current account' })
  @ApiOkResponse({ type: MeResponseDto })
  unlinkGoogle(@CurrentUser() user: AuthenticatedUser): Promise<MeResponseDto> {
    return this.auth.unlinkGoogle(user.id);
  }
}
