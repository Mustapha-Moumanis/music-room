import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon, AppText, Avatar, SettingsRow } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import profileContent from '../../content/profile.json';
import { ProfileFriendsScreen, SectionHeading } from './profile-friends-ui';
import { SettingsHeader, profileSettingsStyles as styles } from './profile-settings-shared';

export function SettingsScreen() {
  const router = useRouter();
  const settings = profileContent.settings;
  const [autoplay, setAutoplay] = useState(settings.playbackRows[0].defaultEnabled);
  const [mobileData, setMobileData] = useState(settings.playbackRows[1].defaultEnabled);

  return <ProfileFriendsScreen active="profile" testID="settings-screen">
    <SettingsHeader fallback="/profile" title="Settings" />
    <Pressable
      accessibilityLabel="View and edit profile"
      accessibilityRole="button"
      onPress={() => router.push('/profile/edit')}
      style={({ pressed }) => [styles.profileSummary, pressed && pressedFeedback]}
    >
      <Avatar initials={settings.profile.initials} size="card" />
      <View style={styles.profileCopy}>
        <AppText variant="navigationLabel">{settings.profile.name}</AppText>
        <AppText variant="caption" color="text.muted">{settings.profile.subtitle}</AppText>
      </View>
      <AppIcon icon={ArrowRight01Icon} size="compact" tone="muted" />
    </Pressable>
    <SectionHeading title="Account" />
    <SettingsRow
      title={settings.accountRows[0].title}
      subtitle={settings.accountRows[0].subtitle}
      onPress={() => router.push('/settings/linked-accounts')}
    />
    <SettingsRow
      title={settings.accountRows[1].title}
      subtitle={settings.accountRows[1].subtitle}
      onPress={() => router.push('/backend-url')}
    />
    <SectionHeading title="Playback" />
    <SettingsRow
      testID="autoplay-setting"
      type="toggle"
      title={settings.playbackRows[0].title}
      subtitle={settings.playbackRows[0].subtitle}
      enabled={autoplay}
      onToggle={setAutoplay}
    />
    <SettingsRow
      testID="mobile-data-setting"
      type="toggle"
      title={settings.playbackRows[1].title}
      subtitle={settings.playbackRows[1].subtitle}
      enabled={mobileData}
      onToggle={setMobileData}
    />
    <SectionHeading title="Privacy" />
    <SettingsRow
      title="Profile visibility"
      subtitle="Public and friends-only fields"
      onPress={() => router.push('/profile/edit')}
    />
  </ProfileFriendsScreen>;
}
