import { Add01Icon, Calendar03Icon, Home01Icon, Playlist01Icon, Settings01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { Pressable, View, type PressableProps, type StyleProp } from 'react-native';

import { colors, spacing } from '../../theme';
import { AppIcon, type AppIconData } from './app-icon';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';
import { navigationPlaybackStyles as styles, type ChromeLayoutStyle, type WebBreakpoint, type WebNavigationDestination } from './navigation-playback-shared';

export type SidebarPlaylistTone = 'primary' | 'secondary' | 'category';

export type SidebarPlaylist = {
  id: string;
  meta: string;
  title: string;
  tone: SidebarPlaylistTone;
};

const sidebarArtworkColors: Record<SidebarPlaylistTone, string> = {
  primary: colors.action.primary,
  secondary: colors.action.secondary,
  category: colors.category.secondary,
};

const webPrimaryNavigation: {
  icon: AppIconData;
  label: string;
  value: Exclude<WebNavigationDestination, 'settings' | 'none'>;
}[] = [
  { icon: Home01Icon, label: 'Home', value: 'home' },
  { icon: Calendar03Icon, label: 'Events', value: 'events' },
  { icon: Playlist01Icon, label: 'Playlists', value: 'playlists' },
  { icon: UserGroupIcon, label: 'Friends', value: 'friends' },
];

type SidebarNavItemProps = {
  active: boolean;
  compact: boolean;
  destination: Exclude<WebNavigationDestination, 'none'>;
  utility?: boolean;
  icon: AppIconData;
  label: string;
  onNavigate?: (destination: Exclude<WebNavigationDestination, 'none'>) => void;
  testID?: string;
};

function SidebarNavItem({
  active,
  compact,
  destination,
  icon,
  label,
  onNavigate,
  testID,
  utility = false,
}: SidebarNavItemProps) {
  return <Pressable
    accessibilityLabel={label}
    accessibilityRole="link"
    accessibilityState={{ selected: active }}
    onPress={() => onNavigate?.(destination)}
    testID={testID}
    style={({ pressed }) => [
      compact
        ? styles.tabletSidebarItem
        : utility
          ? styles.desktopSidebarUtility
          : styles.desktopSidebarItem,
      active && styles.activeSidebarItem,
      pressed && pressedFeedback,
    ]}
  >
    <AppIcon icon={icon} size="standard" tone={active ? 'default' : 'muted'} />
    {!compact ? <AppText
      variant="navigationLabel"
      color={active ? 'text.primary' : 'text.secondary'}
      numberOfLines={1}
    >
      {label}
    </AppText> : null}
  </Pressable>;
}

export type WebSidebarProps = {
  active?: WebNavigationDestination;
  breakpoint?: WebBreakpoint;
  onAddPlaylist?: PressableProps['onPress'];
  onNavigate?: (destination: Exclude<WebNavigationDestination, 'none'>) => void;
  onPlaylistPress?: (playlist: SidebarPlaylist) => void;
  playlists?: SidebarPlaylist[];
  style?: StyleProp<ChromeLayoutStyle>;
  testID?: string;
};

export function WebSidebar({
  active = 'home',
  breakpoint = 'desktop',
  onAddPlaylist,
  onNavigate,
  onPlaylistPress,
  playlists = [],
  style,
  testID,
}: WebSidebarProps) {
  const compact = breakpoint === 'tablet';

  return <View
    testID={testID}
    style={[
      style,
      styles.webSidebar,
      compact ? styles.tabletSidebar : styles.desktopSidebar,
    ]}
  >
    <View style={compact ? styles.tabletBrand : styles.desktopBrand}>
      <AppText variant={compact ? 'navigationLabel' : 'h5'} style={compact ? styles.tabletBrandText : undefined}>
        {compact ? 'Music\nRoom' : 'Music Room'}
      </AppText>
    </View>

    <View style={compact ? styles.tabletPrimaryNavigation : styles.desktopPrimaryNavigation}>
      {webPrimaryNavigation.map((item) => <SidebarNavItem
        key={item.value}
        active={active === item.value}
        compact={compact}
        destination={item.value}
        icon={item.icon}
        label={item.label}
        onNavigate={onNavigate}
        testID={testID ? `${testID}-${item.value}` : undefined}
      />)}
    </View>

    {!compact ? <>
      <View style={styles.sidebarDivider} />
      <View style={styles.sidebarPlaylists}>
        <View style={styles.sidebarPlaylistHeading}>
          <AppText variant="navigationLabel" color="text.secondary">Your playlists</AppText>
          <Pressable
            accessibilityLabel="Add playlist"
            accessibilityRole="button"
            hitSlop={spacing[12]}
            onPress={onAddPlaylist}
            testID={testID ? `${testID}-add-playlist` : undefined}
            style={({ pressed }) => pressed && pressedFeedback}
          >
            <AppIcon icon={Add01Icon} size="compact" tone="muted" />
          </Pressable>
        </View>
        {playlists.slice(0, 3).map((playlist) => <Pressable
          key={playlist.id}
          accessibilityLabel={`${playlist.title}. ${playlist.meta}`}
          accessibilityRole="button"
          onPress={() => onPlaylistPress?.(playlist)}
          testID={testID ? `${testID}-playlist-${playlist.id}` : undefined}
          style={({ pressed }) => [styles.sidebarPlaylist, pressed && pressedFeedback]}
        >
          <View
            style={[
              styles.sidebarPlaylistArtwork,
              { backgroundColor: sidebarArtworkColors[playlist.tone] },
            ]}
          />
          <View style={styles.sidebarPlaylistCopy}>
            <AppText variant="bodySmall" numberOfLines={1}>{playlist.title}</AppText>
            <AppText variant="caption" color="text.muted" numberOfLines={1}>{playlist.meta}</AppText>
          </View>
        </Pressable>)}
      </View>
    </> : null}

    <View style={styles.sidebarSpacer} />
    <SidebarNavItem
      active={active === 'settings'}
      compact={compact}
      destination="settings"
      icon={Settings01Icon}
      label="Settings"
      onNavigate={onNavigate}
      testID={testID ? `${testID}-settings` : undefined}
      utility
    />
  </View>;
}
