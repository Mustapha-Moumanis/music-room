import type { ImageProps } from 'expo-image';
import { Pressable, View, type PressableProps, type StyleProp } from 'react-native';

import { colors } from '../../theme';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';
import { Artwork, Pill, cardRowStyles as styles, type CardRowLayoutStyle, type EventCardState } from './card-row-shared';

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
