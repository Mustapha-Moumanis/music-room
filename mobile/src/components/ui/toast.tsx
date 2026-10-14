import { View, type StyleProp, type ViewProps } from 'react-native';

import { colors, type SemanticColorRole } from '../../theme';
import { AppText } from './app-text';
import { overlayStyles as styles, type OverlayLayoutStyle, type ToastTone } from './overlay-shared';

export type ToastProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  message: string;
  style?: StyleProp<OverlayLayoutStyle>;
  tone?: ToastTone;
};

const toastBackgrounds: Record<ToastTone, string> = {
  success: colors.action.secondary,
  info: colors.background.surface,
  error: colors.category.secondary,
};

const toastColors: Record<ToastTone, SemanticColorRole> = {
  success: 'text.onAccent',
  info: 'text.primary',
  error: 'text.primary',
};

const toastSymbols: Record<ToastTone, string> = {
  success: '✓',
  info: 'i',
  error: '!',
};

export function Toast({
  message,
  style,
  testID,
  tone = 'success',
  ...viewProps
}: ToastProps) {
  const color = toastColors[tone];

  return <View
    {...viewProps}
    accessible
    accessibilityLabel={message}
    accessibilityLiveRegion="polite"
    accessibilityRole="alert"
    testID={testID}
    style={[style, styles.toast, { backgroundColor: toastBackgrounds[tone] }]}
  >
    <AppText
      variant="navigationLabel"
      color={color}
      testID={testID ? `${testID}-symbol` : undefined}
    >
      {toastSymbols[tone]}
    </AppText>
    <AppText
      variant="bodySmall"
      color={color}
      numberOfLines={1}
      style={styles.toastCopy}
    >
      {message}
    </AppText>
  </View>;
}
