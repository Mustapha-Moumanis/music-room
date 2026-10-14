import { Image, type ImageProps } from 'expo-image';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, layout, radius, spacing } from '../../theme';
import { AppIcon, type AppIconData } from './app-icon';
import { pressedFeedback } from './interaction-feedback';

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

export function percentage(value: number): `${number}%` {
  const normalized = Number((Math.min(1, Math.max(0, value)) * 100).toFixed(2));
  return `${normalized}%`;
}

export type PlayerArtworkProps = {
  fallbackColor?: string;
  size: number;
  source?: ImageProps['source'];
  testID?: string;
};

export function PlayerArtwork({
  fallbackColor = colors.action.primary,
  size,
  source,
  testID,
}: PlayerArtworkProps) {
  return <View
    testID={testID}
    style={[navigationPlaybackStyles.playerArtwork, { width: size, height: size, backgroundColor: fallbackColor }]}
  >
    {source ? <Image
      source={source}
      contentFit="cover"
      accessible={false}
      testID={testID ? `${testID}-image` : undefined}
      style={navigationPlaybackStyles.artworkImage}
    /> : null}
  </View>;
}

export type IconControlProps = {
  action: PlayerAction;
  icon: AppIconData;
  label: string;
  onAction?: (action: PlayerAction) => void;
  primary?: boolean;
  testID?: string;
};

export function IconControl({ action, icon, label, onAction, primary = false, testID }: IconControlProps) {
  return <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    hitSlop={primary ? undefined : spacing[4]}
    onPress={() => onAction?.(action)}
    testID={testID}
    style={({ pressed }) => [
      primary ? navigationPlaybackStyles.mainPlayerControl : navigationPlaybackStyles.playerIconControl,
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

export const navigationPlaybackStyles = StyleSheet.create({
  artworkImage: {
    ...StyleSheet.absoluteFill,
  },
  playerArtwork: {
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: radius.small,
  },
  miniPlayer: {
    width: '100%',
    maxWidth: 430,
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
    backgroundColor: colors.category.secondary,
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
  miniTrackArea: {
    minWidth: 0,
    minHeight: layout.minimumTouchTarget,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    maxWidth: 430,
    height: layout.bottomNavigationHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    backgroundColor: colors.background.app,
  },
  bottomNavigationItem: {
    minWidth: 0,
    maxWidth: 64,
    flex: 1,
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
