import {
  Globe02Icon,
  PlayIcon,
  UserAdd01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppIcon,
  AppText,
  Avatar,
  Button,
  FriendRequestRow,
  MusicPreferenceChip,
  SearchField,
  UserCard,
} from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import profileContent from '../../content/profile.json';
import {
  friends,
  incomingRequests,
  profilePreferences,
  recentSearches,
  searchResults,
} from '../../mocks/profile-friends-examples';
import { goBackOrReplace } from '../../lib/navigation';
import { usePlaybackStore } from '../../stores/playback.store';
import { colors, radius, spacing } from '../../theme';
import {
  IconNote,
  MobileProfileHeader,
  ProfileFriendsScreen,
  ProfileInformationRow,
  ProfileStats,
  SectionHeading,
  profileFriendsStyles,
} from './profile-friends-ui';

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

export function FriendsListScreen() {
  const router = useRouter();

  return <ProfileFriendsScreen active="friends" showMiniPlayer testID="friends-list-screen">
    <MobileProfileHeader title="Friends" action />
    <Pressable
      accessibilityLabel="Find people"
      accessibilityRole="button"
      onPress={() => router.push('/friends/search')}
      style={({ pressed }) => [styles.friendsSummary, pressed && pressedFeedback]}
    >
      <View>
        <AppText variant="h5">{profileContent.stats[0].value} friends</AppText>
        <AppText variant="caption" color="text.muted">3 active in Music Room</AppText>
      </View>
      <AppIcon icon={UserAdd01Icon} size="standard" />
    </Pressable>
    <SearchField placeholder="Search friends" onSubmitEditing={() => router.push('/friends/search')} />
    <SectionHeading title="Your friends" action="Requests 2" onAction={() => router.push('/friends/requests')} />
    {friends.map((friend) => <UserCard key={friend.name} {...friend} relation="friend" onPress={() => router.push('/friends/friend-profile')} />)}
  </ProfileFriendsScreen>;
}

export function UserSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<Set<string>>(() => new Set());

  const add = (name: string) => {
    animateNextLayout();
    setAdded((current) => new Set(current).add(name));
  };

  return <ProfileFriendsScreen active="friends" testID="user-search-screen">
    <MobileProfileHeader title="Find people" onBack={() => goBackOrReplace(router, '/friends')} />
    <AppText variant="h2">Find someone on Music Room</AppText>
    <AppText variant="bodySmall" color="text.secondary">Search by display name or username. Public information is visible before you become friends.</AppText>
    <SearchField
      autoFocus
      placeholder="Search name or @username"
      value={query}
      onChangeText={setQuery}
      onSubmitEditing={() => router.push('/friends/search-results')}
    />
    <SectionHeading title="Recent searches" />
    {recentSearches.map((person) => <UserCard
      key={person.name}
      {...person}
      relation={added.has(person.name) ? 'friend' : 'stranger'}
      actionLabel={added.has(person.name) ? 'Friend' : 'Add friend'}
      onActionPress={() => add(person.name)}
      onPress={() => router.push(added.has(person.name) ? '/friends/friend-profile' : '/friends/stranger-profile')}
    />)}
  </ProfileFriendsScreen>;
}

export function SearchResultsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('yassine');
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  const add = (name: string) => {
    animateNextLayout();
    setAdded((current) => new Set(current).add(name));
  };

  return <ProfileFriendsScreen active="friends" testID="search-results-screen">
    <MobileProfileHeader title="Search results" onBack={() => goBackOrReplace(router, '/friends/search')} />
    <SearchField value={query} onChangeText={setQuery} />
    <SectionHeading title="People" action="3 results" />
    {searchResults.map((person) => {
      const relation = person.relation === 'friend' || added.has(person.name) ? 'friend' : 'stranger';
      return <UserCard
        key={person.name}
        {...person}
        relation={relation}
        actionLabel={relation === 'friend' ? 'Friend' : 'Add friend'}
        onActionPress={() => add(person.name)}
        onPress={() => router.push(relation === 'friend' ? '/friends/friend-profile' : '/friends/stranger-profile')}
      />;
    })}
    <IconNote icon={<AppIcon icon={Globe02Icon} size="compact" />}>
      Search results only expose each user's public profile fields.
    </IconNote>
  </ProfileFriendsScreen>;
}

