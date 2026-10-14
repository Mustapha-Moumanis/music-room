import { View } from 'react-native';

import { colors } from '../../theme';
import { AppText } from './app-text';
import { StateAction, systemStateStyles as styles, type ProductStateProps } from './system-state-shared';

export type ErrorStateProps = ProductStateProps;

export function ErrorState({
  actionLabel,
  description,
  onAction,
  style,
  testID,
  title,
  ...viewProps
}: ErrorStateProps) {
  return <View
    {...viewProps}
    accessible={false}
    testID={testID}
    style={[style, styles.productState]}
  >
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID ? `${testID}-illustration` : undefined}
      style={styles.errorIllustration}
    >
      <AppText variant="h4">!</AppText>
    </View>
    <AppText accessibilityRole="header" variant="h5">{title}</AppText>
    <AppText variant="bodySmall" color="text.secondary" style={styles.description}>
      {description}
    </AppText>
    <StateAction
      backgroundColor={colors.action.primary}
      color="text.onAccent"
      label={actionLabel}
      onPress={onAction}
      testID={testID ? `${testID}-action` : undefined}
    />
  </View>;
}
