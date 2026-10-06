import { Redirect, Stack } from 'expo-router';

import { LoadingScreen } from '../../src/components/ui';
import { useSessionStore } from '../../src/stores/session.store';

export default function AuthLayout() {
  const status = useSessionStore((state) => state.status);
  if (status === 'loading') return <LoadingScreen />;
  if (status === 'signedIn') return <Redirect href="/(app)/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
