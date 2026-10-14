import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, TextField } from '../../components/ui';
import authContent from '../../content/auth.json';
import { authScreenStyles as styles } from './auth-screen.styles';
import { AuthActionStack, AuthBackHeader, AuthNotice, AuthScreen, AuthStatusCard, AuthTitle, authStyles } from './auth-ui';

export function BackendUrlScreen() {
  const router = useRouter();

  return <AuthScreen testID="backend-url-screen">
    <AuthBackHeader label="Welcome" onPress={() => router.replace('/welcome')} />
    <AuthTitle
      eyebrow="Developer setup"
      title="Connect to your backend"
      description="Use this only when the app should connect to a custom development or local server."
    />
    <View style={authStyles.form}>
      <TextField
        label="Backend URL"
        defaultValue={authContent.backend.url}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <View style={styles.networkHint}>
        <View style={styles.networkDot} />
        <AppText variant="caption" color="text.muted">{authContent.backend.networkHint}</AppText>
      </View>
      <Button onPress={() => router.push('/backend-result')}>Test connection</Button>
      <Button variant="ghost" onPress={() => router.replace('/login')}>Use default server</Button>
    </View>
    <AuthNotice label="Before testing">Your phone and backend should be reachable on the same network when using a local IP address.</AuthNotice>
  </AuthScreen>;
}

export function BackendResultScreen() {
  const router = useRouter();

  return <AuthScreen testID="backend-result-screen">
    <AuthBackHeader label="Edit URL" onPress={() => router.replace('/backend-url')} />
    <AuthTitle eyebrow="Connection test" title="Server status" />
    <AuthStatusCard
      icon="✓"
      title={authContent.backend.statusTitle}
      description={authContent.backend.statusDescription}
    />
    <View style={styles.serverSummary}>
      <AppText variant="caption" color="text.muted">Connected server</AppText>
      <AppText variant="bodySmall">{authContent.backend.url}</AppText>
    </View>
    <AuthActionStack>
      <Button onPress={() => router.replace('/login')}>Continue to Login</Button>
      <Button variant="secondary" onPress={() => router.replace('/backend-url')}>Edit URL</Button>
    </AuthActionStack>
  </AuthScreen>;
}
