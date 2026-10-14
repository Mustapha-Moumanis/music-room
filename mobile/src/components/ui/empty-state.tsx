import { View } from 'react-native';

import { colors } from '../../theme';
import { AppText } from './app-text';
import { StateAction, systemStateStyles as styles, type EmptyStateType, type ProductStateProps } from './system-state-shared';

export type EmptyStateProps = ProductStateProps & {
  type?: EmptyStateType;
};

export function EmptyState({
  actionLabel,
  description,
  onAction,
  style,
  testID,
  title,
  type: _type = 'default',
  ...viewProps
}: EmptyStateProps) {
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
      style={styles.emptyIllustration}
    >
      <AppText variant="h4" color="action.secondary">♪</AppText>
    </View>
    <AppText accessibilityRole="header" variant="h5">{title}</AppText>
    <AppText variant="bodySmall" color="text.secondary" style={styles.description}>
      {description}
    </AppText>
    <StateAction
      backgroundColor={colors.action.secondary}
      color="text.onAccent"
      label={actionLabel}
      onPress={onAction}
      testID={testID ? `${testID}-action` : undefined}
    />
  </View>;
}
