import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';

export type SettingsRowType = 'navigation' | 'status' | 'toggle';

export type SettingsRowProps = Omit<
  PressableProps,
  'accessibilityRole' | 'accessibilityState' | 'children' | 'style'
> & {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  status?: string;
  style?: StyleProp<ViewStyle>;
  subtitle: string;
  title: string;
  type?: SettingsRowType;
};

export function SettingsRow({
  enabled = false,
  onPress,
  onToggle,
  status,
  style,
  subtitle,
  title,
  type = 'navigation',
  ...pressableProps
}: SettingsRowProps) {
  const isToggle = type === 'toggle';
  const handlePress = isToggle ? () => onToggle?.(!enabled) : onPress;

  return <Pressable
    {...pressableProps}
    accessibilityLabel={title}
    accessibilityRole={isToggle ? 'switch' : type === 'navigation' ? 'button' : 'text'}
    accessibilityState={isToggle ? { checked: enabled } : undefined}
    disabled={type === 'status'}
    onPress={handlePress}
    style={({ pressed }) => [style, styles.row, pressed && type !== 'status' && pressedFeedback]}
  >
    <View style={styles.copy}>
      <AppText variant="navigationLabel" numberOfLines={1}>{title}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={1}>{subtitle}</AppText>
    </View>
    {type === 'navigation' ? <AppIcon icon={ArrowRight01Icon} size="compact" tone="muted" /> : null}
    {type === 'status' ? <AppText variant="caption" color="action.secondary">{status}</AppText> : null}
    {isToggle ? <View style={[styles.toggleTrack, enabled ? styles.toggleOn : styles.toggleOff]}>
      <View style={[styles.toggleKnob, enabled ? styles.knobOn : styles.knobOff]} />
    </View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  copy: {
    minWidth: 1,
    flex: 1,
    gap: spacing[4],
    overflow: 'hidden',
  },
  toggleTrack: {
    width: 44,
    height: 26,
    flexShrink: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: radius.full,
  },
  toggleOn: {
    backgroundColor: colors.action.secondary,
  },
  toggleOff: {
    backgroundColor: colors.text.muted,
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.text.primary,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  knobOff: {
    alignSelf: 'flex-start',
  },
});
