import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '../../theme';

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
      ? <ScrollView
          style={styles.scroll}
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          {children}
        </ScrollView>
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
