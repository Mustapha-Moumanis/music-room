import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import {
  BottomSheet,
  Modal,
  Toast,
  type BottomSheetOption,
  type ModalType,
  type ToastTone,
} from '../components/ui';
import { colors, layout, radius, spacing, typography } from '../theme';

it.each([
  ['confirm', 250, false],
  ['form', 360, true],
] as const)('matches the %s Modal variant', (type, height, hasInput) => {
  const view = render(<Modal
    confirmLabel={type === 'form' ? 'Send invite' : 'Remove'}
    description={type === 'form'
      ? 'Search friends and invite them to this playlist.'
      : 'This change will update for every collaborator in real time.'}
    title={type === 'form' ? 'Invite friends' : 'Remove this track?'}
    type={type as ModalType}
    testID="modal"
  />);

  expect(StyleSheet.flatten(view.getByTestId('modal').props.style)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 480,
    height,
    gap: spacing[16],
    padding: spacing[24],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  }));
  expect(view.getByTestId('modal').props).toEqual(expect.objectContaining({
    accessible: false,
    accessibilityViewIsModal: true,
  }));
  expect(Boolean(view.queryByTestId('modal-input'))).toBe(hasInput);
  expect(StyleSheet.flatten(view.getByTestId('modal-cancel-pill').props.style)).toEqual(expect.objectContaining({
    height: spacing[32],
    borderRadius: radius.full,
    backgroundColor: colors.background.app,
  }));
  expect(StyleSheet.flatten(view.getByTestId('modal-confirm-pill').props.style).backgroundColor)
    .toBe(colors.action.primary);
});

it('forwards Modal actions and preserves 44px action targets', () => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  const view = render(<Modal
    confirmLabel="Remove"
    description="This change will update for every collaborator in real time."
    onCancel={onCancel}
    onConfirm={onConfirm}
    title="Remove this track?"
    testID="modal"
  />);

  expect(StyleSheet.flatten(view.getByTestId('modal-cancel').props.style).height)
    .toBe(layout.minimumTouchTarget);
  expect(StyleSheet.flatten(view.getByTestId('modal-confirm').props.style).height)
    .toBe(layout.minimumTouchTarget);
  fireEvent.press(view.getByTestId('modal-cancel'));
  fireEvent.press(view.getByTestId('modal-confirm'));
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

const actions: BottomSheetOption[] = [
  { id: 'add', label: 'Add to playlist' },
  { id: 'save', label: 'Save track' },
  { id: 'share', label: 'Share' },
  { id: 'remove', label: 'Remove' },
];

it.each([
  ['actions', 280, actions],
  ['picker', 360, actions.slice(0, 3)],
] as const)('matches the %s Bottom Sheet variant', (type, height, options) => {
  const view = render(<BottomSheet
    options={[...options]}
    title={type === 'picker' ? 'Choose visibility' : 'Track actions'}
    type={type}
    testID="sheet"
  />);

  expect(StyleSheet.flatten(view.getByTestId('sheet').props.style)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 390,
    height,
    gap: spacing[16],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
    paddingBottom: spacing[24],
    borderTopLeftRadius: radius.media,
    borderTopRightRadius: radius.media,
    backgroundColor: colors.background.surface,
  }));
  expect(StyleSheet.flatten(view.getByTestId('sheet-handle').props.style)).toEqual(expect.objectContaining({
    width: layout.minimumTouchTarget,
    height: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.text.muted,
  }));
  expect(view.getAllByRole('button')).toHaveLength(options.length);
});

it('forwards the selected Bottom Sheet option', () => {
  const onOptionPress = jest.fn();
  const view = render(<BottomSheet
    onOptionPress={onOptionPress}
    options={actions}
    title="Track actions"
    testID="sheet"
  />);

  fireEvent.press(view.getByTestId('sheet-option-share'));
  expect(onOptionPress).toHaveBeenCalledWith(actions[2]);
});

const toastStates: Record<ToastTone, {
  background: string;
  color: string;
  message: string;
  symbol: string;
}> = {
  success: {
    background: colors.action.secondary,
    color: colors.text.onAccent,
    message: 'Playlist updated',
    symbol: '✓',
  },
  info: {
    background: colors.background.surface,
    color: colors.text.primary,
    message: 'Nada is editing',
    symbol: 'i',
  },
  error: {
    background: colors.category.secondary,
    color: colors.text.primary,
    message: 'Connection failed',
    symbol: '!',
  },
};

it.each(Object.entries(toastStates) as Array<[ToastTone, (typeof toastStates)[ToastTone]]>)(
  'matches the %s Toast tone',
  (tone, expected) => {
    const view = render(<Toast message={expected.message} tone={tone} testID="toast" />);

    expect(StyleSheet.flatten(view.getByTestId('toast').props.style)).toEqual(expect.objectContaining({
      width: '100%',
      maxWidth: 360,
      height: 56,
      gap: spacing[12],
      paddingHorizontal: spacing[16],
      paddingVertical: spacing[12],
      borderRadius: radius.medium,
      backgroundColor: expected.background,
    }));
    expect(StyleSheet.flatten(view.getByTestId('toast-symbol').props.style)).toEqual(expect.objectContaining({
      ...typography.navigationLabel,
      color: expected.color,
    }));
    expect(view.getByText(expected.symbol)).toBeTruthy();
    expect(StyleSheet.flatten(view.getByText(expected.message).props.style)).toEqual(expect.objectContaining({
      ...typography.bodySmall,
      color: expected.color,
    }));
    expect(view.getByTestId('toast').props).toEqual(expect.objectContaining({
      accessibilityLabel: expected.message,
      accessibilityLiveRegion: 'polite',
      accessibilityRole: 'alert',
    }));
  },
);
