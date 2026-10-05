import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { pingHealth } from '../../src/api/health';
import { Action, Screen, styles } from '../../src/components/ui';
import { useSettingsStore } from '../../src/stores/settings.store';

// The EAS "spike" APK is a release build (__DEV__ false) of the .dev variant.
const isDevVariant = Constants.expoConfig?.extra?.appVariant === 'development';

export default function LoginScreen() {
  const backendUrl = useSettingsStore((state) => state.backendUrl);
  const health = useQuery({ queryKey: ['health', backendUrl], queryFn: () => pingHealth(backendUrl), refetchInterval: 15000, staleTime: 0 });
  return <Screen>
    <Text style={styles.eyebrow}>LISTEN TOGETHER</Text>
    <Text style={styles.title}>Music Room</Text>
    <Text style={styles.body}>Your next shared listening session starts here.</Text>
    <Text style={styles.body}>Sign-in arrives in M1</Text>
    <View style={styles.panel}>
      <Text style={styles.label}>YOUR SERVER</Text>
      <Text selectable style={styles.url}>{backendUrl}</Text>
      <Text accessibilityLiveRegion="polite" style={health.isError ? styles.error : styles.success}>
        {health.isError ? `Error — ${health.error.message}` : health.data ? `OK · ${health.data.latencyMs} ms` : 'Checking connection…'}
      </Text>
    </View>
    {(__DEV__ || isDevVariant) && <Action title="Google sign-in spike" secondary onPress={() => router.push('/dev/google-spike')} />}
    <Action title="Server settings" secondary onPress={() => router.push('/settings')} />
  </Screen>;
}
