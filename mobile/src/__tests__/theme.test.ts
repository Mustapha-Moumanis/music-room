import { colors, fontFamily, grid, iconMetrics, layout, palette, radius, semanticColors, shadows, spacing, typography } from '../theme';

it('matches the Figma primitive and semantic color values', () => {
  expect(palette).toEqual({
    teal: '#00A6B2',
    coral: '#F04E23',
    deepBlack: '#1A1A1A',
    surface: '#242424',
    warmCream: '#F3EAD7',
    mutedPurple: '#6B4B4D',
    neutral500: '#8C8982',
    neutral300: '#B8B2A5',
    neutral200: '#D8D0C0',
  });
  expect(colors).toEqual({
    background: { app: '#1A1A1A', surface: '#242424', selected: '#F3EAD7' },
    text: { primary: '#F3EAD7', secondary: '#B8B2A5', muted: '#8C8982', onAccent: '#1A1A1A' },
    action: { primary: '#F04E23', secondary: '#00A6B2' },
    category: { secondary: '#6B4B4D' },
    border: { subtle: '#8C8982' },
    player: { progress: '#F04E23', secondary: '#00A6B2' },
  });
  expect(semanticColors['text.primary']).toBe(colors.text.primary);
  expect(semanticColors['action.secondary']).toBe(colors.action.secondary);
});

it('matches the Figma spacing, radius, grid, layout, and icon metrics', () => {
  expect(Object.values(spacing)).toEqual([4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 120]);
  expect(radius).toEqual({ small: 8, medium: 12, card: 16, media: 20, full: 999 });
  expect(grid).toEqual({ referenceWidth: 390, columns: 4, margin: 16, gutter: 12 });
  expect(layout).toEqual({ minimumTouchTarget: 44, bottomNavigationHeight: 72, miniPlayerHeight: 68, previewMaxWidth: 520 });
  expect(iconMetrics).toEqual({ compact: 20, standard: 24, strokeThin: 1.5, strokeStrong: 2 });
});

it('matches all twelve Figma typography tokens', () => {
  expect(fontFamily).toEqual({
    regular: 'Sora_400Regular',
    semiBold: 'Sora_600SemiBold',
    bold: 'Sora_700Bold',
    extraBold: 'Sora_800ExtraBold',
  });
  expect(typography).toEqual({
    display: { fontFamily: fontFamily.extraBold, fontSize: 64, lineHeight: 67.2, letterSpacing: -2.56 },
    h1: { fontFamily: fontFamily.bold, fontSize: 48, lineHeight: 52.8, letterSpacing: -1.68 },
    h2: { fontFamily: fontFamily.bold, fontSize: 36, lineHeight: 41.4, letterSpacing: -0.9 },
    h3: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 33.6, letterSpacing: 0 },
    h4: { fontFamily: fontFamily.semiBold, fontSize: 22, lineHeight: 27.5, letterSpacing: 0 },
    h5: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 23.4, letterSpacing: 0 },
    bodyLarge: { fontFamily: fontFamily.regular, fontSize: 18, lineHeight: 27.9, letterSpacing: 0 },
    body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
    bodySmall: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20.3, letterSpacing: 0 },
    navigationLabel: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
    buttonLabel: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
    caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16.8, letterSpacing: 0.24 },
  });
});

it('uses the exact Figma box shadows', () => {
  expect(shadows.subtle.boxShadow).toBe('0 8px 24px 0 #0000002E');
  expect(shadows.floating.boxShadow).toBe('0 12px 32px -4px #00000047');
});
