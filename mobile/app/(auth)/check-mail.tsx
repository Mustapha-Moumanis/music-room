import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { resendVerification } from '../../src/api/auth';
import { Action, Screen, styles } from '../../src/components/ui';

export default function CheckMailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email ?? '');
  const [cooldown, setCooldown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function resend() {
    setLoading(true); setError(''); setMessage('');
    try {
      await resendVerification({ email });
      setMessage('If that email has an account, a verification email has been sent.');
      setCooldown(true);
      setTimeout(() => setCooldown(false), 30000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not resend the email.');
    } finally {
      setLoading(false);
    }
  }

  return <Screen>
    <Text style={styles.eyebrow}>VERIFY EMAIL</Text>
    <Text style={styles.title}>Check your mail</Text>
    <Text style={styles.body}>A verification link was sent to {email || 'your email address'}.</Text>
    {message ? <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text> : null}
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    <Action title={cooldown ? 'Resend email in 30 s' : 'Resend email'} secondary disabled={loading || cooldown || !email} loading={loading} onPress={() => void resend()} />
    <Action title="Back to login" onPress={() => router.replace('/(auth)/login')} />
  </Screen>;
}
