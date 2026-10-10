import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Sora_400Regular',
  semiBold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
  extraBold: 'Sora_800ExtraBold',
} as const;

export const typography = {
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
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
