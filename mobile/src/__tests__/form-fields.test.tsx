import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { PasswordField, SearchField, TextField } from '../components/ui';
import { colors, layout, radius, spacing, typography } from '../theme';

it('matches the default Text Field geometry and tokens from Figma', () => {
  const view = render(<TextField label="Email" placeholder="Enter your email" testID="email" />);
  const controlStyle = StyleSheet.flatten(view.getByTestId('email-control').props.style);
  const inputStyle = StyleSheet.flatten(view.getByTestId('email').props.style);
  const labelStyle = StyleSheet.flatten(view.getByTestId('email-label').props.style);

  expect(controlStyle).toEqual(expect.objectContaining({
    width: '100%',
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.app,
  }));
  expect(inputStyle).toEqual(expect.objectContaining({
    ...typography.body,
    flex: 1,
    padding: 0,
    outlineWidth: 0,
    color: colors.text.primary,
  }));
  expect(labelStyle).toEqual(expect.objectContaining({
    ...typography.bodySmall,
    color: colors.text.secondary,
  }));
  expect(view.getByTestId('email').props.placeholderTextColor).toBe(colors.text.muted);
});

it('uses the teal two-pixel focus state and forwards focus events', () => {
  const onFocus = jest.fn();
  const onBlur = jest.fn();
  const view = render(<TextField
    label="Email"
    placeholder="Enter your email"
    onFocus={onFocus}
    onBlur={onBlur}
    testID="email"
  />);
  const input = view.getByTestId('email');

  fireEvent(input, 'focus', { nativeEvent: {} });
  expect(StyleSheet.flatten(view.getByTestId('email-control').props.style)).toEqual(expect.objectContaining({
    borderWidth: 2,
    borderColor: colors.action.secondary,
  }));
  expect(onFocus).toHaveBeenCalledTimes(1);

  fireEvent(input, 'blur', { nativeEvent: {} });
  expect(StyleSheet.flatten(view.getByTestId('email-control').props.style)).toEqual(expect.objectContaining({
    borderWidth: 1,
    borderColor: colors.border.subtle,
  }));
  expect(onBlur).toHaveBeenCalledTimes(1);
});

it('keeps the error state coral and exposes its message to assistive technology', () => {
  const view = render(<TextField
    label="Email"
    error="Enter a valid email address"
    testOnly_focused
    testID="email"
  />);

  expect(StyleSheet.flatten(view.getByTestId('email-control').props.style)).toEqual(expect.objectContaining({
    borderWidth: 1,
    borderColor: colors.action.primary,
  }));
  expect(StyleSheet.flatten(view.getByTestId('email-label').props.style).color).toBe(colors.action.primary);
  expect(view.getByTestId('email').props.accessibilityHint).toBe('Enter a valid email address');
});

it('maps disabled state to native editability and accessibility', () => {
  const view = render(<TextField disabled label="Email" value="souad@musicroom.app" testID="email" />);
  const input = view.getByTestId('email');

  expect(input.props.editable).toBe(false);
  expect(input.props.accessibilityState).toEqual({ disabled: true });
  expect(StyleSheet.flatten(input.props.style).color).toBe(colors.text.muted);
});

it('securely renders Password Field and toggles visibility with an accessible target', () => {
  const view = render(<PasswordField value="password" testID="password" />);
  const input = view.getByTestId('password');
  const toggle = view.getByTestId('password-visibility-toggle');

  expect(input.props.secureTextEntry).toBe(true);
  expect(toggle.props.accessibilityRole).toBe('button');
  expect(toggle.props.accessibilityLabel).toBe('Show password');
  expect(StyleSheet.flatten(toggle.props.style)).toEqual(expect.objectContaining({
    width: layout.minimumTouchTarget,
    height: layout.minimumTouchTarget,
  }));

  fireEvent.press(toggle);
  expect(view.getByTestId('password').props.secureTextEntry).toBe(false);
  expect(view.getByTestId('password-visibility-toggle').props.accessibilityLabel).toBe('Hide password');
});

it('uses the full-radius Figma Search Field with search keyboard behavior', () => {
  const view = render(<SearchField testOnly_focused testID="search" />);

  expect(StyleSheet.flatten(view.getByTestId('search-control').props.style)).toEqual(expect.objectContaining({
    height: spacing[48],
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.action.secondary,
  }));
  expect(view.getByTestId('search').props).toEqual(expect.objectContaining({
    placeholder: 'Search songs, artists, albums...',
    returnKeyType: 'search',
  }));
});

it('keeps tokenized visuals internal while accepting field layout constraints', () => {
  const view = render(<TextField
    label="Email"
    testID="email"
    style={{
      maxWidth: 360,
      alignSelf: 'center',
      gap: 0,
      backgroundColor: '#FFFFFF',
    } as never}
  />);
  const containerStyle = StyleSheet.flatten(view.getByTestId('email-container').props.style);

  expect(containerStyle).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    gap: spacing[8],
  }));
});
