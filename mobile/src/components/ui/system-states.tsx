import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing, type SemanticColorRole } from '../../theme';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';

export type SystemStateLayoutStyle = Pick<
  ViewStyle,
  'width' | 'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type EmptyStateType = 'default' | 'noResults';
export type SkeletonLoaderType = 'card' | 'row';

type StateActionProps = {
  backgroundColor: string;
  color: SemanticColorRole;
  label: string;
  onPress?: PressableProps['onPress'];
  testID?: string;
};

function StateAction({ backgroundColor, color, label, onPress, testID }: StateActionProps) {
  return <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    onPress={onPress}
    testID={testID}
    style={({ pressed }) => [styles.actionHitTarget, pressed && pressedFeedback]}
  >
    <View
      pointerEvents="none"
      testID={testID ? `${testID}-pill` : undefined}
      style={[styles.actionPill, { backgroundColor }]}
    >
      <AppText variant="caption" color={color}>{label}</AppText>
    </View>
  </Pressable>;
}

type ProductStateProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  actionLabel: string;
  description: string;
  onAction?: PressableProps['onPress'];
  style?: StyleProp<SystemStateLayoutStyle>;
  title: string;
};

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

export type SkeletonLoaderProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  style?: StyleProp<SystemStateLayoutStyle>;
  type?: SkeletonLoaderType;
};

export function SkeletonLoader({ style, testID, type = 'card', ...viewProps }: SkeletonLoaderProps) {
  const isRow = type === 'row';

  return <View
    {...viewProps}
    accessible
    accessibilityLabel="Loading content"
    accessibilityRole="progressbar"
    testID={testID}
    style={[style, styles.skeleton, isRow ? styles.rowSkeleton : styles.cardSkeleton]}
  >
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID ? `${testID}-media` : undefined}
      style={[styles.skeletonBlock, isRow ? styles.rowMedia : styles.cardMedia]}
    />
    {isRow ? <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.rowLines}
    >
      <View testID={testID ? `${testID}-title` : undefined} style={[styles.skeletonBlock, styles.rowTitle]} />
      <View testID={testID ? `${testID}-subtitle` : undefined} style={[styles.skeletonBlock, styles.rowSubtitle]} />
    </View> : <>
      <View testID={testID ? `${testID}-title` : undefined} style={[styles.skeletonBlock, styles.cardTitle]} />
      <View testID={testID ? `${testID}-subtitle` : undefined} style={[styles.skeletonBlock, styles.cardSubtitle]} />
    </>}
  </View>;
}

const styles = StyleSheet.create({
  productState: {
    width: '100%',
    maxWidth: 358,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[12],
    padding: spacing[24],
  },
  emptyIllustration: {
    width: spacing[64],
    height: spacing[64],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  errorIllustration: {
    width: spacing[64],
    height: spacing[64],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.category.secondary,
  },
  description: {
    width: '100%',
    maxWidth: 310,
  },
  actionHitTarget: {
    minWidth: layout.minimumTouchTarget,
    height: layout.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPill: {
    minHeight: spacing[32],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.full,
  },
  skeleton: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.card,
    gap: spacing[12],
    padding: spacing[12],
  },
  cardSkeleton: {
    width: 280,
    height: 300,
    flexDirection: 'column',
    alignItems: 'center',
  },
  rowSkeleton: {
    width: '100%',
    maxWidth: 620,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonBlock: {
    flexShrink: 0,
    borderRadius: radius.small,
    backgroundColor: colors.border.subtle,
  },
  cardMedia: {
    width: 256,
    height: 190,
  },
  cardTitle: {
    width: 190,
    height: 16,
  },
  cardSubtitle: {
    width: 120,
    height: 12,
  },
  rowMedia: {
    width: spacing[48],
    height: spacing[48],
  },
  rowLines: {
    minWidth: 0,
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing[8],
    overflow: 'hidden',
  },
  rowTitle: {
    width: '100%',
    maxWidth: 220,
    height: 14,
  },
  rowSubtitle: {
    width: '100%',
    maxWidth: 150,
    height: 10,
  },
});
