import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { MyProfileDto } from './dto/profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  PROFILE_SELECT, profileOrEmpty, toFriendsInfo, toMusicPreferences, toPrivateInfo, toPublicInfo,
} from './profile.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string): Promise<MyProfileDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, profile: { select: PROFILE_SELECT } },
    });
    return this.toMyProfile(user);
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto): Promise<MyProfileDto> {
    // Prisma skips undefined values, so fields absent from the request stay untouched.
    const profile = {
      bio: dto.public?.bio,
      avatarUrl: dto.public?.avatarUrl,
      realName: dto.friends?.realName,
      city: dto.friends?.city,
      birthDate: toDate(dto.private?.birthDate),
      phone: dto.private?.phone,
      musicGenres: dto.music?.genres,
      musicTags: dto.music?.tags,
      musicVisibility: dto.music?.visibility,
    };
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.public?.displayName,
        profile: { upsert: { create: profile, update: profile } },
      },
      select: { id: true, email: true, displayName: true, profile: { select: PROFILE_SELECT } },
    });
    return this.toMyProfile(user);
  }

  private toMyProfile(user: {
    id: string;
    email: string;
    displayName: string;
    profile: Parameters<typeof profileOrEmpty>[0];
  }): MyProfileDto {
    const profile = profileOrEmpty(user.profile);
    return {
      id: user.id,
      email: user.email,
      public: toPublicInfo(user.displayName, profile),
      friends: toFriendsInfo(profile),
      private: toPrivateInfo(profile),
      music: toMusicPreferences(profile),
    };
  }
}

function toDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined || value === null) return value;
  return new Date(`${value}T00:00:00Z`);
}
