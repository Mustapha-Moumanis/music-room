import { DragDropVerticalIcon } from '@hugeicons/core-free-icons';
import { Image, type ImageProps } from 'expo-image';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing, type SemanticColorRole } from '../../theme';
import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { Avatar } from './identity-status';
import { pressedFeedback } from './interaction-feedback';
import { VoteButton, type VoteButtonState } from './vote-button';

export type CardRowLayoutStyle = Pick<
  ViewStyle,
  'width' | 'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type UserCardRelation = 'stranger' | 'friend';
export type EventCardState = 'default' | 'live' | 'private';
export type PlaylistCardMode = 'default' | 'collaborative' | 'owned';
export type TrackRowMode = 'default' | 'playing' | 'vote' | 'dragging';
export type FriendRequestState = 'pending' | 'accepted';

type ArtworkProps = {
  fallbackColor: string;
  source?: ImageProps['source'];
  style: StyleProp<ViewStyle>;
  testID?: string;
};

function Artwork({ fallbackColor, source, style, testID }: ArtworkProps) {
  return <View testID={testID} style={[style, { backgroundColor: fallbackColor }]}>
    {source ? <Image
      testID={testID ? `${testID}-image` : undefined}
      source={source}
      contentFit="cover"
      accessible={false}
      style={styles.artworkImage}
    /> : null}
  </View>;
}

type PillProps = {
  backgroundColor: string;
  color?: SemanticColorRole;
  label: string;
  testID?: string;
};

function Pill({ backgroundColor, color = 'text.primary', label, testID }: PillProps) {
  return <View testID={testID} style={[styles.pill, { backgroundColor }]}>
    <AppText variant="caption" color={color}>{label}</AppText>
  </View>;
}

export type UserCardProps = Omit<ViewProps, 'children' | 'style'> & {
  actionLabel?: string;
  avatarSource?: ImageProps['source'];
  initials: string;
  meta: string;
  name: string;
  onActionPress?: PressableProps['onPress'];
  relation?: UserCardRelation;
  style?: StyleProp<CardRowLayoutStyle>;
};

export function UserCard({
  actionLabel,
  avatarSource,
  initials,
  meta,
  name,
  onActionPress,
  relation = 'stranger',
  style,
  testID,
  ...viewProps
}: UserCardProps) {
  const isFriend = relation === 'friend';
  const resolvedActionLabel = actionLabel ?? (isFriend ? 'Friend' : 'Add friend');

  return <View {...viewProps} testID={testID} style={[style, styles.userCard]}>
    <Avatar
      initials={initials}
      size="card"
      source={avatarSource}
      accessibilityLabel={`${name} profile photo`}
      testID={testID ? `${testID}-avatar` : undefined}
    />
    <View style={styles.compactCopy}>
      <AppText variant="navigationLabel" numberOfLines={1}>{name}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={1}>{meta}</AppText>
    </View>
    <Pressable
      accessibilityLabel={resolvedActionLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isFriend }}
      disabled={isFriend}
      onPress={onActionPress}
      testID={testID ? `${testID}-action` : undefined}
      style={({ pressed }) => [styles.pillHitTarget, pressed && pressedFeedback]}
    >
      <Pill
        label={resolvedActionLabel}
        backgroundColor={isFriend ? colors.category.secondary : colors.action.secondary}
        color={isFriend ? 'text.primary' : 'text.onAccent'}
        testID={testID ? `${testID}-action-pill` : undefined}
      />
    </Pressable>
  </View>;
}

export type EventCardProps = Omit<PressableProps, 'children' | 'style'> & {
  artworkSource?: ImageProps['source'];
  attendeeSummary: string;
  meta: string;
  state?: EventCardState;
  style?: StyleProp<CardRowLayoutStyle>;
  title: string;
};

const eventStatusLabels: Record<EventCardState, string> = {
  default: 'PUBLIC',
  live: 'LIVE',
  private: 'PRIVATE',
};

const eventStatusBackgrounds: Record<EventCardState, string> = {
  default: colors.action.secondary,
  live: colors.action.primary,
  private: colors.category.secondary,
};

export function EventCard({
  accessibilityLabel,
  artworkSource,
  attendeeSummary,
  meta,
  state = 'default',
  style,
  testID,
  title,
  ...pressableProps
}: EventCardProps) {
  return <Pressable
    {...pressableProps}
    accessible
    accessibilityLabel={accessibilityLabel ?? `${title}. ${eventStatusLabels[state]}. ${meta}. ${attendeeSummary}`}
    accessibilityRole="button"
    testID={testID}
    style={({ pressed }) => [style, styles.eventCard, pressed && pressedFeedback]}
  >
    <Artwork
      fallbackColor={state === 'live' ? colors.action.primary : colors.category.secondary}
      source={artworkSource}
      style={styles.eventArtwork}
      testID={testID ? `${testID}-artwork` : undefined}
    />
    <View style={styles.titleRow}>
      <AppText variant="h5" numberOfLines={1} style={styles.titleText}>{title}</AppText>
      <Pill
        label={eventStatusLabels[state]}
        backgroundColor={eventStatusBackgrounds[state]}
        color={state === 'live' ? 'text.onAccent' : 'text.primary'}
        testID={testID ? `${testID}-status` : undefined}
      />
    </View>
    <AppText variant="bodySmall" color="text.secondary" numberOfLines={1}>{meta}</AppText>
    <AppText variant="caption" color="text.muted" numberOfLines={1}>{attendeeSummary}</AppText>
  </Pressable>;
}

