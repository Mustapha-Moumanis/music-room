import type {
  EventCardProps,
  FriendRequestRowProps,
  PlaylistCardProps,
  TrackRowProps,
  UserCardProps,
} from '../components/ui';

export const userCardExamples = [
  {
    initials: 'OM',
    meta: '3 mutual interests',
    name: 'Omar Saadi',
    relation: 'stranger',
  },
  {
    initials: 'NA',
    meta: 'Friend · Indie / Soul',
    name: 'Nada Amrani',
    relation: 'friend',
  },
] satisfies UserCardProps[];

export const eventCardExamples = [
  {
    attendeeSummary: '24 listening · 8 tracks',
    meta: 'Tonight · 20:00 · Benguerir',
    state: 'default',
    title: 'Analog Sundays',
  },
  {
    attendeeSummary: '24 listening · 8 tracks',
    meta: 'Tonight · 20:00 · Benguerir',
    state: 'live',
    title: 'Rooftop Tape Night',
  },
  {
    attendeeSummary: '24 listening · 8 tracks',
    meta: 'Tonight · 20:00 · Benguerir',
    state: 'private',
    title: 'Analog Sundays',
  },
] satisfies EventCardProps[];

export const playlistCardExamples = [
  {
    meta: '18 tracks · 1h 12m',
    mode: 'default',
    title: 'Sunday Vinyl',
  },
  {
    meta: 'Collaborative · 4 members',
    mode: 'collaborative',
    title: 'Friends Tape',
  },
  {
    meta: '18 tracks · 1h 12m',
    mode: 'owned',
    title: 'Late Night Drive',
  },
] satisfies PlaylistCardProps[];

export const trackRowExamples = [
  {
    artist: 'The Midnight',
    duration: '3:56',
    mode: 'default',
    title: 'Better Off Alone',
  },
  {
    artist: 'The Midnight',
    duration: '3:56',
    mode: 'playing',
    title: 'Better Off Alone',
  },
  {
    artist: 'The Midnight',
    duration: '3:56',
    mode: 'vote',
    title: 'Better Off Alone',
  },
  {
    artist: 'The Midnight',
    duration: '3:56',
    mode: 'dragging',
    title: 'Better Off Alone',
  },
] satisfies TrackRowProps[];

export const friendRequestExamples = [
  {
    initials: 'NA',
    name: 'Nada Amrani',
    state: 'pending',
  },
  {
    initials: 'NA',
    name: 'Nada Amrani',
    state: 'accepted',
  },
] satisfies FriendRequestRowProps[];
