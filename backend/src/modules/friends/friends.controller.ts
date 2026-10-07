import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse, ApiBearerAuth, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { AuthenticatedUser } from '../../core/auth/auth.types';
import { FriendDto, FriendRequestsDto, RelationshipDto } from './dto/friend.dto';
import { FriendsService } from './friends.service';

@ApiTags('friends')
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Get()
  @ApiOperation({ summary: 'List my friends' })
  @ApiOkResponse({ type: FriendDto, isArray: true })
  list(@CurrentUser() user: AuthenticatedUser): Promise<FriendDto[]> {
    return this.friends.list(user.id);
  }

  @Get('requests')
  @ApiOperation({ summary: 'List pending friend requests I received and sent' })
  @ApiOkResponse({ type: FriendRequestsDto })
  requests(@CurrentUser() user: AuthenticatedUser): Promise<FriendRequestsDto> {
    return this.friends.requests(user.id);
  }

  @Post('requests/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a friend request (idempotent; accepts theirs if they already asked)' })
  @ApiOkResponse({ type: RelationshipDto })
  @ApiBadRequestResponse({ description: 'CANNOT_FRIEND_SELF' })
  @ApiNotFoundResponse({ description: 'USER_NOT_FOUND' })
  send(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string): Promise<RelationshipDto> {
    return this.friends.sendRequest(user.id, userId);
  }

  @Post('requests/:userId/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept the friend request this user sent me' })
  @ApiOkResponse({ type: RelationshipDto })
  @ApiNotFoundResponse({ description: 'FRIEND_REQUEST_NOT_FOUND' })
  accept(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string): Promise<RelationshipDto> {
    return this.friends.accept(user.id, userId);
  }

  @Post('requests/:userId/decline')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decline the friend request this user sent me' })
  @ApiNoContentResponse()
  async decline(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string): Promise<void> {
    await this.friends.decline(user.id, userId);
  }

  @Delete('requests/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel the friend request I sent to this user' })
  @ApiNoContentResponse()
  async cancel(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string): Promise<void> {
    await this.friends.cancel(user.id, userId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a friend' })
  @ApiNoContentResponse()
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string): Promise<void> {
    await this.friends.remove(user.id, userId);
  }
}
