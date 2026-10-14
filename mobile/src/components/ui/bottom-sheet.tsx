import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Pressable, View, type StyleProp, type ViewProps } from 'react-native';

import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';
import { overlayStyles as styles, type BottomSheetType, type OverlayLayoutStyle } from './overlay-shared';

export type BottomSheetOption = {
  id: string;
  label: string;
};

export type BottomSheetProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  onOptionPress?: (option: BottomSheetOption) => void;
  options: BottomSheetOption[];
  style?: StyleProp<OverlayLayoutStyle>;
  title: string;
  type?: BottomSheetType;
};

export function BottomSheet({
  onOptionPress,
  options,
  style,
  testID,
  title,
  type = 'actions',
  ...viewProps
}: BottomSheetProps) {
  return <View
    {...viewProps}
    accessible={false}
    accessibilityViewIsModal
    testID={testID}
    style={[
      style,
      styles.bottomSheet,
      type === 'picker' ? styles.pickerSheet : styles.actionsSheet,
    ]}
  >
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID ? `${testID}-handle` : undefined}
      style={styles.sheetHandle}
    />
    <AppText variant="h5">{title}</AppText>
    {options.map((option) => <Pressable
      key={option.id}
      accessibilityLabel={option.label}
      accessibilityRole="button"
      onPress={() => onOptionPress?.(option)}
      testID={testID ? `${testID}-option-${option.id}` : undefined}
      style={({ pressed }) => [styles.sheetOption, pressed && pressedFeedback]}
    >
      <AppText numberOfLines={1} style={styles.sheetOptionLabel}>{option.label}</AppText>
      <AppIcon icon={ArrowRight01Icon} size="compact" tone="muted" />
    </Pressable>)}
  </View>;
}
