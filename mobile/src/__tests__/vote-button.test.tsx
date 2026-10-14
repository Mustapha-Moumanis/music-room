import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { VoteButton, type VoteButtonState } from '../components/ui';
import { colors, layout, radius, spacing, typography } from '../theme';

const states: Record<VoteButtonState, {
  background: string;
  bordered: boolean;
  disabled: boolean;
  label: string;
  labelColor: string;
  opacity?: number;
  selected: boolean;
}> = {
  available: {
    background: colors.action.primary,
    bordered: false,
    disabled: false,
    label: '+1 · Vote',
    labelColor: colors.text.onAccent,
    selected: false,
  },
  voted: {
    background: colors.action.secondary,
    bordered: false,
    disabled: false,
    label: '+1 · Voted',
    labelColor: colors.text.onAccent,
    selected: true,
  },
  disabled: {
    background: colors.background.surface,
    bordered: true,
    disabled: true,
    label: 'Vote',
    labelColor: colors.text.muted,
    opacity: 0.45,
    selected: false,
  },
  restricted: {
    background: colors.category.secondary,
    bordered: false,
    disabled: true,
    label: 'Restricted',
    labelColor: colors.text.primary,
    selected: false,
  },
};

it.each(Object.entries(states) as [VoteButtonState, (typeof states)[VoteButtonState]][]) (
  'matches the Figma %s Vote Button state',
  async (state, expected) => {
    const view = await render(<VoteButton state={state} testID="vote" />);
    const buttonStyle = StyleSheet.flatten(view.getByTestId('vote').props.style);
    const labelStyle = StyleSheet.flatten(view.getByText(expected.label).props.style);

    expect(buttonStyle).toEqual(expect.objectContaining({
      width: 116,
      height: layout.minimumTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[8],
      paddingHorizontal: spacing[16],
      paddingVertical: spacing[12],
      borderRadius: radius.medium,
      backgroundColor: expected.background,
    }));
    expect(buttonStyle.borderWidth).toBe(expected.bordered ? 1 : undefined);
    expect(buttonStyle.borderColor).toBe(expected.bordered ? colors.border.subtle : undefined);
    expect(buttonStyle.opacity).toBe(expected.opacity);
    expect(labelStyle).toEqual(expect.objectContaining({
      ...typography.buttonLabel,
      color: expected.labelColor,
    }));
    expect(view.getByTestId('vote').props.accessibilityState).toEqual({
      disabled: expected.disabled,
      selected: expected.selected,
    });
  },
);

it('allows available and voted actions while blocking unavailable states', async () => {
  const onPress = jest.fn();
  const view = await render(<>
    <VoteButton onPress={onPress} testID="available" />
    <VoteButton onPress={onPress} state="voted" testID="voted" />
    <VoteButton onPress={onPress} state="disabled" testID="disabled" />
    <VoteButton onPress={onPress} state="restricted" testID="restricted" />
  </>);

  await fireEvent.press(view.getByTestId('available'));
  await fireEvent.press(view.getByTestId('voted'));
  await fireEvent.press(view.getByTestId('disabled'));
  await fireEvent.press(view.getByTestId('restricted'));

  expect(onPress).toHaveBeenCalledTimes(2);
});

it('provides state-specific accessible labels and permits caller overrides', async () => {
  const voted = await render(<VoteButton state="voted" testID="vote" />);
  const custom = await render(<VoteButton accessibilityLabel="Vote for Midnight Drive" testID="custom" />);

  expect(voted.getByTestId('vote').props).toEqual(expect.objectContaining({
    accessibilityRole: 'button',
    accessibilityLabel: 'Voted for track',
  }));
  expect(custom.getByTestId('custom').props.accessibilityLabel).toBe('Vote for Midnight Drive');
});

it('keeps Figma geometry internal while accepting layout constraints', async () => {
  const view = await render(<VoteButton
    testID="vote"
    style={{
      maxWidth: 200,
      alignSelf: 'center',
      width: 300,
      height: 80,
      borderRadius: 0,
      backgroundColor: '#FFFFFF',
    } as never}
  />);

  expect(StyleSheet.flatten(view.getByTestId('vote').props.style)).toEqual(expect.objectContaining({
    width: 116,
    height: layout.minimumTouchTarget,
    maxWidth: 200,
    alignSelf: 'center',
    borderRadius: radius.medium,
    backgroundColor: colors.action.primary,
  }));
});
