export const radius = {
  small: 8,
  medium: 12,
  card: 16,
  media: 20,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radius;
