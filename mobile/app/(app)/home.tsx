import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Text } from 'react-native';

import { friendKeys, listFriendRequests } from '../../src/api/friends';
import { Action, Screen, styles } from '../../src/components/ui';
import { useSessionStore } from '../../src/stores/session.store';

export default function HomeScreen() {
  const user = useSessionStore((state) => state.user);
  const requests = useQuery({ queryKey: friendKeys.requests, queryFn: listFriendRequests });
  const incoming = requests.data?.incoming.length ?? 0;
  return <Screen refreshing={requests.isRefetching} onRefresh={() => void requests.refetch()}>
    <Text style={styles.eyebrow}>MUSIC ROOM</Text>
    <Text style={styles.title}>Welcome, {user?.displayName ?? 'listener'}</Text>
    <Text style={styles.body}>Your shared listening room will live here.</Text>
    <Action title="My profile" onPress={() => router.push('/(app)/profile')} />
    <Action title={incoming > 0 ? `Friends · ${incoming} new request${incoming === 1 ? '' : 's'}` : 'Friends'} secondary
      onPress={() => router.push('/(app)/friends')} />
    <Action title="Find people" secondary onPress={() => router.push('/(app)/people')} />
    <Action title="Account settings" secondary onPress={() => router.push('/(app)/account')} />
  </Screen>;
}
