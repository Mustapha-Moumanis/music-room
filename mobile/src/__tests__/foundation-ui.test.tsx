/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, AppScreen, AppText, type AppIconData } from '../components/ui';
import { colors, iconMetrics, layout, semanticColors, spacing, typography } from '../theme';

jest.mock('@hugeicons/react-native', () => {
  const { View: NativeView } = require('react-native');
  return { HugeiconsIcon: (props: object) => <NativeView testID="hugeicons-glyph" {...props} /> };
});

const icon = [] as unknown as AppIconData;

it('renders every AppText variant with its immutable token metrics', async () => {
  for (const variant of Object.keys(typography) as (keyof typeof typography)[]) {
    const { unmount } = await render(<AppText testID={`type-${variant}`} variant={variant} style={{ flex: 1 }}>{variant}</AppText>);
    expect(StyleSheet.flatten(screen.getByTestId(`type-${variant}`).props.style)).toEqual(expect.objectContaining({
      ...typography[variant],
      color: colors.text.primary,
      flex: 1,
    }));
    await unmount();
  }
});

it('renders every semantic color and forwards standard text props', async () => {
  for (const [role, value] of Object.entries(semanticColors)) {
    const { unmount } = await render(<AppText testID={`color-${role}`} color={role as keyof typeof semanticColors} accessibilityRole="header">Color</AppText>);
    const specimen = screen.getByTestId(`color-${role}`);
    expect(StyleSheet.flatten(specimen.props.style).color).toBe(value);
    expect(specimen.props.accessibilityRole).toBe('header');
    await unmount();
  }
});

it('defaults to body/primary and keeps tokenized metrics after caller styles', async () => {
  await render(<AppText testID="default-text" style={{ fontSize: 1, lineHeight: 1, flex: 1 } as never}>Default</AppText>);
  expect(StyleSheet.flatten(screen.getByTestId('default-text').props.style)).toEqual(expect.objectContaining({
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  }));
});

it('maps AppIcon sizes, strokes, tones, and accessibility without adding a touch target', async () => {
  const { rerender } = await render(<AppIcon testID="icon-wrapper" icon={icon} />);
  let wrapper = screen.getByTestId('icon-wrapper', { includeHiddenElements: true });
  let glyph = screen.getByTestId('hugeicons-glyph', { includeHiddenElements: true });
  expect(glyph.props).toEqual(expect.objectContaining({ size: iconMetrics.standard, strokeWidth: 1.5, color: colors.text.primary }));
  expect(wrapper.props.accessible).toBe(false);
  expect(StyleSheet.flatten(wrapper.props.style)).not.toEqual(expect.objectContaining({ minWidth: layout.minimumTouchTarget, minHeight: layout.minimumTouchTarget }));

  await rerender(<AppIcon testID="icon-wrapper" icon={icon} size="compact" strokeWidth={2} tone="active" label="Play" />);
  wrapper = screen.getByTestId('icon-wrapper', { includeHiddenElements: true });
  glyph = screen.getByTestId('hugeicons-glyph', { includeHiddenElements: true });
  expect(glyph.props).toEqual(expect.objectContaining({ size: iconMetrics.compact, strokeWidth: 2, color: colors.action.primary }));
  expect(wrapper.props).toEqual(expect.objectContaining({ accessible: true, accessibilityLabel: 'Play', accessibilityRole: 'image' }));

  await rerender(<AppIcon icon={icon} tone="secondary" label="Search" />);
  expect(screen.getByTestId('hugeicons-glyph', { includeHiddenElements: true }).props.color).toBe(colors.action.secondary);
  await rerender(<AppIcon icon={icon} tone="onAccent" label="Pause" />);
  expect(screen.getByTestId('hugeicons-glyph', { includeHiddenElements: true }).props.color).toBe(colors.text.onAccent);
});

it('renders a centered, padded, non-scrolling AppScreen with composed styles', async () => {
  await render(<AppScreen testID="app-screen" contentContainerStyle={{ gap: 32 }}><Text>Content</Text></AppScreen>);
  expect(screen.queryByTestId('app-screen-scroll')).toBeNull();
  expect(StyleSheet.flatten(screen.getByTestId('app-screen').props.style).backgroundColor).toBe(colors.background.app);
  const content = screen.getByText('Content').parent!;
  expect(StyleSheet.flatten(content.props.style)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: layout.previewMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing[16],
    gap: 32,
  }));
});

it('allows full-width responsive content without changing the default constraint', async () => {
  await render(<AppScreen scrollable constrainContent={false} horizontalPadding={false} testID="app-screen"><View /></AppScreen>);
  const scroll = screen.getByTestId('app-screen-scroll');
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle)).toEqual(expect.objectContaining({
    width: '100%',
    alignSelf: 'center',
  }));
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle).maxWidth).toBeUndefined();
});

it('renders a scrolling AppScreen with handled keyboard taps and optional padding', async () => {
  await render(<AppScreen scrollable horizontalPadding={false} testID="app-screen"><View /></AppScreen>);
  const scroll = screen.getByTestId('app-screen-scroll');
  expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: layout.previewMaxWidth,
    alignSelf: 'center',
  }));
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingHorizontal).toBeUndefined();
});
