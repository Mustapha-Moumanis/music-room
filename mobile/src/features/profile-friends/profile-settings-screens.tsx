import { ArrowLeft02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppIcon,
  AppText,
  Avatar,
  SettingsRow,
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { colors, radius, spacing } from '../../theme';
import {
  ProfileFriendsScreen,
  SectionHeading,
} from './profile-friends-ui';

function SettingsHeader({ title }: { title: string }) {
  const router = useRouter();

  return <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.headerIconButton, pressed && pressedFeedback]}
      >
        <AppIcon icon={ArrowLeft02Icon} size="standard" />
      </Pressable>
      <AppText variant="h4" numberOfLines={1} style={styles.headerTitle}>{title}</AppText>
    </View>
    <Avatar initials="SH" size="header" />
  </View>;
}

export function SettingsScreen() {
  const router = useRouter();
  const [autoplay, setAutoplay] = useState(true);
  const [mobileData, setMobileData] = useState(false);

  return <ProfileFriendsScreen active="profile" testID="settings-screen">
    <SettingsHeader title="Settings" />
    <Pressable
      accessibilityLabel="View and edit profile"
      accessibilityRole="button"
      onPress={() => router.push('/profile/edit')}
      style={({ pressed }) => [styles.profileSummary, pressed && pressedFeedback]}
    >
      <Avatar initials="SH" size="card" />
      <View style={styles.profileCopy}>
        <AppText variant="navigationLabel">Souad Hilal</AppText>
        <AppText variant="caption" color="text.muted">View and edit profile</AppText>
      </View>
      <AppIcon icon={ArrowRight01Icon} size="compact" tone="muted" />
    </Pressable>
    <SectionHeading title="Account" />
    <SettingsRow
      title="Linked accounts"
      subtitle="Google, email and sign-in providers"
      onPress={() => router.push('/settings/linked-accounts')}
    />
    <SettingsRow
      title="Backend server"
      subtitle="Default server"
      onPress={() => router.push('/backend-url')}
    />
    <SectionHeading title="Playback" />
    <SettingsRow
      testID="autoplay-setting"
      type="toggle"
      title="Autoplay"
      subtitle="Continue with similar music"
      enabled={autoplay}
      onToggle={setAutoplay}
    />
    <SettingsRow
      testID="mobile-data-setting"
      type="toggle"
      title="Download on mobile data"
      subtitle="Use Wi-Fi only"
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

export function LinkedAccountsScreen() {
  const router = useRouter();

  return <ProfileFriendsScreen active="profile" testID="linked-accounts-screen">
    <SettingsHeader title="Linked accounts" />
    <AppText variant="bodySmall" color="text.secondary">
      Manage how you sign in and which services are connected to your account.
    </AppText>
    <SettingsRow
      type="status"
      title="Google account"
      subtitle="souad.hilal@gmail.com"
      status="Connected"
    />
    <SettingsRow
      type="status"
      title="Email"
      subtitle="souad@musicroom.app"
      status="Verified"
    />
    <SettingsRow
      title="Password"
      subtitle="Last changed recently"
      onPress={() => router.push('/reset-password')}
    />
    <SectionHeading title="Server" />
    <SettingsRow
      type="status"
      title="Backend"
      subtitle="Default Music Room server"
      status="Connected"
    />
  </ProfileFriendsScreen>;
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    minWidth: 1,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    minWidth: 1,
    flexShrink: 1,
  },
  profileSummary: {
    width: '100%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  profileCopy: {
    minWidth: 1,
    flex: 1,
  },
});
