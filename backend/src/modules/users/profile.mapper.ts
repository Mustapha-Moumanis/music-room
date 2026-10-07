import { Profile, ProfileVisibility } from '@prisma/client';
import { FriendsInfoDto, MusicPreferencesDto, PrivateInfoDto, PublicInfoDto } from './dto/profile.dto';

export type ProfileRow = Pick<Profile,
  'bio' | 'avatarUrl' | 'realName' | 'city' | 'birthDate' | 'phone' | 'musicGenres' | 'musicTags' | 'musicVisibility'>;

export const PROFILE_SELECT = {
  bio: true, avatarUrl: true, realName: true, city: true, birthDate: true, phone: true,
  musicGenres: true, musicTags: true, musicVisibility: true,
} as const;

/** Every user gets a profile row at sign-up; this stands in if one is ever missing. */
const EMPTY_PROFILE: ProfileRow = {
  bio: null, avatarUrl: null, realName: null, city: null, birthDate: null, phone: null,
  musicGenres: [], musicTags: [], musicVisibility: ProfileVisibility.PUBLIC,
};

export function profileOrEmpty(profile: ProfileRow | null | undefined): ProfileRow {
  return profile ?? EMPTY_PROFILE;
}

export function toPublicInfo(displayName: string, profile: ProfileRow): PublicInfoDto {
  return { displayName, bio: profile.bio, avatarUrl: profile.avatarUrl };
}

export function toFriendsInfo(profile: ProfileRow): FriendsInfoDto {
  return { realName: profile.realName, city: profile.city };
}

export function toPrivateInfo(profile: ProfileRow): PrivateInfoDto {
  return { birthDate: profile.birthDate?.toISOString().slice(0, 10) ?? null, phone: profile.phone };
}

export function toMusicPreferences(profile: ProfileRow): MusicPreferencesDto {
  return { genres: profile.musicGenres, tags: profile.musicTags, visibility: profile.musicVisibility };
}
