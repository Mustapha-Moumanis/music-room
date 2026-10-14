import { View, type StyleProp, type ViewProps } from 'react-native';

import { systemStateStyles as styles, type SkeletonLoaderType, type SystemStateLayoutStyle } from './system-state-shared';

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
