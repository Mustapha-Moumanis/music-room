import type {
  MiniPlayerState,
  MobileNavigationDestination,
  SidebarPlaylist,
  TopBarState,
  WebNavigationDestination,
} from '../components/ui';
import examples from '../content/dev-examples.json';

export const miniPlayerStates = examples.navigation.miniPlayerStates as MiniPlayerState[];
export const bottomNavigationStates = examples.navigation.mobileDestinations as MobileNavigationDestination[];
export const webNavigationStates = examples.navigation.webDestinations as WebNavigationDestination[];
export const topBarStates = examples.navigation.topBarStates as TopBarState[];
export const sidebarPlaylistExamples = examples.navigation.sidebarPlaylists as SidebarPlaylist[];
