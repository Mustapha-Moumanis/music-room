import { Image, type ImageProps } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout, radius, spacing, type SemanticColorRole } from '../../theme';
import { AppText } from './app-text';

export type CardRowLayoutStyle = Pick<
  ViewStyle,
  'width' | 'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type UserCardRelation = 'stranger' | 'friend';
export type EventCardState = 'default' | 'live' | 'private';
export type PlaylistCardMode = 'default' | 'collaborative' | 'owned';
export type TrackRowMode = 'default' | 'playing' | 'vote' | 'dragging';
export type FriendRequestState = 'pending' | 'accepted';

export type ArtworkProps = {
  fallbackColor: string;
  source?: ImageProps['source'];
  style: StyleProp<ViewStyle>;
  testID?: string;
};

export function Artwork({ fallbackColor, source, style, testID }: ArtworkProps) {
  return <View testID={testID} style={[style, { backgroundColor: fallbackColor }]}>
    {source ? <Image
      testID={testID ? `${testID}-image` : undefined}
      source={source}
      contentFit="cover"
      accessible={false}
      style={cardRowStyles.artworkImage}
    /> : null}
  </View>;
}

export type PillProps = {
  backgroundColor: string;
  color?: SemanticColorRole;
  label: string;
  testID?: string;
};

export function Pill({ backgroundColor, color = 'text.primary', label, testID }: PillProps) {
  return <View testID={testID} style={[cardRowStyles.pill, { backgroundColor }]}>
    <AppText variant="caption" color={color}>{label}</AppText>
  </View>;
}

export const cardRowStyles = StyleSheet.create({
  artworkImage: {
    ...StyleSheet.absoluteFill,
  },
  pill: {
    height: spacing[32],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.full,
  },
  pillHitTarget: {
    minWidth: layout.minimumTouchTarget,
    height: layout.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCopy: {
    minWidth: 0,
    flex: 1,
    gap: spacing[4],
    overflow: 'hidden',
  },
  trackRank: {
    width: 20,
    textAlign: 'center',
  },
  dragHandle: {
    width: layout.minimumTouchTarget,
    height: layout.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    width: '100%',
    maxWidth: 360,
    minHeight: 88,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[16],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  userCardIdentity: {
    minWidth: 0,
    minHeight: layout.minimumTouchTarget,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
  },
  eventCard: {
    width: '100%',
    maxWidth: 360,
    height: 290,
    alignItems: 'stretch',
    gap: spacing[12],
    padding: spacing[16],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  eventArtwork: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
    borderRadius: radius.media,
  },
  titleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[12],
    overflow: 'hidden',
  },
  titleText: {
    minWidth: 0,
    flex: 1,
  },
  playlistCard: {
    width: '100%',
    maxWidth: 280,
    height: 330,
    alignItems: 'stretch',
    gap: spacing[12],
    padding: spacing[16],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  playlistArtwork: {
    width: '100%',
    height: 210,
    overflow: 'hidden',
    borderRadius: radius.media,
  },
  playlistCopy: {
    width: '100%',
  },
  trackRow: {
    width: '100%',
    maxWidth: 720,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[12],
    backgroundColor: colors.background.app,
  },
  roundedRow: {
    borderRadius: radius.medium,
  },
  playingRow: {
    backgroundColor: colors.background.surface,
  },
  draggingRow: {
    backgroundColor: colors.background.surface,
  },
  trackArtwork: {
    width: spacing[48],
    height: spacing[48],
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: radius.medium,
  },
  friendRequestRow: {
    width: '100%',
    maxWidth: layout.previewMaxWidth,
    minHeight: 72,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  friendCopy: {
    minWidth: 72,
  },
  requestActions: {
    minHeight: layout.minimumTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    marginLeft: 'auto',
  },
});
