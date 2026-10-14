import type { ImageProps } from 'expo-image';
import { Pressable, type PressableProps, type StyleProp } from 'react-native';

import { colors } from '../../theme';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';
import { Artwork, cardRowStyles as styles, type CardRowLayoutStyle, type PlaylistCardMode } from './card-row-shared';

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
