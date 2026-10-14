import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Avatar, Button, SearchField, TrackRow } from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import eventContent from '../../content/events.json';
import { goBackOrReplace } from '../../lib/navigation';
import { eventFriends, suggestedTracks } from '../../mocks/track-vote-examples';
import { eventScreenStyles as styles } from './track-vote-screen.styles';
import { EventHeader, EventScreen, SectionRow, eventStyles } from './track-vote-ui';

export function InviteFriendsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set(eventContent.inviteDefaultIds));
  const visibleFriends = eventFriends.filter((friend) => friend.name.toLowerCase().includes(query.toLowerCase()));
  const toggle = (id: string) => {
    animateNextLayout();
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return <EventScreen testID="invite-friends-screen">
    <EventHeader title="Invite friends" onBack={() => goBackOrReplace(router, '/events/owner')} />
    <SearchField placeholder="Search friends" value={query} onChangeText={setQuery} />
    <SectionRow title="Friends" />
    {visibleFriends.map((friend) => {
      const isSelected = selected.has(friend.id);
      return <View key={friend.id} style={styles.friendCard}>
        <Avatar initials={friend.initials} size="card" />
        <View style={styles.flexCopy}>
          <AppText variant="navigationLabel">{friend.name}</AppText>
          <AppText variant="caption" color="text.muted">Friend · available tonight</AppText>
        </View>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
          onPress={() => toggle(friend.id)}
          style={({ pressed }) => [styles.invitePill, isSelected && styles.invitePillSelected, pressed && pressedFeedback]}
        >
          <AppText variant="caption">{isSelected ? 'Selected' : 'Invite'}</AppText>
        </Pressable>
      </View>;
    })}
    <View style={eventStyles.grow} />
    <Button disabled={selected.size === 0} onPress={() => router.replace('/events/owner')}>Send invitations</Button>
  </EventScreen>;
}

export function SuggestTrackScreen() {
  const router = useRouter();
  const [query, setQuery] = useState(eventContent.suggestionDefaults.query);
  const [selected, setSelected] = useState(eventContent.suggestionDefaults.selectedId);

  return <EventScreen testID="suggest-track-screen">
    <EventHeader title="Suggest track" onBack={() => goBackOrReplace(router, '/events/room')} />
    <SearchField value={query} onChangeText={setQuery} />
    <SectionRow title="Results" />
    {suggestedTracks.map((track) => <Pressable
      key={track.id}
      accessibilityRole="radio"
      accessibilityState={{ selected: selected === track.id }}
      onPress={() => setSelected(track.id)}
      style={({ pressed }) => [styles.trackChoice, selected === track.id && styles.trackChoiceSelected, pressed && pressedFeedback]}
    >
      <TrackRow {...track} />
    </Pressable>)}
    <View style={eventStyles.grow} />
    <Button onPress={() => router.replace('/events/room')}>Suggest this track</Button>
  </EventScreen>;
}
