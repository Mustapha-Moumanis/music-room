import * as Clipboard from 'expo-clipboard';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { type GoogleSignInResult, signInWithGoogle, signOutWithGoogle } from '../../src/auth/google';
import { Action, Screen, styles } from '../../src/components/ui';
import { isDevBuild } from '../../src/config/variant';

export default function GoogleSpikeScreen() {
  const [result, setResult] = useState<GoogleSignInResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isDevBuild()) return <Redirect href="/(auth)/login" />;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    setMessage('');
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Something went wrong. Try again.'); }
    finally { setBusy(false); }
  }

  return <Screen>
    <Text style={styles.eyebrow}>MCH-84 · DEVELOPMENT ONLY</Text>
    <Text style={styles.title}>Google sign-in spike</Text>
    <Text style={styles.body}>Test an Android ID token with the backend verifier. The real account flow arrives in M1 (MCH-89/92).</Text>
    <Action title="Sign in with Google" disabled={busy} loading={busy} onPress={() => void run(async () => {
      setResult(null);
      setResult(await signInWithGoogle());
    })} />
    {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text> : null}
    {result ? <>
      <View style={styles.panel}>
        <Text style={styles.label}>GOOGLE ACCOUNT</Text>
        <Text selectable style={styles.body}>{result.email}</Text>
        <Text style={styles.label}>ID TOKEN · TRUNCATED</Text>
        <Text selectable style={styles.url}>{result.idToken.slice(0, 32)}…{result.idToken.slice(-16)}</Text>
        <Text style={styles.body}>Treat this token as a credential. Copy it only to your local verifier.</Text>
        <Action title="Copy idToken" secondary disabled={busy} onPress={() => void run(async () => {
          const copied = await Clipboard.setStringAsync(result.idToken);
          if (!copied) throw new Error('Could not copy the idToken. Try again.');
          setMessage('idToken copied. Paste it into the backend command below.');
        })} />
      </View>
      <View style={styles.panel}>
        <Text style={styles.label}>VERIFY FROM THE REPOSITORY ROOT</Text>
        <Text selectable style={styles.url}>cd backend && npx ts-node scripts/verify-google-id-token.ts &apos;&lt;idToken&gt;&apos;</Text>
        <Text style={styles.body}>Replace &lt;idToken&gt; with the full copied token, keeping the single quotes.</Text>
      </View>
      <Action title="Sign out" secondary disabled={busy} onPress={() => void run(async () => {
        await signOutWithGoogle();
        setResult(null);
        setMessage('Signed out.');
      })} />
    </> : null}
  </Screen>;
}
