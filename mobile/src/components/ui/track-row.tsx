import { DragDropVerticalIcon } from '@hugeicons/core-free-icons';
import type { ImageProps } from 'expo-image';
import type { ReactNode } from 'react';
import { View, type PressableProps, type StyleProp, type ViewProps } from 'react-native';

import { colors } from '../../theme';
import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { Artwork, cardRowStyles as styles, type CardRowLayoutStyle, type TrackRowMode } from './card-row-shared';
import { VoteButton, type VoteButtonState } from './vote-button';

export type TrackRowProps = Omit<ViewProps, 'children' | 'style'> & {
  actions?: ReactNode;
  artist: string;
  artworkSource?: ImageProps['source'];
  compactVote?: boolean;
  dragHandleProps?: ViewProps;
  duration: string;
  mode?: TrackRowMode;
  onVotePress?: PressableProps['onPress'];
  rank?: number;
  status?: string;
  style?: StyleProp<CardRowLayoutStyle>;
  title: string;
  voteCount?: number;
  voteState?: VoteButtonState;
};

export function TrackRow({
  actions,
  artist,
  artworkSource,
  compactVote = false,
  dragHandleProps,
  duration,
  mode = 'default',
  onVotePress,
  rank,
  status,
  style,
  testID,
  title,
  voteCount,
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
    {typeof rank === 'number' ? <AppText variant="navigationLabel" color="text.secondary" style={styles.trackRank}>{rank}</AppText> : null}
    {isDragging ? <View
      {...dragHandleProps}
      accessibilityLabel={dragHandleProps?.accessibilityLabel ?? 'Reorder track'}
      accessibilityRole={dragHandleProps?.accessibilityRole ?? 'adjustable'}
      testID={testID ? `${testID}-drag-handle` : undefined}
      style={styles.dragHandle}
    >
      <AppIcon icon={DragDropVerticalIcon} size="standard" tone="default" />
    </View> : null}
    <Artwork
      fallbackColor={isPlaying ? colors.action.primary : colors.category.secondary}
      source={artworkSource}
      style={styles.trackArtwork}
      testID={testID ? `${testID}-artwork` : undefined}
    />
    <View style={styles.compactCopy}>
      <AppText variant="navigationLabel" numberOfLines={1}>{title}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={1}>{artist}{typeof voteCount === 'number' ? ` · ${voteCount} votes` : ''}</AppText>
      {status ? <AppText variant="caption" color="action.secondary" numberOfLines={1}>{status}</AppText> : null}
    </View>
    {mode === 'vote' ? <VoteButton
      compact={compactVote}
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
    {actions}
  </View>;
}
