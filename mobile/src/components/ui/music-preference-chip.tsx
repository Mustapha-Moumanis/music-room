import { Pressable } from 'react-native';

import { spacing } from '../../theme';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';
import { identityStyles as styles, type MusicPreferenceChipProps } from './identity-shared';

export function MusicPreferenceChip({
  accessibilityLabel,
  accessibilityState,
  children,
  disabled = false,
  selected = false,
  style,
  ...pressableProps
}: MusicPreferenceChipProps) {
  return <Pressable
    {...pressableProps}
    accessible
    accessibilityLabel={accessibilityLabel ?? children}
    accessibilityRole="checkbox"
    accessibilityState={{ ...accessibilityState, checked: selected, disabled }}
    disabled={disabled}
    hitSlop={spacing[8]}
    style={({ pressed }) => [
      style,
      styles.chip,
      selected ? styles.selectedChip : styles.defaultChip,
      disabled && styles.disabledChip,
      !disabled && pressed && pressedFeedback,
    ]}
  >
    <AppText variant="caption" color={selected && !disabled ? 'text.onAccent' : 'text.primary'}>
      {children}
    </AppText>
  </Pressable>;
}
