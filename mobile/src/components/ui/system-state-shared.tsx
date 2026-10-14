import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, layout, radius, spacing, type SemanticColorRole } from '../../theme';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';

export type SystemStateLayoutStyle = Pick<
  ViewStyle,
  'width' | 'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type EmptyStateType = 'default' | 'noResults';
export type SkeletonLoaderType = 'card' | 'row';

export type StateActionProps = {
  backgroundColor: string;
  color: SemanticColorRole;
  label: string;
  onPress?: PressableProps['onPress'];
  testID?: string;
};

export function StateAction({ backgroundColor, color, label, onPress, testID }: StateActionProps) {
  return <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    onPress={onPress}
    testID={testID}
    style={({ pressed }) => [systemStateStyles.actionHitTarget, pressed && pressedFeedback]}
  >
    <View
      pointerEvents="none"
      testID={testID ? `${testID}-pill` : undefined}
      style={[systemStateStyles.actionPill, { backgroundColor }]}
    >
      <AppText variant="caption" color={color}>{label}</AppText>
    </View>
  </Pressable>;
}

export type ProductStateProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  actionLabel: string;
  description: string;
  onAction?: PressableProps['onPress'];
  style?: StyleProp<SystemStateLayoutStyle>;
  title: string;
};

export const systemStateStyles = StyleSheet.create({
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
