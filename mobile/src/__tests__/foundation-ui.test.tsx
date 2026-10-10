/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen } from '@testing-library/react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon, AppScreen, AppText, type AppIconData } from '../components/ui';
import { colors, iconMetrics, layout, semanticColors, spacing, typography } from '../theme';

jest.mock('@hugeicons/react-native', () => {
  const { View: NativeView } = require('react-native');
  return { HugeiconsIcon: (props: object) => <NativeView testID="hugeicons-glyph" {...props} /> };
});

const icon = [] as unknown as AppIconData;

it('renders every AppText variant with its immutable token metrics', () => {
  for (const variant of Object.keys(typography) as Array<keyof typeof typography>) {
    const { unmount } = render(<AppText testID={`type-${variant}`} variant={variant} style={{ flex: 1 }}>{variant}</AppText>);
    expect(StyleSheet.flatten(screen.getByTestId(`type-${variant}`).props.style)).toEqual(expect.objectContaining({
      ...typography[variant],
      color: colors.text.primary,
      flex: 1,
    }));
    unmount();
  }
});

it('renders every semantic color and forwards standard text props', () => {
  for (const [role, value] of Object.entries(semanticColors)) {
    const { unmount } = render(<AppText testID={`color-${role}`} color={role as keyof typeof semanticColors} accessibilityRole="header">Color</AppText>);
    const specimen = screen.getByTestId(`color-${role}`);
    expect(StyleSheet.flatten(specimen.props.style).color).toBe(value);
    expect(specimen.props.accessibilityRole).toBe('header');
    unmount();
  }
});

it('defaults to body/primary and keeps tokenized metrics after caller styles', () => {
  render(<AppText testID="default-text" style={{ fontSize: 1, lineHeight: 1, flex: 1 } as never}>Default</AppText>);
  expect(StyleSheet.flatten(screen.getByTestId('default-text').props.style)).toEqual(expect.objectContaining({
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  }));
});

it('maps AppIcon sizes, strokes, tones, and accessibility without adding a touch target', () => {
  const { rerender } = render(<AppIcon testID="icon-wrapper" icon={icon} />);
  let wrapper = screen.getByTestId('icon-wrapper');
  let glyph = screen.getByTestId('hugeicons-glyph');
  expect(glyph.props).toEqual(expect.objectContaining({ size: iconMetrics.standard, strokeWidth: 1.5, color: colors.text.primary }));
  expect(wrapper.props.accessible).toBe(false);
  expect(StyleSheet.flatten(wrapper.props.style)).not.toEqual(expect.objectContaining({ minWidth: layout.minimumTouchTarget, minHeight: layout.minimumTouchTarget }));

  rerender(<AppIcon testID="icon-wrapper" icon={icon} size="compact" strokeWidth={2} tone="active" label="Play" />);
  wrapper = screen.getByTestId('icon-wrapper');
  glyph = screen.getByTestId('hugeicons-glyph');
  expect(glyph.props).toEqual(expect.objectContaining({ size: iconMetrics.compact, strokeWidth: 2, color: colors.action.primary }));
  expect(wrapper.props).toEqual(expect.objectContaining({ accessible: true, accessibilityLabel: 'Play', accessibilityRole: 'image' }));

  rerender(<AppIcon icon={icon} tone="secondary" label="Search" />);
  expect(screen.getByTestId('hugeicons-glyph').props.color).toBe(colors.action.secondary);
  rerender(<AppIcon icon={icon} tone="onAccent" label="Pause" />);
  expect(screen.getByTestId('hugeicons-glyph').props.color).toBe(colors.text.onAccent);
});

it('renders a centered, padded, non-scrolling AppScreen with composed styles', () => {
  render(<AppScreen testID="app-screen" contentContainerStyle={{ gap: 32 }}><Text>Content</Text></AppScreen>);
  expect(screen.UNSAFE_queryByType(ScrollView)).toBeNull();
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

it('allows full-width responsive content without changing the default constraint', () => {
  render(<AppScreen scrollable constrainContent={false} horizontalPadding={false}><View /></AppScreen>);
  const scroll = screen.UNSAFE_getByType(ScrollView);
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle)).toEqual(expect.objectContaining({
    width: '100%',
    alignSelf: 'center',
  }));
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle).maxWidth).toBeUndefined();
});

it('renders a scrolling AppScreen with handled keyboard taps and optional padding', () => {
  render(<AppScreen scrollable horizontalPadding={false}><View /></AppScreen>);
  const scroll = screen.UNSAFE_getByType(ScrollView);
  expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: layout.previewMaxWidth,
    alignSelf: 'center',
  }));
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingHorizontal).toBeUndefined();
});
