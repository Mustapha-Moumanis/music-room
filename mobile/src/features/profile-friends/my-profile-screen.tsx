import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, Avatar, Button, MusicPreferenceChip } from '../../components/ui';
import profileContent from '../../content/profile.json';
import { profilePreferences } from '../../mocks/profile-friends-examples';
import { usePlaybackStore } from '../../stores/playback.store';
import { MusicSpotlightCard, ProfileRecordDecoration } from './profile-cards';
import { profileScreenStyles as styles } from './profile-screen.styles';
import { MobileProfileHeader, ProfileFriendsScreen, ProfileInformationRow, ProfileStats, SectionHeading, profileFriendsStyles } from './profile-friends-ui';

export function MyProfileScreen() {
  const router = useRouter();
  const startPlayback = usePlaybackStore((state) => state.start);
  const profile = profileContent.myProfile;

  return <ProfileFriendsScreen active="profile" showMiniPlayer testID="my-profile-screen">
    <MobileProfileHeader
      title="My profile"
      action
      accountMenuSelection="profile"
    />
    <View style={styles.profileHero}>
      <ProfileRecordDecoration />
      <View style={styles.avatarRing}><Avatar initials={profile.initials} size="large" /></View>
      <View style={styles.profileHeroCopy}>
        <AppText variant="caption" color="action.secondary">MUSIC PROFILE</AppText>
        <AppText variant="h4">{profile.name}</AppText>
        <AppText variant="bodySmall" color="text.muted">@{profile.username}</AppText>
        <AppText variant="caption" color="text.secondary">{profile.bio}</AppText>
        <Button
          size="small"
          variant="secondary"
          style={styles.editProfileButton}
          onPress={() => router.push('/profile/edit')}
        >
          Edit profile
        </Button>
      </View>
    </View>
    <ProfileStats
      onEventsPress={() => router.push('/events')}
      onFriendsPress={() => router.push('/friends')}
      onPlaylistsPress={() => router.push('/playlists/mine')}
    />
    <SectionHeading title="On repeat" />
    <MusicSpotlightCard
      artist={profile.onRepeat.artist}
      meta={profile.onRepeat.meta}
      onPress={() => {
        startPlayback();
        router.push('/player');
      }}
      title={profile.onRepeat.title}
    />
    <SectionHeading title="Profile details" />
    <ProfileInformationRow label="Location" value={profile.location} />
    <ProfileInformationRow label="Favorite artist" value={profile.favoriteArtist} />
    <SectionHeading title="Music taste" />
    <View style={profileFriendsStyles.chips}>
      {profilePreferences.map((preference) => <MusicPreferenceChip
        key={preference}
        selected
        onPress={() => router.push('/profile/edit')}
      >
        {preference}
      </MusicPreferenceChip>)}
    </View>
  </ProfileFriendsScreen>;
}
