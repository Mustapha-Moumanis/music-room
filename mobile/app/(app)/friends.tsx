import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';

import { friendKeys, listFriendRequests, listFriends } from '../../src/api/friends';
import { RelationshipAction } from '../../src/components/relationship-action';
import { Action, colors, ErrorText, Screen, styles } from '../../src/components/ui';
import { UserRow } from '../../src/components/user-row';

export default function FriendsScreen() {
  const friends = useQuery({ queryKey: friendKeys.list, queryFn: listFriends });
  const requests = useQuery({ queryKey: friendKeys.requests, queryFn: listFriendRequests });
  const refreshing = friends.isRefetching || requests.isRefetching;
  const refresh = () => { void friends.refetch(); void requests.refetch(); };
  const incoming = requests.data?.incoming ?? [];
  const outgoing = requests.data?.outgoing ?? [];

  return <Screen refreshing={refreshing} onRefresh={refresh}>
    <Text style={styles.eyebrow}>FRIENDS</Text>
    <Text style={styles.title}>Friends</Text>
    <Action title="Find people" secondary onPress={() => router.push('/(app)/people')} />

    {requests.isError ? <ErrorText>Could not load friend requests. {requests.error.message}</ErrorText> : null}
    {incoming.length > 0 ? <Text accessibilityRole="header" style={styles.heading}>Requests ({incoming.length})</Text> : null}
    {incoming.map(({ user }) => <UserRow key={user.id} user={user} subtitle="Wants to be your friend"
      action={<RelationshipAction compact userId={user.id} name={user.displayName} relationship="REQUEST_RECEIVED" />} />)}

    {outgoing.length > 0 ? <Text accessibilityRole="header" style={styles.heading}>Sent</Text> : null}
    {outgoing.map(({ user }) => <UserRow key={user.id} user={user} subtitle="Waiting for an answer"
      action={<RelationshipAction compact userId={user.id} name={user.displayName} relationship="REQUEST_SENT" />} />)}

    <Text accessibilityRole="header" style={styles.heading}>Your friends{friends.data ? ` (${friends.data.length})` : ''}</Text>
    {friends.isPending ? <ActivityIndicator color={colors.accent} /> : null}
    {friends.isError ? <ErrorText>Could not load your friends. {friends.error.message}</ErrorText> : null}
    {friends.data?.length === 0 ? <Text style={styles.body}>No friends yet. Find people and send them a request.</Text> : null}
    {friends.data?.map((friend) => <UserRow key={friend.id} user={friend}
      subtitle={`Friends since ${new Date(friend.since).toLocaleDateString()}`} />)}
  </Screen>;
}
