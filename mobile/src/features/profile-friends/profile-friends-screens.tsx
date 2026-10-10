import {
  Globe02Icon,
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
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import {
  friends,
  incomingRequests,
  profilePreferences,
  recentSearches,
  searchResults,
} from '../../mocks/profile-friends-examples';
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

  return <ProfileFriendsScreen active="profile" showMiniPlayer testID="my-profile-screen">
    <MobileProfileHeader
      title="My profile"
      action
      onBack={() => router.back()}
      onAction={() => router.push('/settings')}
    />
    <View style={styles.profileHero}>
      <Avatar initials="SH" size="large" />
      <View style={styles.profileHeroCopy}>
        <AppText variant="h4">Souad Hilal</AppText>
        <AppText variant="bodySmall" color="text.muted">@souad</AppText>
        <AppText variant="caption" color="text.secondary">Frontend dev, night-drive playlists, and too much synth.</AppText>
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
    <ProfileStats />
    <SectionHeading title="About" />
    <ProfileInformationRow label="Location" value="Benguerir, Morocco" />
    <ProfileInformationRow label="Favorite artist" value="The Midnight" />
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
    <MobileProfileHeader title="Friends" action onBack={() => router.back()} />
    <Pressable
      accessibilityLabel="Find people"
      accessibilityRole="button"
      onPress={() => router.push('/friends/search')}
      style={({ pressed }) => [styles.friendsSummary, pressed && pressedFeedback]}
    >
      <View>
        <AppText variant="h5">42 friends</AppText>
        <AppText variant="caption" color="text.muted">3 active in Music Room</AppText>
      </View>
      <AppIcon icon={UserAdd01Icon} size="standard" />
    </Pressable>
    <SearchField placeholder="Search friends" onSubmitEditing={() => router.push('/friends/search')} />
    <SectionHeading title="Your friends" action="Requests 2" onAction={() => router.push('/friends/requests')} />
    {friends.map((friend) => <UserCard key={friend.name} {...friend} relation="friend" />)}
  </ProfileFriendsScreen>;
}

export function UserSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<Set<string>>(() => new Set());

  const add = (name: string) => setAdded((current) => new Set(current).add(name));

  return <ProfileFriendsScreen active="friends" testID="user-search-screen">
    <MobileProfileHeader title="Find people" onBack={() => router.back()} />
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
    />)}
  </ProfileFriendsScreen>;
}

export function SearchResultsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('yassine');
  const [added, setAdded] = useState<Set<string>>(() => new Set());

  return <ProfileFriendsScreen active="friends" testID="search-results-screen">
    <MobileProfileHeader title="Search results" onBack={() => router.back()} />
    <SearchField value={query} onChangeText={setQuery} />
    <SectionHeading title="People" action="3 results" />
    {searchResults.map((person) => {
      const relation = person.relation === 'friend' || added.has(person.name) ? 'friend' : 'stranger';
      return <UserCard
        key={person.name}
        {...person}
        relation={relation}
        actionLabel={relation === 'friend' ? 'Friend' : 'Add friend'}
        onActionPress={() => setAdded((current) => new Set(current).add(person.name))}
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

  return <ProfileFriendsScreen active="friends" testID="friend-requests-screen">
    <MobileProfileHeader title="Friend requests" onBack={() => router.back()} />
    <AppText variant="bodySmall" color="text.secondary">Accepting a request unlocks fields that each person chose to share with friends.</AppText>
    <SectionHeading title="Incoming" action={String(incomingRequests.filter((request) => !resolved[request.name]).length)} />
    {incomingRequests.filter((request) => !resolved[request.name]).map((request) => <FriendRequestRow
      key={request.name}
      {...request}
      onAccept={() => setResolved((current) => ({ ...current, [request.name]: 'accepted' }))}
      onDecline={() => setResolved((current) => ({ ...current, [request.name]: 'declined' }))}
    />)}
    <SectionHeading title="Recently accepted" />
    <FriendRequestRow initials="NA" name="Nada Amrani" summary="Now friends" state="accepted" />
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
  const [relation, setRelation] = useState(friend ? 'friend' : 'stranger');
  const isFriend = relation === 'friend';
  const name = friend ? 'Nada Amrani' : 'Yassine El Mansouri';

  return <ProfileFriendsScreen
    active="friends"
    bodyStyle={styles.viewerBody}
    testID={friend ? 'friend-profile-screen' : 'stranger-profile-screen'}
  >
    <MobileProfileHeader title="Profile" action onBack={() => router.back()} />
    <View style={styles.viewerHero}>
      <Avatar initials="SH" size="large" />
      <AppText variant="h3" style={profileFriendsStyles.centered}>{name}</AppText>
      <AppText variant="bodySmall" color="text.muted">{friend ? '@nada' : '@yassine'}</AppText>
      <AppText variant="bodySmall" color="text.secondary" style={profileFriendsStyles.centered}>
        {friend ? 'Soul, house, and collaborative chaos.' : 'Film photos, synths, and long playlists.'}
      </AppText>
      <View style={styles.relation}>
        <AppIcon icon={isFriend ? UserGroupIcon : UserAdd01Icon} size="compact" />
        <AppText variant="caption" color={isFriend ? 'action.secondary' : 'text.muted'}>{isFriend ? 'Friend' : 'Not friends yet'}</AppText>
      </View>
    </View>
    {isFriend ? <View style={profileFriendsStyles.actionRow}>
      <Button variant="secondary" style={styles.flexButton} onPress={() => undefined}>Open playlist</Button>
      <Button style={styles.flexButton} onPress={() => setRelation('stranger')}>Friends</Button>
    </View> : <Button onPress={() => setRelation('friend')}>Add friend</Button>}
    <SectionHeading title="Public information" />
    <ProfileInformationRow compact label="Location" value={friend ? 'Marrakesh, Morocco' : 'Casablanca, Morocco'} />
    <ProfileInformationRow compact label="Favorite artist" value={friend ? 'Sade' : 'Tame Impala'} />
    <SectionHeading title="Friends-only information" />
    <ProfileInformationRow compact hidden={!isFriend} label="Instagram" value={isFriend && friend ? '@nada.music' : 'Hidden'} />
    <ProfileInformationRow compact hidden={!isFriend} label="Listening activity" value={isFriend && friend ? 'Friends Tape · active now' : 'Hidden'} />
    <SectionHeading title="Private information" />
    <ProfileInformationRow compact hidden label="Email" value="Hidden" />
  </ProfileFriendsScreen>;
}

export function StrangerProfileScreen() {
  return <ViewerProfile friend={false} />;
}

export function FriendProfileScreen() {
  return <ViewerProfile friend />;
}

const styles = StyleSheet.create({
  profileHero: {
    width: '100%',
    minHeight: 160,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[16],
    padding: spacing[16],
    borderRadius: radius.card,
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
    alignItems: 'center',
    gap: 5,
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
