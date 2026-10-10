import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing, type SemanticColorRole } from '../../theme';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';

export type VoteButtonState = 'available' | 'voted' | 'disabled' | 'restricted';

export type VoteButtonLayoutStyle = Pick<
  ViewStyle,
  'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type VoteButtonProps = Omit<
  PressableProps,
  'accessibilityRole' | 'children' | 'disabled' | 'style'
> & {
  state?: VoteButtonState;
  style?: StyleProp<VoteButtonLayoutStyle>;
};

const voteButtonWidth = 116;

const labels: Record<VoteButtonState, string> = {
  available: '+1 · Vote',
  voted: '+1 · Voted',
  disabled: 'Vote',
  restricted: 'Restricted',
};

const accessibilityLabels: Record<VoteButtonState, string> = {
  available: 'Vote for track',
  voted: 'Voted for track',
  disabled: 'Voting unavailable',
  restricted: 'Voting restricted',
};

const backgrounds: Record<VoteButtonState, string> = {
  available: colors.action.primary,
  voted: colors.action.secondary,
  disabled: colors.background.surface,
  restricted: colors.category.secondary,
};

const labelColors: Record<VoteButtonState, SemanticColorRole> = {
  available: 'text.onAccent',
  voted: 'text.onAccent',
  disabled: 'text.muted',
  restricted: 'text.primary',
};

export function VoteButton({
  accessibilityLabel,
  accessibilityState,
  state = 'available',
  style,
  ...pressableProps
}: VoteButtonProps) {
  const isUnavailable = state === 'disabled' || state === 'restricted';

  return <Pressable
    {...pressableProps}
    accessible
    accessibilityLabel={accessibilityLabel ?? accessibilityLabels[state]}
    accessibilityRole="button"
    accessibilityState={{
      ...accessibilityState,
      disabled: isUnavailable,
      selected: state === 'voted',
    }}
    disabled={isUnavailable}
    style={({ pressed }) => [
      style,
      styles.base,
      state === 'disabled' && styles.disabled,
      { backgroundColor: backgrounds[state] },
      !isUnavailable && pressed && pressedFeedback,
    ]}
  >
    <AppText variant="buttonLabel" color={labelColors[state]}>
      {labels[state]}
    </AppText>
  </Pressable>;
}

const styles = StyleSheet.create({
  base: {
    width: voteButtonWidth,
    height: layout.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius.medium,
  },
  disabled: {
    opacity: 0.45,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
});
