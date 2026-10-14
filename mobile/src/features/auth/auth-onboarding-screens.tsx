import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, MusicPreferenceChip, TextField } from '../../components/ui';
import { animateNextLayout } from '../../components/ui/interaction-feedback';
import authContent from '../../content/auth.json';
import { goBackOrReplace } from '../../lib/navigation';
import { authScreenStyles as styles } from './auth-screen.styles';
import { AuthActionStack, AuthBackHeader, AuthScreen, AuthTextArea, AuthTitle, AvatarUpload, OnboardingProgress, authStyles } from './auth-ui';

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
