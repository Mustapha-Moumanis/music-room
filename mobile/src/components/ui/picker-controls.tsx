import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import type { ReactNode } from 'react';
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

export type PickerLayoutStyle = Pick<
  ViewStyle,
  'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

type NativePickerProps = Omit<
  PressableProps,
  'accessibilityRole' | 'children' | 'disabled' | 'role' | 'style'
>;

type PickerControlProps = NativePickerProps & {
  disabled?: boolean;
  displayText: string;
  error?: boolean;
  focused?: boolean;
  hasValue?: boolean;
  label: string;
  role?: 'button' | 'combobox';
  style?: StyleProp<PickerLayoutStyle>;
  trailing?: ReactNode;
};

export type SelectProps = NativePickerProps & {
  disabled?: boolean;
  expanded?: boolean;
  label: string;
  placeholder?: string;
  style?: StyleProp<PickerLayoutStyle>;
  value?: string;
};

export type DateTimePickerProps = NativePickerProps & {
  disabled?: boolean;
  error?: boolean | string;
  label?: string;
  placeholder?: string;
  style?: StyleProp<PickerLayoutStyle>;
  value?: string;
};

export type LocationPickerProps = NativePickerProps & {
  disabled?: boolean;
  label?: string;
  permissionDenied?: boolean | string;
  placeholder?: string;
  style?: StyleProp<PickerLayoutStyle>;
  value?: string;
};

function PickerControl({
  accessibilityHint,
  accessibilityLabel,
  accessibilityState,
  disabled = false,
  displayText,
  error = false,
  focused = false,
  hasValue = false,
  label,
  role = 'button',
  style,
  testID,
  trailing,
  ...pressableProps
}: PickerControlProps) {
  return <View testID={testID ? `${testID}-container` : undefined} style={[style, styles.container]}>
    <AppText
      testID={testID ? `${testID}-label` : undefined}
      variant="bodySmall"
      color={error ? 'action.primary' : 'text.secondary'}
    >
      {label}
    </AppText>
    <Pressable
      {...pressableProps}
      testID={testID}
      accessible
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={role}
      accessibilityState={{ ...accessibilityState, disabled }}
      aria-invalid={error || undefined}
      disabled={disabled}
      style={({ pressed }) => [
        styles.control,
        error ? styles.errorControl : focused || pressed ? styles.focusedControl : styles.defaultControl,
        !disabled && pressed && pressedFeedback,
      ]}
    >
      {({ pressed }) => <>
        <AppText
          testID={testID ? `${testID}-value` : undefined}
          numberOfLines={1}
          color={!disabled && (error || hasValue || focused || pressed) ? 'text.primary' : 'text.muted'}
          style={styles.value}
        >
          {displayText}
        </AppText>
        {trailing}
      </>}
    </Pressable>
  </View>;
}

export function Select({
  accessibilityState,
  disabled = false,
  expanded = false,
  label,
  placeholder = 'Choose visibility',
  testID,
  value,
  ...props
}: SelectProps) {
  return <PickerControl
    {...props}
    testID={testID}
    accessibilityState={{ ...accessibilityState, expanded }}
    disabled={disabled}
    displayText={value ?? placeholder}
    focused={expanded}
    hasValue={Boolean(value)}
    label={label}
    role="combobox"
    trailing={<AppIcon
      testID={testID ? `${testID}-icon` : undefined}
      icon={ArrowDown01Icon}
      size="compact"
      tone="muted"
    />}
  />;
}

export function DateTimePicker({
  accessibilityHint,
  disabled = false,
  error = false,
  label = 'Date & time',
  placeholder = 'Choose date and time',
  testID,
  value,
  ...props
}: DateTimePickerProps) {
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : error ? 'Choose a valid date' : undefined;

  return <PickerControl
    {...props}
    testID={testID}
    accessibilityHint={errorMessage ?? accessibilityHint}
    disabled={disabled}
    displayText={errorMessage ?? value ?? placeholder}
    error={hasError}
    hasValue={Boolean(value) || hasError}
    label={label}
  />;
}

export function LocationPicker({
  accessibilityHint,
  disabled = false,
  label = 'Location',
  permissionDenied = false,
  placeholder = 'Choose event location',
  testID,
  value,
  ...props
}: LocationPickerProps) {
  const denied = Boolean(permissionDenied);
  const deniedMessage = typeof permissionDenied === 'string'
    ? permissionDenied
    : 'Location access required';

  return <PickerControl
    {...props}
    testID={testID}
    accessibilityHint={denied ? deniedMessage : accessibilityHint}
    disabled={disabled}
    displayText={denied ? deniedMessage : value ?? placeholder}
    hasValue={Boolean(value) || denied}
    label={label}
  />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'stretch',
    gap: spacing[8],
  },
  control: {
    width: '100%',
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    overflow: 'hidden',
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius.medium,
    backgroundColor: colors.background.app,
  },
  defaultControl: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  focusedControl: {
    borderWidth: 2,
    borderColor: colors.action.secondary,
  },
  errorControl: {
    borderWidth: 1,
    borderColor: colors.action.primary,
  },
  value: {
    minWidth: 1,
    flex: 1,
  },
});
