import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { Action, colors, LoadingScreen, Screen, styles } from '../src/components/ui';
import { queryClient } from '../src/lib/query-client';
import { useSettingsStore } from '../src/stores/settings.store';
import { useSessionStore } from '../src/stores/session.store';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <Screen><Text style={styles.title}>Something went wrong</Text><Text style={styles.body}>Please try opening the app again.</Text><Action title="Try again" onPress={retry} /></Screen>;
}

export default function RootLayout() {
  const hydrated = useSettingsStore((state) => state.hydrated);
  const sessionStatus = useSessionStore((state) => state.status);
  const bootstrap = useSessionStore((state) => state.bootstrap);
  useEffect(() => {
    if (hydrated && sessionStatus === 'loading') void bootstrap();
  }, [bootstrap, hydrated, sessionStatus]);
  return <QueryClientProvider client={queryClient}>
    <StatusBar style="light" />
    {hydrated ? <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Server settings' }} />
      <Stack.Screen name="dev/google-spike" options={{ title: 'Google sign-in spike' }} />
    </Stack> : <LoadingScreen />}
  </QueryClientProvider>;
}
