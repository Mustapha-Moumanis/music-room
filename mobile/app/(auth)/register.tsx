import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { register } from '../../src/api/auth';
import { Action, Field, Screen, styles } from '../../src/components/ui';
import { passwordPolicyMessage, validPassword } from '../../src/lib/password-policy';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!validPassword(password)) { setError(passwordPolicyMessage); return; }
    setLoading(true);
    try {
      await register({ displayName: displayName.trim(), email: email.trim(), password });
      router.replace({ pathname: '/(auth)/check-mail', params: { email: email.trim() } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  }

  return <Screen>
    <Text style={styles.eyebrow}>CREATE ACCOUNT</Text>
    <Text style={styles.title}>Register</Text>
    <Field label="Display name" value={displayName} onChangeText={setDisplayName} />
    <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
    <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
    <Text style={styles.body}>{passwordPolicyMessage}</Text>
    <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" />
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    <Action title="Create account" loading={loading} disabled={loading} onPress={() => void submit()} />
    <Action title="Back to login" secondary disabled={loading} onPress={() => router.replace('/(auth)/login')} />
  </Screen>;
}
