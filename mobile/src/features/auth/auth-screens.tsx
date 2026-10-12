import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  MusicPreferenceChip,
  PasswordField,
  TextField,
} from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import authContent from '../../content/auth.json';
import { goBackOrReplace } from '../../lib/navigation';
import { colors, radius, spacing } from '../../theme';
import {
  AccountRow,
  AuthActionStack,
  AuthBackHeader,
  AuthBrand,
  AuthDivider,
  AuthFooterLink,
  AuthNotice,
  AuthScreen,
  AuthStatusCard,
  AuthTextArea,
  AuthTitle,
  AvatarUpload,
  CassetteArtwork,
  OnboardingProgress,
  ProviderButton,
  authStyles,
} from './auth-ui';

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

export function MusicPreferencesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(() => new Set(authContent.defaultPreferences));

  const togglePreference = (preference: string) => {
    animateNextLayout();
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(preference)) next.delete(preference);
      else next.add(preference);
      return next;
    });
  };

  return <AuthScreen compact testID="music-preferences-screen">
    <AuthBackHeader label="Setup" onPress={() => goBackOrReplace(router, '/login')} />
    <OnboardingProgress step={1} />
    <AuthTitle
      eyebrow="Step 1 of 2"
      title="Choose your music taste"
      description="Pick a few genres you enjoy. You can change these anytime."
    />
    <View style={styles.preferenceChips}>
      {authContent.preferences.map((preference) => <MusicPreferenceChip
        key={preference}
        selected={selected.has(preference)}
        onPress={() => togglePreference(preference)}
      >
        {preference}
      </MusicPreferenceChip>)}
    </View>
    <AppText variant="caption" color="text.muted">Select as many as you like.</AppText>
    <View style={authStyles.spacer} />
    <AuthActionStack>
      <Button onPress={() => router.push('/profile-setup')}>Continue</Button>
      <Button variant="secondary" onPress={() => router.push('/profile-setup')}>Skip for now</Button>
    </AuthActionStack>
  </AuthScreen>;
}

export function ProfileSetupScreen() {
  const router = useRouter();
  const [photoMessage, setPhotoMessage] = useState(false);
  const [complete, setComplete] = useState(false);

  const showPhotoMessage = () => {
    animateNextLayout();
    setPhotoMessage(true);
  };
  const finish = () => {
    animateNextLayout();
    setComplete(true);
    router.replace('/home');
  };

  return <AuthScreen compact testID="profile-setup-screen">
    <AuthBackHeader label="Setup" onPress={() => goBackOrReplace(router, '/music-preferences')} />
    <OnboardingProgress step={2} />
    <AuthTitle
      eyebrow="Step 2 of 2"
      title="Tell us a bit about you"
      description="Add a few details to personalize your profile. Everything here is optional."
    />
    <View style={authStyles.form}>
      <AvatarUpload onPress={showPhotoMessage} />
      {photoMessage ? <AppText variant="caption" color="action.secondary">Photo picker will be connected in the profile milestone.</AppText> : null}
      <TextField label="Display name" defaultValue={authContent.profileSetup.displayName} autoComplete="name" />
      <AuthTextArea label="Short bio" placeholder={authContent.profileSetup.bioPlaceholder} />
      <TextField label="Favorite artist" placeholder={authContent.profileSetup.artistPlaceholder} />
    </View>
    {complete ? <AppText variant="bodySmall" color="action.secondary" accessibilityLiveRegion="polite">Setup complete. Your Music Room is ready.</AppText> : null}
    <AuthActionStack>
      <Button onPress={finish}>{complete ? 'Setup complete' : 'Finish setup'}</Button>
      <Button variant="secondary" onPress={finish}>Skip for now</Button>
    </AuthActionStack>
  </AuthScreen>;
}

const styles = StyleSheet.create({
  welcomeCopy: {
    width: '100%',
    gap: spacing[24],
  },
  accounts: {
    width: '100%',
    gap: spacing[12],
  },
  networkHint: {
    minHeight: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
  },
  networkDot: {
    width: spacing[8],
    height: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.action.secondary,
  },
  serverSummary: {
    width: '100%',
    gap: spacing[8],
    padding: spacing[16],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  preferenceChips: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[8],
  },
});
