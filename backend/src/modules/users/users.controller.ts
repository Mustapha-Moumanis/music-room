import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { AuthenticatedUser } from '../../core/auth/auth.types';
import { GenresResponseDto, MyProfileDto } from './dto/profile.dto';
import { SearchUsersQueryDto, UserSearchResultDto } from './dto/search-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MUSIC_GENRES } from './profile.constants';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my full profile (public, friends-only, private and music preferences)' })
  @ApiOkResponse({ type: MyProfileDto })
  getMe(@CurrentUser() user: AuthenticatedUser): Promise<MyProfileDto> {
    return this.users.getMyProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile; only the fields sent change and null clears a field' })
  @ApiOkResponse({ type: MyProfileDto })
  @ApiBadRequestResponse({ description: 'Validation failed or an unknown field was sent' })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto): Promise<MyProfileDto> {
    return this.users.updateMyProfile(user.id, dto);
  }

  @Get('genres')
  @ApiOperation({ summary: 'List the genres accepted in music preferences' })
  @ApiOkResponse({ type: GenresResponseDto })
  genres(): GenresResponseDto {
    return { genres: [...MUSIC_GENRES] };
  }

  @Get('search')
  @ApiOperation({ summary: 'Find people by display name (max 20, yourself excluded)' })
  @ApiOkResponse({ type: UserSearchResultDto, isArray: true })
  search(@CurrentUser() user: AuthenticatedUser, @Query() query: SearchUsersQueryDto): Promise<UserSearchResultDto[]> {
    return this.users.search(user.id, query.q);
  }
}
