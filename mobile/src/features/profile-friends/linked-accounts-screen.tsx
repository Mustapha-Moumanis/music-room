import { useRouter } from 'expo-router';

import { AppText, SettingsRow } from '../../components/ui';
import profileContent from '../../content/profile.json';
import { ProfileFriendsScreen, SectionHeading } from './profile-friends-ui';
import { SettingsHeader } from './profile-settings-shared';

export function LinkedAccountsScreen() {
  const router = useRouter();
  const [google, email, password, backend] = profileContent.settings.linkedAccounts;

  return <ProfileFriendsScreen active="profile" testID="linked-accounts-screen">
    <SettingsHeader fallback="/settings" title="Linked accounts" />
    <AppText variant="bodySmall" color="text.secondary">
      Manage how you sign in and which services are connected to your account.
    </AppText>
    <SettingsRow
      type="status"
      title={google.title}
      subtitle={google.subtitle}
      status={google.status}
    />
    <SettingsRow
      type="status"
      title={email.title}
      subtitle={email.subtitle}
      status={email.status}
    />
    <SettingsRow
      title={password.title}
      subtitle={password.subtitle}
      onPress={() => router.push('/reset-password')}
    />
    <SectionHeading title="Server" />
    <SettingsRow
      type="status"
      title={backend.title}
      subtitle={backend.subtitle}
      status={backend.status}
    />
  </ProfileFriendsScreen>;
}
