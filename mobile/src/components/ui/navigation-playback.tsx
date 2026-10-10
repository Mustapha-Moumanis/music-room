/* eslint-disable @typescript-eslint/no-require-imports */
import {
  Add01Icon,
  Calendar03Icon,
  HeartIcon,
  Home01Icon,
  MoreVerticalIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  Playlist01Icon,
  PreviousIcon,
  Queue01Icon,
  RepeatIcon,
  Search01Icon,
  Settings01Icon,
  ShuffleIcon,
  UserGroupIcon,
  UserIcon,
  VolumeHighIcon,
} from '@hugeicons/core-free-icons';
import { Image, type ImageProps } from 'expo-image';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing } from '../../theme';
import { AppIcon, type AppIconData } from './app-icon';
import { AppText } from './app-text';
import { Avatar } from './identity-status';
import { pressedFeedback } from './interaction-feedback';
import { SearchField, type SearchFieldProps } from './form-fields';

const defaultWebPlayerArtwork = require('../../../assets/images/web-player-artwork.jpg') as number;

export type ChromeLayoutStyle = Pick<
  ViewStyle,
  'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type MiniPlayerState = 'playing' | 'paused';
export type MobileNavigationDestination = 'home' | 'events' | 'playlists' | 'friends' | 'profile';
export type WebNavigationDestination = 'home' | 'events' | 'playlists' | 'friends' | 'settings' | 'none';
export type WebBreakpoint = 'desktop' | 'tablet';
export type TopBarState = 'default' | 'search';
export type PlayerAction =
  | 'favorite'
  | 'shuffle'
  | 'previous'
  | 'playPause'
  | 'next'
  | 'repeat'
  | 'queue'
  | 'volume'
  | 'more';

function percentage(value: number): `${number}%` {
  const normalized = Number((Math.min(1, Math.max(0, value)) * 100).toFixed(2));
  return `${normalized}%`;
}

type PlayerArtworkProps = {
  fallbackColor?: string;
  size: number;
  source?: ImageProps['source'];
  testID?: string;
};

function PlayerArtwork({
  fallbackColor = colors.action.primary,
  size,
  source,
  testID,
}: PlayerArtworkProps) {
  return <View
    testID={testID}
    style={[styles.playerArtwork, { width: size, height: size, backgroundColor: fallbackColor }]}
  >
    {source ? <Image
      source={source}
      contentFit="cover"
      accessible={false}
      testID={testID ? `${testID}-image` : undefined}
      style={styles.artworkImage}
    /> : null}
  </View>;
}

type IconControlProps = {
  action: PlayerAction;
  icon: AppIconData;
  label: string;
  onAction?: (action: PlayerAction) => void;
  primary?: boolean;
  testID?: string;
};

function IconControl({ action, icon, label, onAction, primary = false, testID }: IconControlProps) {
  return <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    hitSlop={primary ? undefined : spacing[4]}
    onPress={() => onAction?.(action)}
    testID={testID}
    style={({ pressed }) => [
      primary ? styles.mainPlayerControl : styles.playerIconControl,
      pressed && pressedFeedback,
    ]}
  >
    <AppIcon
      icon={icon}
      size="standard"
      tone={primary ? 'onAccent' : 'default'}
    />
  </Pressable>;
}

export type MiniPlayerProps = {
  artist: string;
  artworkSource?: ImageProps['source'];
  onFavoritePress?: PressableProps['onPress'];
  onPlayPausePress?: PressableProps['onPress'];
  progress?: number;
  state?: MiniPlayerState;
  style?: StyleProp<ChromeLayoutStyle>;
  testID?: string;
  title: string;
};