export function FriendRequestsScreen() {
  const router = useRouter();
  const [resolved, setResolved] = useState<Record<string, 'accepted' | 'declined'>>({});
  const resolve = (name: string, status: 'accepted' | 'declined') => {
    animateNextLayout();
    setResolved((current) => ({ ...current, [name]: status }));
  };

  return <ProfileFriendsScreen active="friends" testID="friend-requests-screen">
    <MobileProfileHeader title="Friend requests" onBack={() => goBackOrReplace(router, '/friends')} />
    <AppText variant="bodySmall" color="text.secondary">Accepting a request unlocks fields that each person chose to share with friends.</AppText>
    <SectionHeading title="Incoming" action={String(incomingRequests.filter((request) => !resolved[request.name]).length)} />
    {incomingRequests.filter((request) => !resolved[request.name]).map((request) => <FriendRequestRow
      key={request.name}
      {...request}
      onAccept={() => resolve(request.name, 'accepted')}
      onDecline={() => resolve(request.name, 'declined')}
    />)}
    <SectionHeading title="Recently accepted" />
    <FriendRequestRow initials={profileContent.viewerProfiles.friend.initials} name={profileContent.viewerProfiles.friend.name} summary="Now friends" state="accepted" />
    {Object.entries(resolved).filter(([, status]) => status === 'accepted').map(([name]) => <FriendRequestRow
      key={name}
      initials="NA"
      name={name}
      summary="Now friends"
      state="accepted"
    />)}
  </ProfileFriendsScreen>;
}

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

function ProfileRecordDecoration() {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.profileRecord}>
    <View style={styles.profileRecordLabel}>
      <View style={styles.profileRecordHole} />
    </View>
  </View>;
}

function MusicSpotlightCard({ artist, meta, onPress, title }: {
  artist: string;
  meta: string;
  onPress: () => void;
  title: string;
}) {
  return <Pressable
    accessibilityLabel={`Play ${title} by ${artist}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.musicSpotlight, pressed && pressedFeedback]}
  >
    <View style={styles.musicArtwork}>
      <View style={styles.musicRecord}>
        <View style={styles.musicRecordHole} />
      </View>
    </View>
    <View style={styles.musicSpotlightCopy}>
      <AppText variant="caption" color="action.secondary">ON REPEAT</AppText>
      <AppText variant="navigationLabel" numberOfLines={1}>{title}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={1}>{artist} · {meta}</AppText>
    </View>
    <View style={styles.musicPlayButton}>
      <AppIcon icon={PlayIcon} size="compact" tone="onAccent" />
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  profileHero: {
    width: '100%',
    minHeight: 176,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[16],
    overflow: 'hidden',
    padding: spacing[16],
    borderRadius: radius.media,
    backgroundColor: colors.background.surface,
  },
  profileHeroCopy: {
    minWidth: 1,
    flex: 1,
    gap: spacing[4],
  },
  editProfileButton: {
    alignSelf: 'flex-start',
  },
  friendsSummary: {
    width: '100%',
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[12],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  viewerBody: {
    gap: 10,
  },
  viewerHero: {
    width: '100%',
    minHeight: 260,
    alignItems: 'center',
    gap: spacing[4],
    overflow: 'hidden',
    padding: spacing[24],
    borderRadius: radius.media,
    backgroundColor: colors.background.surface,
  },
  avatarRing: {
    zIndex: 1,
    padding: spacing[4],
    borderWidth: 2,
    borderColor: colors.action.secondary,
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  profileRecord: {
    position: 'absolute',
    right: -spacing[32],
    bottom: -spacing[48],
    width: spacing[120],
    height: spacing[120],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: spacing[12],
    borderColor: colors.background.app,
    borderRadius: radius.full,
    backgroundColor: colors.action.secondary,
    opacity: 0.72,
  },
  profileRecordLabel: {
    width: spacing[40],
    height: spacing[40],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.action.primary,
  },
  profileRecordHole: {
    width: spacing[8],
    height: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.background.app,
  },
  musicSpotlight: {
    width: '100%',
    minHeight: spacing[80],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  musicArtwork: {
    width: spacing[64],
    height: spacing[64],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.small,
    backgroundColor: colors.category.secondary,
  },
  musicRecord: {
    width: spacing[48],
    height: spacing[48],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: spacing[4],
    borderColor: colors.background.app,
    borderRadius: radius.full,
    backgroundColor: colors.action.secondary,
  },
  musicRecordHole: {
    width: spacing[8],
    height: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.action.primary,
  },
  musicSpotlightCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  musicPlayButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.text.primary,
  },
  relation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
  },
  flexButton: {
    flex: 1,
  },
});
