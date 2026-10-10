import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppFontGate } from '../src/components/app-font-gate';
import { AppScreen, AppText } from '../src/components/ui';
import { pressedFeedback } from '../src/components/ui/interaction-feedback';
import { colors, radius, spacing } from '../src/theme';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <AppScreen contentContainerStyle={styles.errorContent}>
    <View style={styles.errorCopy}>
      <AppText variant="h3">Something went wrong</AppText>
      <AppText color="text.secondary">Please try opening the app again.</AppText>
    </View>
    <Pressable
      accessibilityRole="button"
      onPress={retry}
      style={({ pressed }) => [styles.retryButton, pressed && pressedFeedback]}
    >
      <AppText variant="buttonLabel" color="text.onAccent">Try again</AppText>
    </Pressable>
  </AppScreen>;
}

function AppShell() {
  return <>
    <StatusBar style="light" />
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background.app }, headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dev/foundations" options={{ headerShown: false }} />
      <Stack.Screen name="dev/components" options={{ headerShown: false }} />
    </Stack>
  </>;
}

export default function RootLayout() {
  return <AppFontGate><AppShell /></AppFontGate>;
}

const styles = StyleSheet.create({
  errorContent: {
    justifyContent: 'center',
    gap: spacing[24],
  },
  errorCopy: {
    gap: spacing[8],
  },
  retryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius.medium,
    backgroundColor: colors.action.primary,
  },
});
