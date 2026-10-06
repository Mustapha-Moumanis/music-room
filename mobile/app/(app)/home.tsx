import { router } from 'expo-router';
import { Text } from 'react-native';

import { Action, Screen, styles } from '../../src/components/ui';
import { useSessionStore } from '../../src/stores/session.store';

export default function HomeScreen() {
  const user = useSessionStore((state) => state.user);
  return <Screen>
    <Text style={styles.eyebrow}>MUSIC ROOM</Text>
    <Text style={styles.title}>Welcome, {user?.displayName ?? 'listener'}</Text>
    <Text style={styles.body}>Your shared listening room will live here.</Text>
    <Action title="Account settings" secondary onPress={() => router.push('/(app)/account')} />
  </Screen>;
}
