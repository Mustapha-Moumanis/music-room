import { HeartIcon, PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
import type { ImageProps } from 'expo-image';
import { Pressable, View, type PressableProps, type StyleProp } from 'react-native';

import { layout } from '../../theme';
import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';
import { PlayerArtwork, navigationPlaybackStyles as styles, percentage, type ChromeLayoutStyle, type MiniPlayerState } from './navigation-playback-shared';

export type MiniPlayerProps = {
  artist: string;
  artworkSource?: ImageProps['source'];
  onFavoritePress?: PressableProps['onPress'];
  onOpenPress?: PressableProps['onPress'];
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
  onOpenPress,
  onPlayPausePress,
  progress,
  state = 'playing',
  style,
  testID,
  title,
}: MiniPlayerProps) {
  const isPlaying = state === 'playing';
  const resolvedProgress = progress ?? 0.408;

  return <View testID={testID} style={[style, styles.miniPlayer]}>
    <View style={styles.miniPlayerCard}>
      <View style={styles.miniPlayerContent}>
        <View style={styles.miniPlayerRow}>
          <Pressable
            accessibilityLabel={`Open Now Playing for ${title}`}
            accessibilityRole="button"
            onPress={onOpenPress}
            testID={testID ? `${testID}-open` : undefined}
            style={({ pressed }) => [styles.miniTrackArea, pressed && pressedFeedback]}
          >
            <PlayerArtwork
              size={layout.minimumTouchTarget}
              source={artworkSource}
              testID={testID ? `${testID}-artwork` : undefined}
            />
            <View style={styles.miniTrackCopy}>
              <AppText variant="bodySmall" numberOfLines={1}>{title}</AppText>
              <AppText variant="caption" color="text.primary" numberOfLines={1}>{artist}</AppText>
            </View>
          </Pressable>
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
