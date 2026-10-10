import type {
  MiniPlayerState,
  MobileNavigationDestination,
  SidebarPlaylist,
  TopBarState,
  WebNavigationDestination,
} from '../components/ui';

export const miniPlayerStates: MiniPlayerState[] = ['playing', 'paused'];

export const bottomNavigationStates: MobileNavigationDestination[] = [
  'home',
  'events',
  'playlists',
  'friends',
  'profile',
];

export const webNavigationStates: WebNavigationDestination[] = [
  'home',
  'events',
  'playlists',
  'friends',
  'settings',
  'none',
];

export const topBarStates: TopBarState[] = ['default', 'search'];

export const sidebarPlaylistExamples: SidebarPlaylist[] = [
  {
    id: 'late-night-drive',
    meta: '18 tracks',
    title: 'Late Night Drive',
    tone: 'primary',
  },
  {
    id: 'friends-tape',
    meta: 'Collaborative',
    title: 'Friends Tape',
    tone: 'secondary',
  },
  {
    id: 'sunday-vinyl',
    meta: 'Soul · Jazz',
    title: 'Sunday Vinyl',
    tone: 'category',
  },
];
