import { UserAdd01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppIcon, AppText, Avatar, Button } from '../../components/ui';
import profileContent from '../../content/profile.json';
import { goBackOrReplace } from '../../lib/navigation';
import { usePlaybackStore } from '../../stores/playback.store';
import { MusicSpotlightCard, ProfileRecordDecoration } from './profile-cards';
import { profileScreenStyles as styles } from './profile-screen.styles';
import { MobileProfileHeader, ProfileFriendsScreen, ProfileInformationRow, SectionHeading, profileFriendsStyles } from './profile-friends-ui';

function ViewerProfile({ friend }: { friend: boolean }) {
  const router = useRouter();
  const startPlayback = usePlaybackStore((state) => state.start);
  const [relation, setRelation] = useState(friend ? 'friend' : 'stranger');
  const isFriend = relation === 'friend';
  const profile = friend ? profileContent.viewerProfiles.friend : profileContent.viewerProfiles.stranger;

  return <ProfileFriendsScreen
    active="friends"
    bodyStyle={styles.viewerBody}
    testID={friend ? 'friend-profile-screen' : 'stranger-profile-screen'}
  >
    <MobileProfileHeader title="Profile" action onBack={() => goBackOrReplace(router, '/friends')} />
    <View style={styles.viewerHero}>
      <ProfileRecordDecoration />
      <View style={styles.avatarRing}><Avatar initials={profile.initials} size="large" /></View>
      <AppText variant="caption" color="action.secondary">MUSIC PROFILE</AppText>
      <AppText variant="h3" style={profileFriendsStyles.centered}>{profile.name}</AppText>
      <AppText variant="bodySmall" color="text.muted">@{profile.username}</AppText>
      <AppText variant="bodySmall" color="text.secondary" style={profileFriendsStyles.centered}>
        {profile.bio}
      </AppText>
      <View style={styles.relation}>
        <AppIcon icon={isFriend ? UserGroupIcon : UserAdd01Icon} size="compact" />
        <AppText variant="caption" color={isFriend ? 'action.secondary' : 'text.muted'}>{isFriend ? 'Friend' : 'Not friends yet'}</AppText>
      </View>
    </View>
    {isFriend ? <View style={profileFriendsStyles.actionRow}>
      <Button variant="secondary" style={styles.flexButton} onPress={() => router.push('/playlists/read-only')}>Open playlist</Button>
      <Button style={styles.flexButton} onPress={() => setRelation('stranger')}>Friends</Button>
    </View> : <Button onPress={() => setRelation('friend')}>Add friend</Button>}
    <SectionHeading title="Public information" />
    <ProfileInformationRow compact label="Location" value={profile.location} />
    <ProfileInformationRow compact label="Favorite artist" value={profile.favoriteArtist} />
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
    {isFriend ? <>
      <SectionHeading title="Shared with friends" />
      <ProfileInformationRow compact label="Instagram" value={profile.instagram} />
      <ProfileInformationRow compact label="Listening activity" value={profile.listeningActivity} />
    </> : null}
  </ProfileFriendsScreen>;
}

export function StrangerProfileScreen() {
  return <ViewerProfile friend={false} />;
}

export function FriendProfileScreen() {
  return <ViewerProfile friend />;
}
