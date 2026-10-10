export const palette = {
  teal: '#00A6B2',
  coral: '#F04E23',
  deepBlack: '#1A1A1A',
  surface: '#242424',
  warmCream: '#F3EAD7',
  mutedPurple: '#6B4B4D',
  neutral500: '#8C8982',
  neutral300: '#B8B2A5',
  neutral200: '#D8D0C0',
} as const;

export const colors = {
  background: {
    app: palette.deepBlack,
    surface: palette.surface,
    selected: palette.warmCream,
  },
  text: {
    primary: palette.warmCream,
    secondary: palette.neutral300,
    muted: palette.neutral500,
    onAccent: palette.deepBlack,
  },
  action: {
    primary: palette.coral,
    secondary: palette.teal,
  },
  category: {
    secondary: palette.mutedPurple,
  },
  border: {
    subtle: palette.neutral500,
  },
  player: {
    progress: palette.coral,
    secondary: palette.teal,
  },
} as const;

export const semanticColors = {
  'background.app': colors.background.app,
  'background.surface': colors.background.surface,
  'background.selected': colors.background.selected,
  'text.primary': colors.text.primary,
  'text.secondary': colors.text.secondary,
  'text.muted': colors.text.muted,
  'text.onAccent': colors.text.onAccent,
  'action.primary': colors.action.primary,
  'action.secondary': colors.action.secondary,
  'category.secondary': colors.category.secondary,
  'border.subtle': colors.border.subtle,
  'player.progress': colors.player.progress,
  'player.secondary': colors.player.secondary,
} as const;

export type SemanticColorRole = keyof typeof semanticColors;
