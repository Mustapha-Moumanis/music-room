import { Search01Icon, ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { forwardRef, type ReactNode, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextInputFocusEventData,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing, typography } from '../../theme';
import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';

export type FieldLayoutStyle = Pick<
  ViewStyle,
  'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

type NativeFieldProps = Omit<
  TextInputProps,
  | 'cursorColor'
  | 'editable'
  | 'placeholderTextColor'
  | 'secureTextEntry'
  | 'selectionColor'
  | 'style'
  | 'underlineColorAndroid'
>;

type CommonFieldProps = NativeFieldProps & {
  disabled?: boolean;
  error?: boolean | string;
  label?: string;
  style?: StyleProp<FieldLayoutStyle>;
  /** Displays the Figma focus specimen without taking native focus. Development previews only. */
  testOnly_focused?: boolean;
};

export type TextFieldProps = CommonFieldProps & {
  label: string;
};

export type PasswordFieldProps = Omit<CommonFieldProps, 'secureTextEntry'> & {
  label?: string;
};

export type SearchFieldProps = Omit<CommonFieldProps, 'error' | 'label'>;

type FieldControlProps = CommonFieldProps & {
  leading?: ReactNode;
  rounded?: boolean;
  secure?: boolean;
  trailing?: ReactNode;
};

const fieldHitSlop = {
  top: spacing[12],
  right: spacing[12],
  bottom: spacing[12],
  left: spacing[12],
};

const FieldControl = forwardRef<TextInput, FieldControlProps>(function FieldControl({
  accessibilityHint,
  accessibilityLabel,
  accessibilityState,
  disabled = false,
  error = false,
  label,
  leading,
  onBlur,
  onFocus,
  placeholder,
  rounded = false,
  secure = false,
  style,
  testID,
  testOnly_focused = false,
  trailing,
  ...inputProps
}, ref) {
  const [focused, setFocused] = useState(false);
  const isFocused = focused || testOnly_focused;
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : undefined;

  const handleFocus = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(false);
    onBlur?.(event);
  };

  return <View testID={testID ? `${testID}-container` : undefined} style={[style, styles.container]}>
    {label ? <AppText
      testID={testID ? `${testID}-label` : undefined}
      variant="bodySmall"
      color={hasError ? 'action.primary' : 'text.secondary'}
    >
      {label}
    </AppText> : null}
    <View
      testID={testID ? `${testID}-control` : undefined}
      style={[
        styles.control,
        rounded && styles.roundedControl,
        hasError ? styles.errorControl : isFocused ? styles.focusedControl : styles.defaultControl,
      ]}
    >
      {leading}
      <TextInput
        {...inputProps}
        ref={ref}
        testID={testID}
        accessibilityHint={errorMessage ?? accessibilityHint}
        accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
        accessibilityState={{ ...accessibilityState, disabled }}
        aria-invalid={hasError || undefined}
        cursorColor={colors.action.secondary}
        editable={!disabled}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        secureTextEntry={secure}
        selectionColor={colors.action.secondary}
        style={[styles.input, disabled && styles.disabledInput]}
        underlineColorAndroid="transparent"
      />
      {trailing}
    </View>
  </View>;
});

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(props, ref) {
  return <FieldControl {...props} ref={ref} />;
});

export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(function PasswordField({
  disabled = false,
  label = 'Password',
  testID,
  ...props
}, ref) {
  const [visible, setVisible] = useState(false);

  return <FieldControl
    {...props}
    ref={ref}
    disabled={disabled}
    testID={testID}
    label={label}
    secure={!visible}
    trailing={<Pressable
      testID={testID ? `${testID}-visibility-toggle` : undefined}
      accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={fieldHitSlop}
      onPress={() => setVisible((current) => !current)}
      style={({ pressed }) => [styles.iconButton, !disabled && pressed && pressedFeedback]}
    >
      <AppIcon icon={visible ? ViewOffSlashIcon : ViewIcon} size="compact" tone="muted" />
    </Pressable>}
  />;
});

export const SearchField = forwardRef<TextInput, SearchFieldProps>(function SearchField({
  placeholder = 'Search songs, artists, albums...',
  returnKeyType = 'search',
  ...props
}, ref) {
  return <FieldControl
    {...props}
    ref={ref}
    placeholder={placeholder}
    returnKeyType={returnKeyType}
    rounded
    leading={<AppIcon icon={Search01Icon} size="compact" tone="muted" />}
  />;
});

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
  roundedControl: {
    borderRadius: radius.full,
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
  input: {
    ...typography.body,
    minWidth: 1,
    flex: 1,
    padding: 0,
    outlineWidth: 0,
    color: colors.text.primary,
  },
  disabledInput: {
    color: colors.text.muted,
  },
  iconButton: {
    width: layout.minimumTouchTarget,
    height: layout.minimumTouchTarget,
    marginLeft: -spacing[8],
    marginRight: -spacing[16],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
