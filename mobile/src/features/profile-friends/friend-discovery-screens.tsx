import { Globe02Icon, UserAdd01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon, AppText, FriendRequestRow, SearchField, UserCard } from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import profileContent from '../../content/profile.json';
import { friends, incomingRequests, recentSearches, searchResults } from '../../mocks/profile-friends-examples';
import { goBackOrReplace } from '../../lib/navigation';
import { profileScreenStyles as styles } from './profile-screen.styles';
import { IconNote, MobileProfileHeader, ProfileFriendsScreen, SectionHeading } from './profile-friends-ui';

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
      {"Search results only expose each user's public profile fields."}
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
