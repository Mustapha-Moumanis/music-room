import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button } from '../../components/ui';
import { ProfileFriendsScreen, SectionHeading } from './profile-friends-ui';
import { SettingsHeader, profileSettingsStyles as styles } from './profile-settings-shared';

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
