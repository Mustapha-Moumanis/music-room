import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { DateTimePicker, LocationPicker, Select } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';

it('matches the default Select geometry and placeholder tokens from Figma', async () => {
  const view = await render(<Select label="Visibility" testID="visibility" />);
  const controlStyle = StyleSheet.flatten(view.getByTestId('visibility').props.style);
  const labelStyle = StyleSheet.flatten(view.getByTestId('visibility-label').props.style);
  const valueStyle = StyleSheet.flatten(view.getByTestId('visibility-value').props.style);

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
  expect(labelStyle).toEqual(expect.objectContaining({
    ...typography.bodySmall,
    color: colors.text.secondary,
  }));
  expect(valueStyle).toEqual(expect.objectContaining({
    ...typography.body,
    color: colors.text.muted,
  }));
  expect(view.getByText('Choose visibility')).toBeTruthy();
  expect(view.getByTestId('visibility-icon', { includeHiddenElements: true })).toBeTruthy();
  expect(view.getByTestId('visibility').props.accessibilityRole).toBe('combobox');
  expect(view.getByTestId('visibility').props.accessibilityState).toEqual({
    expanded: false,
    disabled: false,
  });
});

it('uses the teal focus treatment while Select is expanded', async () => {
  const view = await render(<Select expanded label="Visibility" testID="visibility" />);

  expect(StyleSheet.flatten(view.getByTestId('visibility').props.style)).toEqual(expect.objectContaining({
    borderWidth: 2,
    borderColor: colors.action.secondary,
  }));
  expect(StyleSheet.flatten(view.getByTestId('visibility-value').props.style).color).toBe(colors.text.primary);
  expect(view.getByTestId('visibility').props.accessibilityState.expanded).toBe(true);
});

it('renders a selected value and prevents presses while disabled', async () => {
  const onPress = jest.fn();
  const selected = await render(<Select label="Visibility" value="Friends only" testID="selected" />);
  const disabled = await render(<Select disabled label="Visibility" onPress={onPress} testID="disabled" />);

  expect(StyleSheet.flatten(selected.getByTestId('selected-value').props.style).color).toBe(colors.text.primary);
  await fireEvent.press(disabled.getByTestId('disabled'));
  expect(onPress).not.toHaveBeenCalled();
  expect(disabled.getByTestId('disabled').props.accessibilityState.disabled).toBe(true);
});

it('forwards picker presses to the owning screen', async () => {
  const onPress = jest.fn();
  const view = await render(<DateTimePicker onPress={onPress} testID="date" />);

  await fireEvent.press(view.getByTestId('date'));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(view.getByTestId('date').props.accessibilityRole).toBe('button');
});

it('matches Date and Time default, filled, and error variants', async () => {
  const initial = await render(<DateTimePicker testID="initial" />);
  const filled = await render(<DateTimePicker value="Oct 18 · 20:00" testID="filled" />);
  const invalid = await render(<DateTimePicker error testID="invalid" />);

  expect(StyleSheet.flatten(initial.getByTestId('initial-value').props.style).color).toBe(colors.text.muted);
  expect(StyleSheet.flatten(filled.getByTestId('filled-value').props.style).color).toBe(colors.text.primary);
  expect(invalid.getByText('Choose a valid date')).toBeTruthy();
  expect(StyleSheet.flatten(invalid.getByTestId('invalid').props.style)).toEqual(expect.objectContaining({
    borderWidth: 1,
    borderColor: colors.action.primary,
  }));
  expect(StyleSheet.flatten(invalid.getByTestId('invalid-label').props.style).color).toBe(colors.action.primary);
  expect(invalid.getByTestId('invalid').props['aria-invalid']).toBe(true);
});

it('matches Location default, selected, and permission-denied variants', async () => {
  const initial = await render(<LocationPicker testID="initial" />);
  const selected = await render(<LocationPicker value="Benguerir, Morocco" testID="selected" />);
  const denied = await render(<LocationPicker permissionDenied testID="denied" />);

  expect(StyleSheet.flatten(initial.getByTestId('initial-value').props.style).color).toBe(colors.text.muted);
  expect(StyleSheet.flatten(selected.getByTestId('selected-value').props.style).color).toBe(colors.text.primary);
  expect(denied.getByText('Location access required')).toBeTruthy();
  expect(StyleSheet.flatten(denied.getByTestId('denied-value').props.style).color).toBe(colors.text.primary);
  expect(StyleSheet.flatten(denied.getByTestId('denied').props.style).borderColor).toBe(colors.border.subtle);
  expect(denied.getByTestId('denied').props.accessibilityHint).toBe('Location access required');
});

it('keeps visual tokens internal while accepting picker layout constraints', async () => {
  const view = await render(<Select
    label="Visibility"
    testID="visibility"
    style={{
      maxWidth: 360,
      alignSelf: 'center',
      gap: 0,
      backgroundColor: '#FFFFFF',
    } as never}
  />);
  const containerStyle = StyleSheet.flatten(view.getByTestId('visibility-container').props.style);

  expect(containerStyle).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    gap: spacing[8],
  }));
});
