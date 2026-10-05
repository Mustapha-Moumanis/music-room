import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import { Action, colors, LoadingScreen, Screen, styles } from '../src/components/ui';
import { useSettingsStore } from '../src/stores/settings.store';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <Screen><Text style={styles.title}>Something went wrong</Text><Text style={styles.body}>Please try opening the app again.</Text><Action title="Try again" onPress={retry} /></Screen>;
}

export default function RootLayout() {
  const hydrated = useSettingsStore((state) => state.hydrated);
  return <QueryClientProvider client={queryClient}>
    <StatusBar style="light" />
    {hydrated ? <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Server settings' }} />
    </Stack> : <LoadingScreen />}
  </QueryClientProvider>;
}
