import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing, type SemanticColorRole } from '../../theme';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'default';

export type ButtonLayoutStyle = Pick<
  ViewStyle,
  'width' | 'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type ButtonProps = Omit<PressableProps, 'accessibilityRole' | 'children' | 'style'> & {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ButtonLayoutStyle>;
};

const defaultBackgrounds: Record<ButtonVariant, string> = {
  primary: colors.action.primary,
  secondary: colors.background.surface,
  ghost: colors.background.app,
  danger: colors.category.secondary,
};

const activeBackgrounds: Record<ButtonVariant, string> = {
  primary: colors.action.secondary,
  secondary: colors.category.secondary,
  ghost: colors.background.surface,
  danger: colors.category.secondary,
};

const labelColors: Record<ButtonVariant, SemanticColorRole> = {
  primary: 'text.onAccent',
  secondary: 'text.primary',
  ghost: 'text.primary',
  danger: 'text.primary',
};

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  style,
  disabled = false,
  accessibilityState,
  onHoverIn,
  onHoverOut,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = Boolean(disabled);

  return <Pressable
    {...props}
    accessible
    accessibilityRole="button"
    accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
    disabled={isDisabled}
    onHoverIn={(event) => {
      setHovered(true);
      onHoverIn?.(event);
    }}
    onHoverOut={(event) => {
      setHovered(false);
      onHoverOut?.(event);
    }}
    style={({ pressed }) => [
      style,
      styles.base,
      size === 'small' ? styles.small : styles.default,
      variant === 'secondary' && styles.secondary,
      { backgroundColor: !isDisabled && (pressed || hovered) ? activeBackgrounds[variant] : defaultBackgrounds[variant] },
      !isDisabled && pressed && pressedFeedback,
    ]}
  >
    <AppText
      variant="buttonLabel"
      color={labelColors[variant]}
      style={isDisabled ? styles.disabledLabel : undefined}
    >
      {children}
    </AppText>
  </Pressable>;
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius.medium,
  },
  small: {
    height: layout.minimumTouchTarget,
  },
  default: {
    height: spacing[48],
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  disabledLabel: {
    opacity: 0.7,
  },
});
