import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { linkGoogle, logoutAll, unlinkGoogle } from '../../src/api/auth';
import { ApiError } from '../../src/api/errors';
import { googleSignInAvailable, signInWithGoogle } from '../../src/auth/google';
import { Action, Screen, styles } from '../../src/components/ui';
import { useSessionStore } from '../../src/stores/session.store';

export default function AccountScreen() {
  const user = useSessionStore((state) => state.user);
  const signOut = useSessionStore((state) => state.signOut);
  const setUser = useSessionStore((state) => state.setUser);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const hasGoogle = user?.providers.includes('GOOGLE') ?? false;
  const canUnlinkGoogle = Boolean(user?.hasPassword);

  async function run(name: string, action: () => Promise<void>) {
    setBusy(name); setError(''); setMessage('');
    try { await action(); } catch (cause) { setError(messageFor(cause)); } finally { setBusy(''); }
  }

  return <Screen>
    <Text style={styles.eyebrow}>ACCOUNT</Text>
    <Text style={styles.title}>Settings</Text>
    <View style={styles.panel}>
      <Text style={styles.label}>EMAIL</Text>
      <Text selectable style={styles.body}>{user?.email}</Text>
      <Text style={user?.emailVerified ? styles.success : styles.error}>{user?.emailVerified ? 'Verified' : 'Not verified'}</Text>
      <Text style={styles.label}>LINKED PROVIDERS</Text>
      <Text style={styles.body}>{user?.providers.join(', ') || 'None'}</Text>
    </View>
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text> : null}
    {googleSignInAvailable ? <>
    <Action title="Link Google" secondary disabled={busy !== '' || hasGoogle} loading={busy === 'link'} onPress={() => void run('link', async () => {
      const google = await signInWithGoogle();
      setUser(await linkGoogle({ idToken: google.idToken }));
      setMessage('Google linked.');
    })} />
    {!canUnlinkGoogle ? <Text style={styles.body}>Add a password before unlinking Google.</Text> : null}
    <Action title="Unlink Google" secondary disabled={busy !== '' || !hasGoogle || !canUnlinkGoogle} loading={busy === 'unlink'} onPress={() => void run('unlink', async () => {
      setUser(await unlinkGoogle());
      setMessage('Google unlinked.');
    })} />
    </> : <Text style={styles.body}>Linking Google is available in the Android app.</Text>}
    <Action title="Log out" disabled={busy !== ''} loading={busy === 'logout'} onPress={() => void run('logout', signOut)} />
    <Action title="Log out of all devices" secondary disabled={busy !== ''} loading={busy === 'logoutAll'} onPress={() => void run('logoutAll', async () => {
      await logoutAll();
      await signOut();
    })} />
    <Action title="Server settings" secondary disabled={busy !== ''} onPress={() => router.push('/settings')} />
  </Screen>;
}

function messageFor(cause: unknown): string {
  if (cause instanceof ApiError) {
    if (cause.code === 'GOOGLE_ALREADY_LINKED') return 'Google is already linked to this account.';
    if (cause.code === 'PASSWORD_REQUIRED_TO_UNLINK') return 'Add a password before unlinking Google.';
  }
  return cause instanceof Error ? cause.message : 'Something went wrong. Try again.';
}
