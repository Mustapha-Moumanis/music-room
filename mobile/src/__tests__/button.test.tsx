import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Button, type ButtonSize, type ButtonVariant } from '../components/ui';
import { colors, layout, radius, spacing, typography } from '../theme';

const variants: Record<ButtonVariant, {
  active: string;
  background: string;
  label: string;
  bordered: boolean;
}> = {
  primary: {
    active: colors.action.secondary,
    background: colors.action.primary,
    label: colors.text.onAccent,
    bordered: false,
  },
  secondary: {
    active: colors.category.secondary,
    background: colors.background.surface,
    label: colors.text.primary,
    bordered: true,
  },
  ghost: {
    active: colors.background.surface,
    background: colors.background.app,
    label: colors.text.primary,
    bordered: false,
  },
  danger: {
    active: colors.category.secondary,
    background: colors.category.secondary,
    label: colors.text.primary,
    bordered: false,
  },
};

const sizes: Record<ButtonSize, number> = {
  small: layout.minimumTouchTarget,
  default: spacing[48],
};

describe.each(Object.entries(variants) as Array<[ButtonVariant, (typeof variants)[ButtonVariant]]>)(
  '%s Button',
  (variant, expected) => {
    describe.each(Object.entries(sizes) as Array<[ButtonSize, number]>)('%s size', (size, height) => {
      it.each([
        ['default', false, false],
        ['active', true, false],
        ['disabled', false, true],
      ] as const)('matches the Figma %s state', (state, pressed, disabled) => {
        const view = render(<Button
          variant={variant}
          size={size}
          disabled={disabled}
          testOnly_pressed={pressed}
          testID="button"
        >
          Continue
        </Button>);

        const buttonStyle = StyleSheet.flatten(view.getByTestId('button').props.style);
        const labelStyle = StyleSheet.flatten(view.getByText('Continue').props.style);

        expect(buttonStyle).toEqual(expect.objectContaining({
          height,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[8],
          paddingHorizontal: spacing[16],
          paddingVertical: spacing[12],
          borderRadius: radius.medium,
          backgroundColor: state === 'active' ? expected.active : expected.background,
        }));
        expect(buttonStyle.borderWidth).toBe(expected.bordered ? 1 : undefined);
        expect(buttonStyle.borderColor).toBe(expected.bordered ? colors.border.subtle : undefined);
        expect(labelStyle).toEqual(expect.objectContaining({
          ...typography.buttonLabel,
          color: expected.label,
        }));
        expect(labelStyle.opacity).toBe(disabled ? 0.7 : undefined);
        expect(view.getByTestId('button').props.accessibilityState.disabled).toBe(disabled);
      });
    });
  },
);

it('defaults to the primary variant and default size', () => {
  const view = render(<Button testID="button">Continue</Button>);
  expect(StyleSheet.flatten(view.getByTestId('button').props.style)).toEqual(expect.objectContaining({
    height: spacing[48],
    backgroundColor: colors.action.primary,
  }));
  expect(StyleSheet.flatten(view.getByText('Continue').props.style).color).toBe(colors.text.onAccent);
});

it('owns button accessibility while preserving caller accessibility state', () => {
  const view = render(<Button
    testID="button"
    accessibilityLabel="Continue to the next step"
    accessibilityState={{ busy: true }}
  >
    Continue
  </Button>);
  expect(view.getByTestId('button').props).toEqual(expect.objectContaining({
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: 'Continue to the next step',
    accessibilityState: { busy: true, disabled: false },
  }));
});

it('forwards press and hover callbacks and applies active surfaces', () => {
  const onPress = jest.fn();
  const onHoverIn = jest.fn();
  const onHoverOut = jest.fn();
  const view = render(<Button
    testID="button"
    onPress={onPress}
    onHoverIn={onHoverIn}
    onHoverOut={onHoverOut}
  >
    Continue
  </Button>);

  const button = view.getByTestId('button');
  fireEvent.press(button);
  fireEvent(button, 'hoverIn');
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onHoverIn).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(view.getByTestId('button').props.style).backgroundColor).toBe(colors.action.secondary);

  fireEvent(button, 'hoverOut');
  expect(onHoverOut).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(view.getByTestId('button').props.style).backgroundColor).toBe(colors.action.primary);
});

it('uses the active surface during a native press', () => {
  const view = render(<Button testID="button">Continue</Button>);
  const button = view.getByTestId('button');

  fireEvent(button, 'pressIn');
  expect(StyleSheet.flatten(view.getByTestId('button').props.style)).toEqual(expect.objectContaining({
    backgroundColor: colors.action.secondary,
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  }));

  fireEvent(button, 'pressOut');
  expect(StyleSheet.flatten(view.getByTestId('button').props.style).backgroundColor).toBe(colors.action.primary);
  expect(StyleSheet.flatten(view.getByTestId('button').props.style).opacity).toBeUndefined();
});

it('never calls onPress or applies active styling while disabled', () => {
  const onPress = jest.fn();
  const view = render(<Button disabled onPress={onPress} testID="button">Continue</Button>);
  const button = view.getByTestId('button');

  fireEvent.press(button);
  fireEvent(button, 'hoverIn');
  expect(onPress).not.toHaveBeenCalled();
  expect(StyleSheet.flatten(view.getByTestId('button').props.style).backgroundColor).toBe(colors.action.primary);
});

it('composes permitted layout styles without allowing tokenized visual overrides', () => {
  const view = render(<Button
    testID="button"
    style={{
      width: '100%',
      maxWidth: 320,
      alignSelf: 'center',
      flexGrow: 1,
      height: 200,
      paddingHorizontal: 0,
      borderRadius: 0,
      backgroundColor: '#FFFFFF',
    } as never}
  >
    Continue
  </Button>);
  expect(StyleSheet.flatten(view.getByTestId('button').props.style)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    flexGrow: 1,
    height: spacing[48],
    paddingHorizontal: spacing[16],
    borderRadius: radius.medium,
    backgroundColor: colors.action.primary,
  }));
});
