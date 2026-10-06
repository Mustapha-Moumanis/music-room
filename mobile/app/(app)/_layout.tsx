import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

import { LoadingScreen } from '../../src/components/ui';
import { useSessionStore } from '../../src/stores/session.store';

export default function AppLayout() {
  const status = useSessionStore((state) => state.status);
  const hasUser = useSessionStore((state) => state.user !== null);
  const loadUser = useSessionStore((state) => state.loadUser);

  // Started offline: the session was kept, so fetch the profile once the backend is reachable.
  useEffect(() => {
    if (status !== 'signedIn' || hasUser) return;
    void loadUser();
    const timer = setInterval(() => void loadUser(), 15000);
    return () => clearInterval(timer);
  }, [status, hasUser, loadUser]);

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'signedOut') return <Redirect href="/(auth)/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