export function MiniPlayer({
  artist,
  artworkSource,
  onFavoritePress,
  onPlayPausePress,
  progress,
  state = 'playing',
  style,
  testID,
  title,
}: MiniPlayerProps) {
  const isPlaying = state === 'playing';
  const resolvedProgress = progress ?? (isPlaying ? 0.408 : 0.274);

  return <View testID={testID} style={[style, styles.miniPlayer]}>
    <View style={styles.miniPlayerCard}>
      <View style={styles.miniPlayerContent}>
        <View style={styles.miniPlayerRow}>
          <PlayerArtwork
            size={layout.minimumTouchTarget}
            source={artworkSource}
            testID={testID ? `${testID}-artwork` : undefined}
          />
          <View style={styles.miniTrackCopy}>
            <AppText variant="bodySmall" numberOfLines={1}>{title}</AppText>
            <AppText variant="caption" color="text.muted" numberOfLines={1}>{artist}</AppText>
          </View>
          <Pressable
            accessibilityLabel="Favorite track"
            accessibilityRole="button"
            onPress={onFavoritePress}
            testID={testID ? `${testID}-favorite` : undefined}
            style={({ pressed }) => [styles.miniIconControl, pressed && pressedFeedback]}
          >
            <AppIcon icon={HeartIcon} size="compact" />
          </Pressable>
          <Pressable
            accessibilityLabel={isPlaying ? 'Pause track' : 'Play track'}
            accessibilityRole="button"
            onPress={onPlayPausePress}
            testID={testID ? `${testID}-play-pause` : undefined}
            style={({ pressed }) => [styles.miniIconControl, pressed && pressedFeedback]}
          >
            <AppIcon icon={isPlaying ? PauseIcon : PlayIcon} size="standard" />
          </Pressable>
        </View>
        <View testID={testID ? `${testID}-progress` : undefined} style={styles.miniProgress}>
          <View
            testID={testID ? `${testID}-elapsed` : undefined}
            style={[styles.miniElapsed, { width: percentage(resolvedProgress) }]}
          />
        </View>
      </View>
    </View>
  </View>;
}

const mobileNavigationItems: Array<{
  icon: AppIconData;
  label: string;
  value: MobileNavigationDestination;
}> = [
  { icon: Home01Icon, label: 'Home', value: 'home' },
  { icon: Calendar03Icon, label: 'Events', value: 'events' },
  { icon: Playlist01Icon, label: 'Playlists', value: 'playlists' },
  { icon: UserGroupIcon, label: 'Friends', value: 'friends' },
  { icon: UserIcon, label: 'Profile', value: 'profile' },
];

export type BottomNavigationProps = {
  active?: MobileNavigationDestination;
  onNavigate?: (destination: MobileNavigationDestination) => void;
  style?: StyleProp<ChromeLayoutStyle>;
  testID?: string;
};

export function BottomNavigation({
  active = 'home',
  onNavigate,
  style,
  testID,
}: BottomNavigationProps) {
  return <View
    accessibilityRole="tablist"
    testID={testID}
    style={[style, styles.bottomNavigation]}
  >
    {mobileNavigationItems.map((item) => {
      const selected = active === item.value;
      return <Pressable
        key={item.value}
        accessibilityLabel={item.label}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        onPress={() => onNavigate?.(item.value)}
        testID={testID ? `${testID}-${item.value}` : undefined}
        style={({ pressed }) => [styles.bottomNavigationItem, pressed && pressedFeedback]}
      >
        <AppIcon icon={item.icon} size="standard" tone={selected ? 'default' : 'muted'} />
        <AppText variant="caption" color={selected ? 'text.primary' : 'text.muted'}>
          {item.label}
        </AppText>
        <View
          testID={testID ? `${testID}-${item.value}-indicator` : undefined}
          style={[styles.mobileIndicator, !selected && styles.hiddenIndicator]}
        />
      </Pressable>;
    })}
  </View>;
}

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

