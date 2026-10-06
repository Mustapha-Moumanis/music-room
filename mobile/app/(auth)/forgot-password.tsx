import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { forgotPassword } from '../../src/api/auth';
import { Action, colors, Screen, styles } from '../../src/components/ui';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true); setError('');
    try {
      await forgotPassword({ email: email.trim() });
      router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim() } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send a reset code.');
    } finally {
      setLoading(false);
    }
  }

  return <Screen>
    <Text style={styles.eyebrow}>PASSWORD</Text>
    <Text style={styles.title}>Forgot password</Text>
    <Text style={styles.body}>Enter your email and we will send a 6-digit reset code.</Text>
    <View style={{ gap: 10 }}>
      <Text style={styles.label}>Email</Text>
      <TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} style={styles.input}
        placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
    </View>
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    <Action title="Send code" loading={loading} disabled={loading} onPress={() => void submit()} />
    <Action title="Back to login" secondary disabled={loading} onPress={() => router.replace('/(auth)/login')} />
  </Screen>;
}
