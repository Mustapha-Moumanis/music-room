import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { resetPassword } from '../../src/api/auth';
import { ApiError } from '../../src/api/errors';
import { Action, colors, Screen, styles } from '../../src/components/ui';
import { passwordPolicyMessage, validPassword } from '../../src/lib/password-policy';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(String(params.email ?? ''));
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit() {
    setError(''); setMessage('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!validPassword(password)) { setError(passwordPolicyMessage); return; }
    setLoading(true);
    try {
      await resetPassword({ email: email.trim(), code: code.trim(), newPassword: password });
      setMessage('Password changed, log in');
      router.replace('/(auth)/login');
    } catch (cause) {
      setError(cause instanceof ApiError && cause.code === 'INVALID_RESET_CODE' ? 'Invalid or expired code.' : cause instanceof Error ? cause.message : 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  }

  return <Screen>
    <Text style={styles.eyebrow}>PASSWORD</Text>
    <Text style={styles.title}>Reset password</Text>
    <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
    <Field label="6-digit code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} />
    <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
    <Text style={styles.body}>{passwordPolicyMessage}</Text>
    <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" />
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text> : null}
    <Action title="Change password" loading={loading} disabled={loading} onPress={() => void submit()} />
    <Action title="Back to login" secondary disabled={loading} onPress={() => router.replace('/(auth)/login')} />
  </Screen>;
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...input } = props;
  return <View style={{ gap: 10 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput accessibilityLabel={label} style={styles.input} placeholderTextColor={colors.muted}
      autoCapitalize="none" autoCorrect={false} {...input} />
  </View>;
}
