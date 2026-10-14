import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, PasswordField, TextField } from '../../components/ui';
import authContent from '../../content/auth.json';
import { goBackOrReplace } from '../../lib/navigation';
import { authScreenStyles as styles } from './auth-screen.styles';
import { AccountRow, AuthActionStack, AuthBackHeader, AuthFooterLink, AuthScreen, AuthStatusCard, AuthTitle, authStyles } from './auth-ui';

export function CheckMailScreen() {
  const router = useRouter();
  const [resent, setResent] = useState(false);

  return <AuthScreen testID="check-mail-screen">
    <AuthBackHeader onPress={() => goBackOrReplace(router, '/register')} />
    <AuthTitle eyebrow="One more step" title="Verify your email" />
    <AuthStatusCard
      icon="✉"
      title="Check your inbox"
      description="We sent a verification link to souad@musicroom.app. Open it to finish creating your account."
      tone="pending"
    />
    <AuthActionStack>
      <Button variant="secondary" onPress={() => setResent(true)}>{resent ? 'Email sent again' : 'Resend email'}</Button>
      <AuthFooterLink before="Wrong address?" action="Use another email" onPress={() => router.replace('/register')} />
    </AuthActionStack>
  </AuthScreen>;
}

export function VerificationResultScreen() {
  const router = useRouter();

  return <AuthScreen testID="verification-result-screen">
    <AuthBackHeader onPress={() => goBackOrReplace(router, '/check-mail')} />
    <AuthTitle eyebrow="Verified" title="You're ready" />
    <AuthStatusCard
      icon="✓"
      title="Email verified"
      description="Your account is ready. Now set up your profile and start listening together."
    />
    <Button onPress={() => router.push('/music-preferences')}>Continue to Music Room</Button>
  </AuthScreen>;
}

export function ForgotPasswordScreen() {
  const router = useRouter();

  return <AuthScreen testID="forgot-password-screen">
    <AuthBackHeader label="Login" onPress={() => router.replace('/login')} />
    <AuthTitle
      eyebrow="Password recovery"
      title="Reset your password"
      description="Enter the email connected to your account. We'll send you a reset link."
    />
    <View style={authStyles.form}>
      <TextField label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Button onPress={() => router.push('/reset-password')}>Send reset link</Button>
    </View>
    <AuthFooterLink before="Remembered it?" action="Back to sign in" onPress={() => router.replace('/login')} />
  </AuthScreen>;
}

export function ResetPasswordScreen() {
  const router = useRouter();

  return <AuthScreen testID="reset-password-screen">
    <AuthBackHeader onPress={() => goBackOrReplace(router, '/forgot-password')} />
    <AuthTitle
      eyebrow="Choose a new one"
      title="Create new password"
      description="Use at least 8 characters and avoid reusing an old password."
    />
    <View style={authStyles.form}>
      <PasswordField label="New password" placeholder="Create new password" autoComplete="new-password" />
      <PasswordField label="Confirm password" placeholder="Repeat new password" autoComplete="new-password" />
      <Button onPress={() => router.replace('/login')}>Save new password</Button>
    </View>
  </AuthScreen>;
}

export function GoogleSignInScreen() {
  const router = useRouter();
  const continueWithAccount = () => router.replace('/music-preferences');

  return <AuthScreen testID="google-sign-in-screen">
    <AuthBackHeader label="Login" onPress={() => router.replace('/login')} />
    <AuthTitle
      eyebrow="Google account"
      title="Continue with Google"
      description="Choose an account to connect to Music Room."
    />
    <View style={styles.accounts}>
      {authContent.googleAccounts.map((account) => <AccountRow
        key={account.email}
        {...account}
        onPress={continueWithAccount}
      />)}
    </View>
    <AppText variant="bodySmall" color="text.muted">Music Room will only use your basic profile and email to create or sign in to your account.</AppText>
  </AuthScreen>;
}
