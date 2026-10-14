import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '../../theme';
import { ScrollSurface } from './scroll-surface';

export type AppScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  horizontalPadding?: boolean;
  constrainContent?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
}>;

export function AppScreen({
  children,
  scrollable = false,
  horizontalPadding = true,
  constrainContent = true,
  contentContainerStyle,
  style,
  testID,
  keyboardShouldPersistTaps = 'handled',
}: AppScreenProps) {
  const contentStyle = [
    styles.content,
    constrainContent && styles.constrained,
    horizontalPadding && styles.padded,
    contentContainerStyle,
  ];

  return <SafeAreaView style={[styles.safeArea, style]} testID={testID}>
    {scrollable
      ? <ScrollSurface
          testID={testID ? `${testID}-scroll` : undefined}
          style={styles.scroll}
          contentContainerStyle={contentStyle}
          continuationTestID={testID ? `${testID}-scroll-cue` : undefined}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          {children}
        </ScrollSurface>
      : <View style={contentStyle}>{children}</View>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.app,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
  },
  constrained: {
    maxWidth: layout.previewMaxWidth,
  },
  padded: {
    paddingHorizontal: spacing[16],
  },
});
