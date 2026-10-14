import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from 'react-native';

import { colors, radius, spacing } from '../../theme';

export type ScrollSurfaceProps = PropsWithChildren<{
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  continuationTestID?: string;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  showContinuationCue?: boolean;
  style?: ScrollViewProps['style'];
  testID?: ScrollViewProps['testID'];
}>;

export function ScrollSurface({
  children,
  contentContainerStyle,
  continuationTestID,
  keyboardShouldPersistTaps,
  showContinuationCue = true,
  style,
  testID,
}: ScrollSurfaceProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const remainingContent = contentHeight - viewportHeight - scrollOffset;
  const canScrollFurther = showContinuationCue
    && contentHeight > viewportHeight + spacing[8]
    && remainingContent > spacing[12];

  return <View style={styles.root}>
    <ScrollView
      testID={testID}
      style={[styles.scroll, style]}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      onContentSizeChange={(_, height) => setContentHeight(height)}
      onLayout={({ nativeEvent }) => setViewportHeight(nativeEvent.layout.height)}
      onScroll={({ nativeEvent }) => setScrollOffset(nativeEvent.contentOffset.y)}
      scrollEventThrottle={32}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
    {canScrollFurther ? <View
      accessibilityElementsHidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.continuation}
      testID={continuationTestID}
    >
      <View style={[styles.fadeBand, styles.fadeTop]} />
      <View style={[styles.fadeBand, styles.fadeMiddle]} />
      <View style={[styles.fadeBand, styles.fadeBottom]} />
      <View style={styles.continuationPill} />
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  root: {
    minHeight: 1,
    flex: 1,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  continuation: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: spacing[32],
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fadeBand: {
    position: 'absolute',
    right: 0,
    left: 0,
    height: 11,
    backgroundColor: colors.background.app,
  },
  fadeTop: {
    top: 0,
    opacity: 0.2,
  },
  fadeMiddle: {
    top: 10,
    opacity: 0.55,
  },
  fadeBottom: {
    bottom: 0,
    height: spacing[12],
    opacity: 0.9,
  },
  continuationPill: {
    width: spacing[24],
    height: 3,
    marginBottom: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.action.secondary,
  },
});