export type PlaylistCardProps = Omit<PressableProps, 'children' | 'style'> & {
  artworkSource?: ImageProps['source'];
  meta: string;
  mode?: PlaylistCardMode;
  style?: StyleProp<CardRowLayoutStyle>;
  title: string;
};

export function PlaylistCard({
  accessibilityLabel,
  artworkSource,
  meta,
  mode = 'default',
  style,
  testID,
  title,
  ...pressableProps
}: PlaylistCardProps) {
  return <Pressable
    {...pressableProps}
    accessible
    accessibilityLabel={accessibilityLabel ?? `${title}. ${meta}`}
    accessibilityRole="button"
    testID={testID}
    style={({ pressed }) => [style, styles.playlistCard, pressed && pressedFeedback]}
  >
    <Artwork
      fallbackColor={mode === 'collaborative' ? colors.action.secondary : colors.category.secondary}
      source={artworkSource}
      style={styles.playlistArtwork}
      testID={testID ? `${testID}-artwork` : undefined}
    />
    <AppText variant="h5" numberOfLines={1} style={styles.playlistCopy}>{title}</AppText>
    <AppText variant="caption" color="text.muted" numberOfLines={1} style={styles.playlistCopy}>{meta}</AppText>
  </Pressable>;
}

export type TrackRowProps = Omit<ViewProps, 'children' | 'style'> & {
  artist: string;
  artworkSource?: ImageProps['source'];
  duration: string;
  mode?: TrackRowMode;
  onVotePress?: PressableProps['onPress'];
  style?: StyleProp<CardRowLayoutStyle>;
  title: string;
  voteState?: VoteButtonState;
};

export function TrackRow({
  artist,
  artworkSource,
  duration,
  mode = 'default',
  onVotePress,
  style,
  testID,
  title,
  voteState = 'available',
  ...viewProps
}: TrackRowProps) {
  const isDragging = mode === 'dragging';
  const isPlaying = mode === 'playing';

  return <View
    {...viewProps}
    testID={testID}
    style={[
      style,
      styles.trackRow,
      mode !== 'default' && styles.roundedRow,
      isPlaying && styles.playingRow,
      isDragging && styles.draggingRow,
    ]}
  >
    {isDragging ? <AppIcon
      icon={DragDropVerticalIcon}
      size="standard"
      tone="default"
      label="Drag track"
      testID={testID ? `${testID}-drag-handle` : undefined}
    /> : null}
    <Artwork
      fallbackColor={isPlaying ? colors.action.primary : colors.category.secondary}
      source={artworkSource}
      style={styles.trackArtwork}
      testID={testID ? `${testID}-artwork` : undefined}
    />
    <View style={styles.compactCopy}>
      <AppText variant="navigationLabel" numberOfLines={1}>{title}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={1}>{artist}</AppText>
    </View>
    {mode === 'vote' ? <VoteButton
      onPress={onVotePress}
      state={voteState}
      testID={testID ? `${testID}-vote` : undefined}
    /> : <AppText
      variant="caption"
      color={isPlaying ? 'action.primary' : 'text.muted'}
      numberOfLines={1}
    >
      {isPlaying ? 'Playing' : duration}
    </AppText>}
  </View>;
}

export type FriendRequestRowProps = Omit<ViewProps, 'children' | 'style'> & {
  avatarSource?: ImageProps['source'];
  initials: string;
  name: string;
  onAccept?: PressableProps['onPress'];
  onDecline?: PressableProps['onPress'];
  state?: FriendRequestState;
  style?: StyleProp<CardRowLayoutStyle>;
};

export function FriendRequestRow({
  avatarSource,
  initials,
  name,
  onAccept,
  onDecline,
  state = 'pending',
  style,
  testID,
  ...viewProps
}: FriendRequestRowProps) {
  const isAccepted = state === 'accepted';
  const summary = isAccepted ? 'Friend request accepted' : 'Sent you a request';

  return <View {...viewProps} testID={testID} style={[style, styles.friendRequestRow]}>
    <Avatar
      initials={initials}
      size="medium"
      source={avatarSource}
      accessibilityLabel={`${name} profile photo`}
      testID={testID ? `${testID}-avatar` : undefined}
    />
    <View style={[styles.compactCopy, styles.friendCopy]}>
      <AppText variant="navigationLabel" numberOfLines={1}>{name}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={1}>{summary}</AppText>
    </View>
    {isAccepted ? <Pill
      label="Friend"
      backgroundColor={colors.category.secondary}
      testID={testID ? `${testID}-status` : undefined}
    /> : <View style={styles.requestActions}>
      <Pressable
        accessibilityLabel={`Accept ${name}'s friend request`}
        accessibilityRole="button"
        onPress={onAccept}
        testID={testID ? `${testID}-accept` : undefined}
        style={({ pressed }) => [styles.pillHitTarget, pressed && pressedFeedback]}
      >
        <Pill label="Accept" backgroundColor={colors.action.secondary} color="text.onAccent" />
      </Pressable>
      <Pressable
        accessibilityLabel={`Decline ${name}'s friend request`}
        accessibilityRole="button"
        onPress={onDecline}
        testID={testID ? `${testID}-decline` : undefined}
        style={({ pressed }) => [styles.pillHitTarget, pressed && pressedFeedback]}
      >
        <Pill label="Decline" backgroundColor={colors.background.app} color="text.secondary" />
      </Pressable>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  artworkImage: {
    ...StyleSheet.absoluteFillObject,
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
    borderWidth: 2,
    borderColor: colors.action.secondary,
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

