import { apiClient } from './client';
import type { Relationship, UserSummary } from './users';

export type Friend = UserSummary & { since: string };
export type FriendRequest = { user: UserSummary; createdAt: string };
export type FriendRequests = { incoming: FriendRequest[]; outgoing: FriendRequest[] };
export type RelationshipResult = { userId: string; relationship: Relationship };

export const friendKeys = {
  all: ['friends'] as const,
  list: ['friends', 'list'] as const,
  requests: ['friends', 'requests'] as const,
};

const userPath = (userId: string) => encodeURIComponent(userId);

export const listFriends = () =>
  apiClient.get<Friend[]>('/friends').then((response) => response.data);

export const listFriendRequests = () =>
  apiClient.get<FriendRequests>('/friends/requests').then((response) => response.data);

export const sendFriendRequest = (userId: string) =>
  apiClient.post<RelationshipResult>(`/friends/requests/${userPath(userId)}`).then((response) => response.data);

export const acceptFriendRequest = (userId: string) =>
  apiClient.post<RelationshipResult>(`/friends/requests/${userPath(userId)}/accept`).then((response) => response.data);

export const declineFriendRequest = (userId: string) =>
  apiClient.post<void>(`/friends/requests/${userPath(userId)}/decline`).then(() => undefined);

export const cancelFriendRequest = (userId: string) =>
  apiClient.delete<void>(`/friends/requests/${userPath(userId)}`).then(() => undefined);

export const removeFriend = (userId: string) =>
  apiClient.delete<void>(`/friends/${userPath(userId)}`).then(() => undefined);
