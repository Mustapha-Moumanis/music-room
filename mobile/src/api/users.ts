import { apiClient } from './client';

export type ProfileVisibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
export type Relationship = 'SELF' | 'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'NONE';

export type PublicInfo = { displayName: string; bio: string | null; avatarUrl: string | null };
export type FriendsInfo = { realName: string | null; city: string | null };
export type PrivateInfo = { birthDate: string | null; phone: string | null };
export type MusicPreferences = { genres: string[]; tags: string[]; visibility: ProfileVisibility };

export type MyProfile = {
  id: string;
  email: string;
  public: PublicInfo;
  friends: FriendsInfo;
  private: PrivateInfo;
  music: MusicPreferences;
};

/** Another user's profile: groups the viewer may not see are absent. */
export type UserProfile = {
  id: string;
  relationship: Relationship;
  public: PublicInfo;
  friends?: FriendsInfo;
  private?: PrivateInfo;
  music?: MusicPreferences;
};

export type UserSummary = { id: string; displayName: string; avatarUrl: string | null };
export type UserSearchResult = UserSummary & { relationship: Relationship };

/** Only the fields sent change; null clears a field. */
export type ProfileUpdate = {
  public?: Partial<PublicInfo>;
  friends?: Partial<FriendsInfo>;
  private?: Partial<PrivateInfo>;
  music?: Partial<MusicPreferences>;
};

export const userKeys = {
  all: ['users'] as const,
  me: ['users', 'me'] as const,
  genres: ['users', 'genres'] as const,
  search: (query: string) => ['users', 'search', query] as const,
  profile: (id: string) => ['users', 'profile', id] as const,
};

export const getMyProfile = () =>
  apiClient.get<MyProfile>('/users/me').then((response) => response.data);

export const updateMyProfile = (body: ProfileUpdate) =>
  apiClient.patch<MyProfile>('/users/me', body).then((response) => response.data);

export const getGenres = () =>
  apiClient.get<{ genres: string[] }>('/users/genres').then((response) => response.data.genres);

export const searchUsers = (query: string) =>
  apiClient.get<UserSearchResult[]>('/users/search', { params: { q: query } }).then((response) => response.data);

export const getUserProfile = (id: string) =>
  apiClient.get<UserProfile>(`/users/${encodeURIComponent(id)}`).then((response) => response.data);
