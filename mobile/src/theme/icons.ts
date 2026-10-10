export const iconMetrics = {
  compact: 20,
  standard: 24,
  strokeThin: 1.5,
  strokeStrong: 2,
} as const;

export type IconSize = 'compact' | 'standard';
export type IconStrokeWidth = typeof iconMetrics.strokeThin | typeof iconMetrics.strokeStrong;
