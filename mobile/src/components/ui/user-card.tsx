import type { ImageProps } from 'expo-image';
import { Pressable, View, type PressableProps, type StyleProp, type ViewProps } from 'react-native';

import { colors } from '../../theme';
import { AppText } from './app-text';
import { Avatar } from './identity-status';
import { pressedFeedback } from './interaction-feedback';
import { Pill, cardRowStyles as styles, type CardRowLayoutStyle, type UserCardRelation } from './card-row-shared';

export type UserCardProps = Omit<ViewProps, 'children' | 'style'> & {
  actionLabel?: string;
  avatarSource?: ImageProps['source'];
  initials: string;
  meta: string;
  name: string;
  onActionPress?: PressableProps['onPress'];
  onPress?: PressableProps['onPress'];
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
  onPress,
  relation = 'stranger',
  style,
  testID,
  ...viewProps
}: UserCardProps) {
  const isFriend = relation === 'friend';
  const resolvedActionLabel = actionLabel ?? (isFriend ? 'Friend' : 'Add friend');

  return <View {...viewProps} testID={testID} style={[style, styles.userCard]}>
    <Pressable
      accessibilityLabel={onPress ? `Open ${name}'s profile` : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.userCardIdentity, pressed && pressedFeedback]}
      testID={testID ? `${testID}-profile` : undefined}
    >
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
    </Pressable>
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
