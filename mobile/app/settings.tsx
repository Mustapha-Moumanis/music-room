import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { pingHealth } from '../src/api/health';
import { Action, colors, Screen, styles } from '../src/components/ui';
import { DEFAULT_BACKEND_URL, normalizeBackendUrl } from '../src/config/backend';
import { useSettingsStore } from '../src/stores/settings.store';

export default function SettingsScreen() {
  const backendUrl = useSettingsStore((state) => state.backendUrl);
  const setBackendUrl = useSettingsStore((state) => state.setBackendUrl);
  const resetBackendUrl = useSettingsStore((state) => state.resetBackendUrl);
  const [input, setInput] = useState(backendUrl);
  const [testedUrl, setTestedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // Ignore a response if the user changed the candidate while it was in flight.
  const revision = useRef(0);

  function edit(value: string) {
    revision.current += 1;
    setInput(value); setTestedUrl(null); setMessage(''); setError(''); setLoading(false);
  }

  async function testConnection() {
    const current = ++revision.current;
    setError(''); setMessage(''); setTestedUrl(null);
    try {
      const candidate = normalizeBackendUrl(input);
      setLoading(true);
      const result = await pingHealth(candidate);
      if (revision.current !== current) return;
      setTestedUrl(candidate); setMessage(`✓ Connected (${result.latencyMs} ms)`);
    } catch (failure) {
      if (revision.current === current) setError(failure instanceof Error ? failure.message : 'Connection test failed');
    } finally {
      if (revision.current === current) setLoading(false);
    }
  }

  function save() {
    try {
      setBackendUrl(input);
      setError(''); setMessage('Server address saved');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Invalid URL');
    }
  }

  function reset() {
    resetBackendUrl(); edit(DEFAULT_BACKEND_URL); setMessage('Default server address restored');
  }

  return <Screen>
    <Text style={styles.eyebrow}>CONNECTION</Text>
    <Text style={styles.title}>Choose your server</Text>
    <Text style={styles.body}>Change the backend address anytime. No rebuild needed.</Text>
    <View style={{ gap: 10 }}>
      <Text style={styles.label}>Backend URL</Text>
      <TextInput accessibilityLabel="Backend URL" value={input} onChangeText={edit} style={styles.input}
        placeholder="http://192.168.1.10:3000" placeholderTextColor={colors.muted} autoCapitalize="none"
        autoCorrect={false} keyboardType="url" returnKeyType="done" />
    </View>
    <Action title="Test connection" loading={loading} onPress={() => { void testConnection(); }} secondary />
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text> : null}
    <Action title="Save" disabled={!testedUrl || loading} onPress={save} />
    <Action title="Save anyway" secondary onPress={save} />
    <Action title="Reset to default" secondary onPress={reset} />
    <View style={styles.panel}>
      <Text style={styles.label}>Finding your server</Text>
      <Text style={styles.body}>Android emulator: http://10.0.2.2:3000</Text>
      <Text style={styles.body}>Physical phone: use your computer’s LAN IP, e.g. http://192.168.1.10:3000. Connect both devices to the same Wi-Fi.</Text>
    </View>
  </Screen>;
}
