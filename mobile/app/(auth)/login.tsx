import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { googleSignIn, login } from '../../src/api/auth';
import { ApiError } from '../../src/api/errors';
import { pingHealth } from '../../src/api/health';
import { signInWithGoogle } from '../../src/auth/google';
import { Action, colors, Screen, styles } from '../../src/components/ui';
import { isDevBuild } from '../../src/config/variant';
import { useSettingsStore } from '../../src/stores/settings.store';
import { useSessionStore } from '../../src/stores/session.store';

export default function LoginScreen() {
  const backendUrl = useSettingsStore((state) => state.backendUrl);
  const signIn = useSessionStore((state) => state.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const health = useQuery({ queryKey: ['health', backendUrl], queryFn: () => pingHealth(backendUrl), refetchInterval: process.env.NODE_ENV === 'test' ? false : 15000, staleTime: 0 });

  async function submit() {
    setBusy('login'); setError('');
    try {
      await signIn(await login({ email: email.trim(), password }));
      router.replace('/(app)/home');
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'EMAIL_NOT_VERIFIED') {
        router.push({ pathname: '/(auth)/check-mail', params: { email: email.trim() } });
      } else {
        setError(loginMessage(cause));
      }
    } finally {
      setBusy('');
    }
  }

  async function submitGoogle() {
    setBusy('google'); setError('');
    try {
      const google = await signInWithGoogle();
      await signIn(await googleSignIn({ idToken: google.idToken }));
      router.replace('/(app)/home');
    } catch (cause) {
      setError(loginMessage(cause));
    } finally {
      setBusy('');
    }
  }

  return <Screen>
    <Text style={styles.eyebrow}>LISTEN TOGETHER</Text>
    <Text style={styles.title}>Music Room</Text>
    <Text style={styles.body}>Your next shared listening session starts here.</Text>
    <View style={{ gap: 10 }}>
      <Text style={styles.label}>Email</Text>
      <TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} style={styles.input}
        placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
    </View>
    <View style={{ gap: 10 }}>
      <Text style={styles.label}>Password</Text>
      <TextInput accessibilityLabel="Password" value={password} onChangeText={setPassword} style={styles.input}
        placeholderTextColor={colors.muted} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="password" />
    </View>
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    <Action title="Log in" loading={busy === 'login'} disabled={busy !== ''} onPress={() => void submit()} />
    <Action title="Continue with Google" secondary loading={busy === 'google'} disabled={busy !== ''} onPress={() => void submitGoogle()} />
    <Action title="Register" secondary disabled={busy !== ''} onPress={() => router.push('/(auth)/register')} />
    <Action title="Forgot password" secondary disabled={busy !== ''} onPress={() => router.push('/(auth)/forgot-password')} />
    <View style={styles.panel}>
      <Text style={styles.label}>YOUR SERVER</Text>
      <Text selectable style={styles.url}>{backendUrl}</Text>
      <Text accessibilityLiveRegion="polite" style={health.isError ? styles.error : styles.success}>
        {health.isError ? `Error — ${health.error.message}` : health.data ? `OK · ${health.data.latencyMs} ms` : 'Checking connection…'}
      </Text>
    </View>
    {isDevBuild() && <Action title="Google sign-in spike" secondary onPress={() => router.push('/dev/google-spike')} />}
    <Action title="Server settings" secondary onPress={() => router.push('/settings')} />
  </Screen>;
}

function loginMessage(cause: unknown): string {
  if (cause instanceof ApiError) {
    if (cause.code === 'INVALID_CREDENTIALS') return 'Wrong email or password.';
    if (cause.code === 'ACCOUNT_EXISTS_LINK_REQUIRED') return 'This email already has a password account. Log in with your password, then link Google in Settings.';
  }
  return cause instanceof Error ? cause.message : 'Could not log in. Try again.';
}
