import type { ImageProps } from 'expo-image';
import { Pressable, View, type PressableProps, type StyleProp, type ViewProps } from 'react-native';

import { colors } from '../../theme';
import { AppText } from './app-text';
import { Avatar } from './identity-status';
import { pressedFeedback } from './interaction-feedback';
import { Pill, cardRowStyles as styles, type CardRowLayoutStyle, type FriendRequestState } from './card-row-shared';

export type FriendRequestRowProps = Omit<ViewProps, 'children' | 'style'> & {
  avatarSource?: ImageProps['source'];
  initials: string;
  name: string;
  onAccept?: PressableProps['onPress'];
  onDecline?: PressableProps['onPress'];
  state?: FriendRequestState;
  style?: StyleProp<CardRowLayoutStyle>;
  summary?: string;
};

export function FriendRequestRow({
  avatarSource,
  initials,
  name,
  onAccept,
  onDecline,
  state = 'pending',
  style,
  summary: summaryOverride,
  testID,
  ...viewProps
}: FriendRequestRowProps) {
  const isAccepted = state === 'accepted';
  const summary = summaryOverride ?? (isAccepted ? 'Friend request accepted' : 'Sent you a request');

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
