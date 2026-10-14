import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Button, PasswordField, TextField } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { goBackOrReplace } from '../../lib/navigation';
import { authScreenStyles as styles } from './auth-screen.styles';
import { AuthActionStack, AuthBackHeader, AuthBrand, AuthDivider, AuthFooterLink, AuthScreen, AuthTitle, CassetteArtwork, ProviderButton, authStyles } from './auth-ui';

export function WelcomeScreen() {
  const router = useRouter();

  return <AuthScreen testID="welcome-screen">
    <AuthBrand />
    <CassetteArtwork />
    <View style={styles.welcomeCopy}>
      <AppText variant="h1">Old sounds.{`\n`}New feelings.</AppText>
      <AppText color="text.secondary">A warmer way to discover music, vote together, and build playlists with friends.</AppText>
    </View>
    <AuthActionStack>
      <Button onPress={() => router.push('/register')}>Create account</Button>
      <Button variant="secondary" onPress={() => router.push('/login')}>Sign in</Button>
      <AuthFooterLink
        before="Need a custom server?"
        action="Configure backend"
        onPress={() => router.push('/backend-url')}
      />
    </AuthActionStack>
  </AuthScreen>;
}

export function RegisterScreen() {
  const router = useRouter();

  return <AuthScreen testID="register-screen">
    <AuthBackHeader onPress={() => goBackOrReplace(router, '/welcome')} />
    <AuthTitle
      eyebrow="New account"
      title="Create your account"
      description="Keep it simple. You can personalize your music profile after verification."
    />
    <View style={authStyles.form}>
      <TextField label="Full name" placeholder="Your name" autoComplete="name" />
      <TextField label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <PasswordField label="Password" placeholder="Create a password" autoComplete="new-password" />
      <Button onPress={() => router.push('/check-mail')}>Create account</Button>
      <AuthDivider />
      <ProviderButton onPress={() => router.push('/google-sign-in')} />
    </View>
    <AuthFooterLink before="Already have an account?" action="Sign in" onPress={() => router.replace('/login')} />
  </AuthScreen>;
}

export function LoginScreen() {
  const router = useRouter();

  return <AuthScreen testID="login-screen">
    <AuthBackHeader onPress={() => goBackOrReplace(router, '/welcome')} />
    <AuthTitle eyebrow="Welcome back" title="Sign in" description="Pick up where you left off." />
    <View style={authStyles.form}>
      <TextField label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <PasswordField placeholder="Enter your password" autoComplete="current-password" />
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/forgot-password')}
        style={({ pressed }) => [authStyles.linkButton, pressed && pressedFeedback]}
      >
        <AppText variant="navigationLabel" color="action.secondary">Forgot password?</AppText>
      </Pressable>
      <Button onPress={() => router.push('/music-preferences')}>Sign in</Button>
      <AuthDivider />
      <ProviderButton onPress={() => router.push('/google-sign-in')} />
    </View>
    <AuthFooterLink before="New to Music Room?" action="Create account" onPress={() => router.replace('/register')} />
  </AuthScreen>;
}
