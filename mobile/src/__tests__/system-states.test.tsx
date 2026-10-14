import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { EmptyState, ErrorState, SkeletonLoader } from '../components/ui';
import { colors, layout, radius, spacing, typography } from '../theme';

it.each([
  ['default', 'Nothing here yet', 'Explore'],
  ['noResults', 'No matches yet', 'Clear search'],
] as const)('matches the %s Empty State variant', async (type, title, actionLabel) => {
  const view = await render(<EmptyState
    actionLabel={actionLabel}
    description="Description"
    title={title}
    type={type}
    testID="empty-state"
  />);

  expect(StyleSheet.flatten(view.getByTestId('empty-state').props.style)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 358,
    height: 260,
    gap: spacing[12],
    padding: spacing[24],
  }));
  expect(StyleSheet.flatten(view.getByTestId('empty-state-illustration', { includeHiddenElements: true }).props.style)).toEqual(expect.objectContaining({
    width: spacing[64],
    height: spacing[64],
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  }));
  expect(StyleSheet.flatten(view.getByText('♪', { includeHiddenElements: true }).props.style)).toEqual(expect.objectContaining({
    ...typography.h4,
    color: colors.action.secondary,
  }));
  expect(StyleSheet.flatten(view.getByTestId('empty-state-action').props.style).height)
    .toBe(layout.minimumTouchTarget);
  expect(StyleSheet.flatten(view.getByTestId('empty-state-action-pill').props.style)).toEqual(expect.objectContaining({
    minHeight: spacing[32],
    borderRadius: radius.full,
    backgroundColor: colors.action.secondary,
  }));
});

it('forwards Error State retry actions and exposes the action as a button', async () => {
  const onAction = jest.fn();
  const view = await render(<ErrorState
    actionLabel="Retry"
    description="Try again or check your connection."
    onAction={onAction}
    title="Something went wrong"
    testID="error-state"
  />);

  expect(StyleSheet.flatten(view.getByTestId('error-state-illustration', { includeHiddenElements: true }).props.style).backgroundColor)
    .toBe(colors.category.secondary);
  expect(StyleSheet.flatten(view.getByTestId('error-state-action-pill').props.style).backgroundColor)
    .toBe(colors.action.primary);
  expect(view.getByTestId('error-state-action').props.accessibilityRole).toBe('button');
  await fireEvent.press(view.getByTestId('error-state-action'));
  expect(onAction).toHaveBeenCalledTimes(1);
});

it.each([
  ['card', { width: 280, height: 300 }, { width: 256, height: 190 }],
  ['row', { width: '100%', maxWidth: 620, height: 72 }, { width: spacing[48], height: spacing[48] }],
] as const)('matches the %s Skeleton Loader variant', async (type, container, media) => {
  const view = await render(<SkeletonLoader type={type} testID="skeleton" />);

  expect(StyleSheet.flatten(view.getByTestId('skeleton').props.style)).toEqual(expect.objectContaining({
    ...container,
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  }));
  expect(StyleSheet.flatten(view.getByTestId('skeleton-media', { includeHiddenElements: true }).props.style)).toEqual(expect.objectContaining({
    ...media,
    borderRadius: radius.small,
    backgroundColor: colors.border.subtle,
  }));
  expect(view.getByTestId('skeleton').props).toEqual(expect.objectContaining({
    accessible: true,
    accessibilityLabel: 'Loading content',
    accessibilityRole: 'progressbar',
  }));
});
