import type {
  EventCardProps,
  FriendRequestRowProps,
  PlaylistCardProps,
  TrackRowProps,
  UserCardProps,
} from '../components/ui';
import examples from '../content/dev-examples.json';

export const userCardExamples = examples.cards.users as UserCardProps[];
export const eventCardExamples = examples.cards.events as EventCardProps[];
export const playlistCardExamples = examples.cards.playlists as PlaylistCardProps[];
export const trackRowExamples = examples.cards.tracks as TrackRowProps[];
export const friendRequestExamples = examples.cards.friendRequests as FriendRequestRowProps[];
