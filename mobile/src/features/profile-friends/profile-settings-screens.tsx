import { ArrowLeft02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppIcon,
  AppText,
  Avatar,
  Button,
  SettingsRow,
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import profileContent from '../../content/profile.json';
import { goBackOrReplace } from '../../lib/navigation';
import { colors, radius, spacing } from '../../theme';
import {
  ProfileFriendsScreen,
  SectionHeading,
} from './profile-friends-ui';

function SettingsHeader({ fallback, title }: { fallback: '/profile' | '/settings'; title: string }) {
  const router = useRouter();

  return <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={() => goBackOrReplace(router, fallback)}
        style={({ pressed }) => [styles.headerIconButton, pressed && pressedFeedback]}
      >
        <AppIcon icon={ArrowLeft02Icon} size="standard" />
      </Pressable>
      <AppText variant="h4" color="action.primary" numberOfLines={1} style={styles.headerTitle}>{title}</AppText>
    </View>
  </View>;
}

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

export function SubscriptionScreen() {
  const [interested, setInterested] = useState(false);

  return <ProfileFriendsScreen active="profile" testID="subscription-screen">
    <SettingsHeader fallback="/profile" title="Subscription" />
    <View style={styles.currentPlanCard}>
      <View style={styles.planHeading}>
        <View>
          <AppText variant="caption" color="text.muted">CURRENT PLAN</AppText>
          <AppText variant="h3">Music Room Free</AppText>
        </View>
        <View style={styles.freeBadge}>
          <AppText variant="caption">FREE</AppText>
        </View>
      </View>
      <AppText variant="bodySmall" color="text.secondary">
        Keep discovering music, building playlists, and listening with friends.
      </AppText>
    </View>
    <SectionHeading title="Music Room Pro" />
    <View style={styles.proCard}>
      <AppText variant="caption" color="action.secondary">COMING SOON</AppText>
      <AppText variant="h4">More room for the music you love</AppText>
      <AppText variant="bodySmall" color="text.secondary">
        Pro is being shaped around better group listening, richer profiles, and more control over your library.
      </AppText>
      <View style={styles.benefitList}>
        {['Enhanced listening rooms', 'More collaborative playlist tools', 'Early access to new features'].map((benefit) => <View key={benefit} style={styles.benefitRow}>
          <View style={styles.benefitDot} />
          <AppText variant="bodySmall" style={styles.benefitCopy}>{benefit}</AppText>
        </View>)}
      </View>
      <Button variant="accent" disabled={interested} onPress={() => setInterested(true)}>
        {interested ? "You're on the list" : 'Notify me when Pro launches'}
      </Button>
    </View>
  </ProfileFriendsScreen>;
}

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
  currentPlanCard: {
    width: '100%',
    gap: spacing[16],
    padding: spacing[16],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  planHeading: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[12],
  },
  freeBadge: {
    height: spacing[32],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[12],
    borderRadius: radius.full,
    backgroundColor: colors.category.secondary,
  },
  proCard: {
    width: '100%',
    gap: spacing[16],
    overflow: 'hidden',
    padding: spacing[24],
    borderRadius: radius.media,
    backgroundColor: colors.background.surface,
  },
  benefitList: {
    gap: spacing[12],
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
  },
  benefitDot: {
    width: spacing[8],
    height: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.action.primary,
  },
  benefitCopy: {
    minWidth: 0,
    flex: 1,
  },
});
