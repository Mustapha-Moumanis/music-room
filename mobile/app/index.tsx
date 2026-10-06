import { Redirect } from 'expo-router';

import { LoadingScreen } from '../src/components/ui';
import { useSessionStore } from '../src/stores/session.store';

export default function Index() {
  const status = useSessionStore((state) => state.status);
  if (status === 'loading') return <LoadingScreen />;
  return <Redirect href={status === 'signedIn' ? '/(app)/home' : '/(auth)/login'} />;
}
