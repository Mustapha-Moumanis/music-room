import type { ComponentProps } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { semanticColors, typography, type SemanticColorRole, type TypographyVariant } from '../../theme';

type TokenizedFontKeys = 'color' | 'fontFamily' | 'fontSize' | 'fontStyle' | 'fontWeight' | 'letterSpacing' | 'lineHeight';

export type AppTextStyle = Omit<TextStyle, TokenizedFontKeys>;

export type AppTextProps = Omit<ComponentProps<typeof Text>, 'style'> & {
  variant?: TypographyVariant;
  color?: SemanticColorRole;
  style?: StyleProp<AppTextStyle>;
};

export function AppText({ variant = 'body', color = 'text.primary', style, ...props }: AppTextProps) {
  return <Text {...props} style={[style, typography[variant], { color: semanticColors[color] }]} />;
}