const webPrimaryNavigation: Array<{
  icon: AppIconData;
  label: string;
  value: Exclude<WebNavigationDestination, 'settings' | 'none'>;
}> = [
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

export type TopBarProps = {
  accountLabel?: string;
  accountName: string;
  avatarSource?: ImageProps['source'];
  breakpoint?: WebBreakpoint;
  initials: string;
  onAccountPress?: PressableProps['onPress'];
  onMorePress?: PressableProps['onPress'];
  searchProps?: Omit<SearchFieldProps, 'style'>;
  state?: TopBarState;
  style?: StyleProp<ChromeLayoutStyle>;
  testID?: string;
};

export function TopBar({
  accountLabel = 'Account',
  accountName,
  avatarSource,
  breakpoint = 'desktop',
  initials,
  onAccountPress,
  onMorePress,
  searchProps,
  state = 'default',
  style,
  testID,
}: TopBarProps) {
  const compact = breakpoint === 'tablet';
  const searchWidth = compact ? 360 : state === 'search' ? 430 : 340;
  const placeholder = compact
    ? 'Search songs, artists, albums...'
    : state === 'search'
      ? 'Search Music Room'
      : 'Search tracks, people, events...';

  return <View
    testID={testID}
    style={[
      style,
      styles.topBar,
      compact ? styles.tabletTopBar : styles.desktopTopBar,
    ]}
  >
    <SearchField
      {...searchProps}
      placeholder={searchProps?.placeholder ?? placeholder}
      testOnly_focused={state === 'search' || searchProps?.testOnly_focused}
      testID={testID ? `${testID}-search` : undefined}
      style={{ maxWidth: searchWidth }}
    />
    <View style={styles.topBarAccountGroup}>
      <Pressable
        accessibilityLabel={`Open ${accountName} account`}
        accessibilityRole="button"
        onPress={onAccountPress}
        testID={testID ? `${testID}-account` : undefined}
        style={({ pressed }) => [styles.topBarAccount, pressed && pressedFeedback]}
      >
        <Avatar
          initials={initials}
          size="topBar"
          source={avatarSource}
          accessibilityLabel={`${accountName} profile photo`}
          testID={testID ? `${testID}-avatar` : undefined}
        />
        <View style={styles.topBarAccountCopy}>
          <AppText variant="bodySmall" numberOfLines={1}>{accountName}</AppText>
          <AppText variant="caption" color="text.muted" numberOfLines={1}>{accountLabel}</AppText>
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel="More account options"
        accessibilityRole="button"
        hitSlop={spacing[12]}
        onPress={onMorePress}
        testID={testID ? `${testID}-more` : undefined}
        style={({ pressed }) => [styles.topBarMore, pressed && pressedFeedback]}
      >
        <AppIcon icon={MoreVerticalIcon} size="compact" tone="muted" />
      </Pressable>
    </View>
  </View>;
}

export type WebPlayerProps = {
  artist: string;
  artworkSource?: ImageProps['source'];
  breakpoint?: WebBreakpoint;
  currentTime?: string;
  duration?: string;
  onAction?: (action: PlayerAction) => void;
  progress?: number;
  style?: StyleProp<ChromeLayoutStyle>;
  testID?: string;
  title: string;
  volume?: number;
};

export function WebPlayer({
  artist,
  artworkSource = defaultWebPlayerArtwork,
  breakpoint = 'desktop',
  currentTime = '1:42',
  duration = '3:56',
  onAction,
  progress = 0.43,
  style,
  testID,
  title,
  volume = 0.68,
}: WebPlayerProps) {
  const compact = breakpoint === 'tablet';

  return <View
    testID={testID}
    style={[
      style,
      styles.webPlayer,
      compact ? styles.tabletWebPlayer : styles.desktopWebPlayer,
    ]}
  >
    <View style={[styles.webTrackInfo, compact ? styles.tabletTrackInfo : styles.desktopTrackInfo]}>
      <PlayerArtwork
        size={52}
        source={artworkSource}
        testID={testID ? `${testID}-artwork` : undefined}
      />
      <View style={[styles.webTrackCopy, compact ? styles.tabletTrackCopy : styles.desktopTrackCopy]}>
        <AppText variant="bodySmall" numberOfLines={1}>{title}</AppText>
        <AppText variant="caption" color="text.muted" numberOfLines={1}>{artist}</AppText>
      </View>
      <IconControl
        action="favorite"
        icon={HeartIcon}
        label="Favorite track"
        onAction={onAction}
        testID={testID ? `${testID}-favorite` : undefined}
      />
    </View>

    <View style={[styles.webTransport, compact ? styles.tabletTransport : styles.desktopTransport]}>
      <View style={styles.webControls}>
        <IconControl action="shuffle" icon={ShuffleIcon} label="Shuffle" onAction={onAction} testID={testID ? `${testID}-shuffle` : undefined} />
        <IconControl action="previous" icon={PreviousIcon} label="Previous track" onAction={onAction} testID={testID ? `${testID}-previous` : undefined} />
        <IconControl action="playPause" icon={PauseIcon} label="Pause track" onAction={onAction} primary testID={testID ? `${testID}-play-pause` : undefined} />
        <IconControl action="next" icon={NextIcon} label="Next track" onAction={onAction} testID={testID ? `${testID}-next` : undefined} />
        <IconControl action="repeat" icon={RepeatIcon} label="Repeat" onAction={onAction} testID={testID ? `${testID}-repeat` : undefined} />
      </View>
      <View style={[styles.webProgressGroup, compact ? styles.tabletProgressGroup : styles.desktopProgressGroup]}>
        <View testID={testID ? `${testID}-progress` : undefined} style={styles.webProgress}>
          <View style={[styles.webElapsed, { width: percentage(progress) }]} />
        </View>
        <View style={styles.webTimes}>
          <AppText variant="caption" color="text.muted">{currentTime}</AppText>
          <AppText variant="caption" color="text.muted">{duration}</AppText>
        </View>
      </View>
    </View>

    <View style={[styles.webUtilities, compact ? styles.tabletUtilities : styles.desktopUtilities]}>
      <IconControl action="queue" icon={Queue01Icon} label="Open queue" onAction={onAction} testID={testID ? `${testID}-queue` : undefined} />
      <IconControl action="volume" icon={VolumeHighIcon} label="Volume" onAction={onAction} testID={testID ? `${testID}-volume` : undefined} />
      <View
        testID={testID ? `${testID}-volume-track` : undefined}
        style={[styles.volumeTrack, compact ? styles.tabletVolume : styles.desktopVolume]}
      >
        <View style={[styles.volumeLevel, { width: percentage(volume) }]} />
      </View>
      <IconControl action="more" icon={MoreVerticalIcon} label="More player options" onAction={onAction} testID={testID ? `${testID}-more` : undefined} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  artworkImage: {
    ...StyleSheet.absoluteFillObject,
  },
  playerArtwork: {
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: radius.small,
  },
  miniPlayer: {
    width: '100%',
    maxWidth: 390,
    height: layout.miniPlayerHeight,
    alignItems: 'center',
  },
  miniPlayerCard: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: spacing[4],
    overflow: 'hidden',
    backgroundColor: colors.background.surface,
  },
  miniPlayerContent: {
    width: '100%',
    maxWidth: 358,
  },
  miniPlayerRow: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 6,
    paddingRight: spacing[8],
    paddingVertical: 6,
    overflow: 'hidden',
  },
  miniTrackCopy: {
    minWidth: 0,
    flex: 1,
    gap: 1,
    overflow: 'hidden',
  },
  miniIconControl: {
    width: layout.minimumTouchTarget,
    height: layout.minimumTouchTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniProgress: {
    width: '100%',
    height: 2,
    overflow: 'hidden',
    backgroundColor: colors.border.subtle,
  },
  miniElapsed: {
    height: 2,
    backgroundColor: colors.action.primary,
  },
  bottomNavigation: {
    width: '100%',
    maxWidth: 390,
    height: layout.bottomNavigationHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    backgroundColor: colors.background.app,
  },
  bottomNavigationItem: {
    width: 64,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    overflow: 'hidden',
  },
  mobileIndicator: {
    width: spacing[4],
    height: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.action.primary,
  },
  hiddenIndicator: {
    opacity: 0,
  },
  webSidebar: {
    flexShrink: 0,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border.subtle,
    backgroundColor: colors.background.app,
  },
  desktopSidebar: {
    width: 264,
    height: 900,
    gap: spacing[24],
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  tabletSidebar: {
    width: 104,
    height: 672,
    gap: 18,
    paddingHorizontal: spacing[4],
    paddingTop: 20,
    paddingBottom: 18,
  },
  desktopBrand: {
    width: 224,
    height: 54,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabletBrand: {
    width: 84,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabletBrandText: {
    width: 72,
    textAlign: 'center',
  },
  desktopPrimaryNavigation: {
    width: 224,
    height: 216,
    gap: 6,
    overflow: 'hidden',
  },
  tabletPrimaryNavigation: {
    width: 56,
    height: 256,
    alignItems: 'center',
    gap: spacing[8],
    overflow: 'hidden',
  },
  desktopSidebarItem: {
    width: 224,
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    paddingLeft: spacing[16],
    paddingRight: spacing[12],
    paddingVertical: 10,
  },
  tabletSidebarItem: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopSidebarUtility: {
    width: 224,
    height: layout.minimumTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    paddingHorizontal: spacing[12],
  },
  activeSidebarItem: {
    borderRadius: radius.medium,
    backgroundColor: colors.action.secondary,
  },
  sidebarDivider: {
    width: 224,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  sidebarPlaylists: {
    width: 224,
    height: 196,
    gap: spacing[8],
    overflow: 'hidden',
  },
  sidebarPlaylistHeading: {
    width: 224,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sidebarPlaylist: {
    width: 224,
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  sidebarPlaylistArtwork: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: radius.small,
  },
  sidebarPlaylistCopy: {
    minWidth: 0,
    flex: 1,
    gap: 1,
    overflow: 'hidden',
  },
  sidebarSpacer: {
    flex: 1,
    minHeight: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[16],
  },
  desktopTopBar: {
    width: 1112,
    height: layout.bottomNavigationHeight,
    paddingHorizontal: spacing[16],
    paddingVertical: 10,
  },
  tabletTopBar: {
    width: 872,
    height: spacing[64],
  },
  topBarAccountGroup: {
    width: 128,
    height: layout.minimumTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    overflow: 'hidden',
  },
  topBarAccount: {
    width: 102,
    height: layout.minimumTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    overflow: 'hidden',
  },
  topBarMore: {
    width: 18,
    height: layout.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarAccountCopy: {
    width: 58,
    height: 34,
    gap: 1,
    overflow: 'hidden',
  },
  webPlayer: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: spacing[12],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.background.app,
  },
  desktopWebPlayer: {
    width: 1440,
  },
  tabletWebPlayer: {
    width: 1024,
  },
  webTrackInfo: {
    height: spacing[64],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    overflow: 'hidden',
  },
  desktopTrackInfo: {
    width: 300,
  },
  tabletTrackInfo: {
    width: 230,
  },
  webTrackCopy: {
    height: layout.minimumTouchTarget,
    gap: 2,
    overflow: 'hidden',
  },
  desktopTrackCopy: {
    width: 180,
  },
  tabletTrackCopy: {
    width: 110,
  },
  webTransport: {
    height: layout.bottomNavigationHeight,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  desktopTransport: {
    width: 700,
  },
  tabletTransport: {
    width: 470,
  },
  webControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    overflow: 'hidden',
  },
  playerIconControl: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mainPlayerControl: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  webProgressGroup: {
    height: 26,
    gap: 6,
    overflow: 'hidden',
  },
  desktopProgressGroup: {
    width: 430,
  },
  tabletProgressGroup: {
    width: 290,
  },
  webProgress: {
    width: '100%',
    height: spacing[4],
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.border.subtle,
  },
  webElapsed: {
    height: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.action.primary,
  },
  webTimes: {
    width: '100%',
    height: spacing[16],
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  webUtilities: {
    height: spacing[64],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[8],
    overflow: 'hidden',
  },
  desktopUtilities: {
    width: 270,
  },
  tabletUtilities: {
    width: 210,
  },
  volumeTrack: {
    height: spacing[4],
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.border.subtle,
  },
  desktopVolume: {
    width: 100,
  },
  tabletVolume: {
    width: 62,
  },
  volumeLevel: {
    height: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.text.primary,
  },
});

