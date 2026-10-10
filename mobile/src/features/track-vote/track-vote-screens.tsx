import { SquareLock01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppIcon,
  AppText,
  Avatar,
  Button,
  DateTimePicker,
  EventCard,
  LicenseBadge,
  LocationPicker,
  SearchField,
  Select,
  TextField,
  TrackRow,
  VisibilityBadge,
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { eventFriends, queuedTracks, suggestedTracks } from '../../mocks/track-vote-examples';
import { colors, radius, spacing } from '../../theme';
import {
  ChoiceCard,
  EventHeader,
  EventScreen,
  RestrictionCard,
  RuleCard,
  SectionRow,
  eventStyles,
} from './track-vote-ui';

export function DiscoverEventsScreen() {
  const router = useRouter();

  return <EventScreen showNavigation testID="discover-events-screen">
    <EventHeader title="Events" action onBack={() => router.back()} onAction={() => router.push('/events/create')} />
    <AppText variant="h2">Vote together.{`\n`}Hear what wins.</AppText>
    <SearchField placeholder="Search events" />
    <SectionRow title="Live now" action="See all" />
    <EventCard
      title="Rooftop Tape Night"
      state="live"
      meta="Tonight · 20:00 · Benguerir"
      attendeeSummary="24 listening · 8 tracks"
      onPress={() => router.push('/events/details')}
      testID="live-event-card"
    />
    <SectionRow title="Coming up" />
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/events/details')}
      style={({ pressed }) => [styles.upcomingCard, pressed && pressedFeedback]}
    >
      <View style={styles.upcomingArtwork} />
      <View style={styles.flexCopy}>
        <AppText variant="navigationLabel">Analog Sundays</AppText>
        <AppText variant="caption" color="text.muted">Sat · 18:00 · 12 going</AppText>
      </View>
      <AppText variant="caption" color="text.muted">PUBLIC</AppText>
    </Pressable>
  </EventScreen>;
}

export function EventDetailsScreen() {
  const router = useRouter();

  return <EventScreen testID="event-details-screen">
    <EventHeader title="Event details" onBack={() => router.back()} />
    <View style={styles.eventHero}>
      <View style={styles.heroCircle} />
      <View style={styles.heroCard} />
      <View style={styles.heroTape} />
    </View>
    <AppText variant="h2">Rooftop Tape Night</AppText>
    <AppText color="text.secondary">A public listening session where guests suggest tracks and vote the queue up in real time.</AppText>
    <InfoLine label="Benguerir · within 250 m" />
    <InfoLine label="Tonight · 20:00–23:00" />
    <InfoLine label="24 participants" />
    <View style={eventStyles.wrap}>
      <VisibilityBadge type="public" />
      <LicenseBadge type="location" />
      <LicenseBadge type="time" />
    </View>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/room')}>Join event</Button>
  </EventScreen>;
}

function CreateEventIntro({ step, title, description }: { step: string; title: string; description: string }) {
  return <>
    <AppText variant="navigationLabel" color="action.primary">{step}</AppText>
    <AppText variant="h2">{title}</AppText>
    <AppText variant="bodySmall" color="text.secondary">{description}</AppText>
  </>;
}

export function CreateEventBasicScreen() {
  const router = useRouter();
  const [name, setName] = useState('Rooftop Tape Night');
  const [description, setDescription] = useState('Late-night listening with friends');

  return <EventScreen testID="create-event-basic-screen">
    <EventHeader title="Create event" onBack={() => router.back()} />
    <CreateEventIntro
      step="Step 1 of 4"
      title="Start with the basics"
      description="Give people enough context to understand what kind of listening session this is."
    />
    <View style={eventStyles.form}>
      <TextField label="Event name" value={name} onChangeText={setName} />
      <TextField label="Short description" value={description} onChangeText={setDescription} />
      <Select label="Event type" value="Track Vote" />
    </View>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/create/visibility')}>Continue</Button>
  </EventScreen>;
}

export function CreateEventVisibilityScreen() {
  const router = useRouter();
  const [visibility, setVisibility] = useState<'Public' | 'Friends' | 'Private'>('Public');

  return <EventScreen testID="create-event-visibility-screen">
    <EventHeader title="Create event" onBack={() => router.back()} />
    <CreateEventIntro
      step="Step 2 of 4"
      title="Who can find it?"
      description="Choose how this event appears to other people. You can still invite friends directly."
    />
    <View accessibilityRole="radiogroup" style={eventStyles.form}>
      <ChoiceCard title="Public" badge="Public" description="Anyone can discover and join." selected={visibility === 'Public'} onPress={() => setVisibility('Public')} />
      <ChoiceCard title="Friends only" badge="Friends" description="Only your friends can find it." selected={visibility === 'Friends'} onPress={() => setVisibility('Friends')} />
      <ChoiceCard title="Private" badge="Private" description="Only invited people can open it." selected={visibility === 'Private'} onPress={() => setVisibility('Private')} />
    </View>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/create/voting-rules')}>Continue</Button>
  </EventScreen>;
}

export function CreateEventVotingRulesScreen() {
  const router = useRouter();
  const [rules, setRules] = useState(() => new Set(['invite', 'location', 'time']));
  const toggle = (rule: string) => setRules((current) => {
    const next = new Set(current);
    if (next.has(rule)) next.delete(rule); else next.add(rule);
    return next;
  });

  return <EventScreen testID="create-event-voting-rules-screen">
    <EventHeader title="Create event" onBack={() => router.back()} />
    <CreateEventIntro
      step="Step 3 of 4"
      title="Set voting rules"
      description="Control who can vote. These checks happen before a vote is accepted."
    />
    <View style={eventStyles.form}>
      <RuleCard title="Invite required" badge="Invite only" description="Only invited participants can vote." selected={rules.has('invite')} onPress={() => toggle('invite')} />
      <RuleCard title="Location check" badge="Location" description="Require voters to be physically near the event." selected={rules.has('location')} onPress={() => toggle('location')} />
      <RuleCard title="Time window" badge="Time window" description="Only allow votes during the configured event time." selected={rules.has('time')} onPress={() => toggle('time')} />
    </View>
    <AppText variant="bodySmall" color="text.secondary">These restrictions are shown explicitly so the permission model stays clear in the prototype.</AppText>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/create/schedule')}>Continue</Button>
  </EventScreen>;
}

export function CreateEventScheduleScreen() {
  const router = useRouter();

  return <EventScreen testID="create-event-schedule-screen">
    <EventHeader title="Create event" onBack={() => router.back()} />
    <CreateEventIntro
      step="Step 4 of 4"
      title="Where and when?"
      description="Finish the event by defining the permitted place and time window."
    />
    <View style={eventStyles.form}>
      <LocationPicker label="Event location" value="Benguerir, Morocco" />
      <DateTimePicker label="Start" value="Oct 18 · 20:00" />
      <DateTimePicker label="End" value="Oct 18 · 23:00" />
      <Select label="Voting radius" value="250 m" />
    </View>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.replace('/events/owner')}>Publish event</Button>
  </EventScreen>;
}

export function ParticipantEventRoomScreen() {
  const router = useRouter();
  const [votes, setVotes] = useState<Set<string>>(() => new Set());
  const vote = (id: string) => setVotes((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return <EventScreen showMiniPlayer showNavigation testID="participant-event-room-screen">
    <EventHeader title="Rooftop Tape Night" action onBack={() => router.back()} />
    <AppText variant="navigationLabel" color="action.primary">● LIVE · 24 listening</AppText>
    <View style={styles.nowPlaying}>
      <View style={styles.nowPlayingArtwork} />
      <View style={styles.flexCopy}>
        <AppText variant="caption" color="action.primary">NOW PLAYING</AppText>
        <AppText variant="navigationLabel">Better Off Alone</AppText>
        <AppText variant="caption" color="text.muted">The Midnight</AppText>
      </View>
    </View>
    <SectionRow title="Vote the queue" action="Suggest track" onAction={() => router.push('/events/suggest')} />
    {queuedTracks.map((track) => <TrackRow
      key={track.id}
      {...track}
      mode="vote"
      voteState={votes.has(track.id) ? 'voted' : 'available'}
      onVotePress={() => vote(track.id)}
      testID={`queue-${track.id}`}
    />)}
  </EventScreen>;
}

export function OwnerEventRoomScreen() {
  const router = useRouter();
  const [ended, setEnded] = useState(false);

  return <EventScreen showMiniPlayer showNavigation testID="owner-event-room-screen">
    <EventHeader title="Rooftop Tape Night" onBack={() => router.back()} />
    <AppText variant="navigationLabel" color="action.primary">LIVE · OWNER MODE</AppText>
    <SectionRow title="Top voted" />
    {queuedTracks.slice(0, 2).map((track) => <TrackRow key={track.id} {...track} mode="vote" />)}
    <SectionRow title="Owner controls" />
    <Button variant="secondary" onPress={() => router.push('/events/invite')}>Invite friends</Button>
    <Button variant="secondary" onPress={() => router.push('/events/suggest')}>Suggest track</Button>
    <Button variant="danger" onPress={() => setEnded(true)}>{ended ? 'Event ended' : 'End event'}</Button>
    <SectionRow title="Rules" />
    <View style={eventStyles.wrap}>
      <LicenseBadge type="invite" />
      <LicenseBadge type="location" />
      <LicenseBadge type="time" />
    </View>
  </EventScreen>;
}

export function InviteFriendsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set(['nada']));
  const visibleFriends = eventFriends.filter((friend) => friend.name.toLowerCase().includes(query.toLowerCase()));
  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return <EventScreen testID="invite-friends-screen">
    <EventHeader title="Invite friends" onBack={() => router.back()} />
    <SearchField placeholder="Search friends" value={query} onChangeText={setQuery} />
    <SectionRow title="Friends" action="Invite selected" />
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
  const [query, setQuery] = useState('midnight');
  const [selected, setSelected] = useState('los-angeles');

  return <EventScreen testID="suggest-track-screen">
    <EventHeader title="Suggest track" onBack={() => router.back()} />
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

type RestrictionKind = 'invite' | 'location' | 'time' | 'permission' | 'not-found';

const restrictions: Record<RestrictionKind, { title: string; description: string; action: string }> = {
  invite: { title: 'Invite required', description: 'You need an invitation from the event owner before you can vote.', action: 'Ask owner for invite' },
  location: { title: 'Outside permitted location', description: 'Move inside the allowed event area to unlock voting.', action: 'Check location' },
  time: { title: 'Outside permitted time', description: "Voting is only available during the event's configured time window.", action: 'View event time' },
  permission: { title: 'Location permission denied', description: 'Allow location access so Music Room can verify that you are at the event.', action: 'Open settings' },
  'not-found': { title: 'Private event not found', description: 'This event may be private, removed, or unavailable to your account.', action: 'Back to events' },
};

function VotingRestrictionScreen({ kind }: { kind: RestrictionKind }) {
  const router = useRouter();
  const restriction = restrictions[kind];

  return <EventScreen testID={`voting-restriction-${kind}-screen`}>
    <EventHeader title="Voting unavailable" onBack={() => router.back()} />
    <AppText variant="navigationLabel" color="action.primary">VOTE RESTRICTED</AppText>
    <RestrictionCard title={restriction.title} description={restriction.description} />
    <View style={styles.restrictionNotice}>
      <AppIcon icon={SquareLock01Icon} size="compact" />
      <AppText variant="bodySmall" color="text.secondary" style={styles.flexCopy}>Your vote was not submitted. The queue stays unchanged.</AppText>
    </View>
    <View style={eventStyles.grow} />
    <View style={eventStyles.buttonStack}>
      <Button onPress={() => kind === 'not-found' ? router.replace('/events') : undefined}>{restriction.action}</Button>
      <Button variant="secondary" onPress={() => router.replace('/events/room')}>Return to event</Button>
    </View>
  </EventScreen>;
}

export function InviteRestrictionScreen() { return <VotingRestrictionScreen kind="invite" />; }
export function LocationRestrictionScreen() { return <VotingRestrictionScreen kind="location" />; }
export function TimeRestrictionScreen() { return <VotingRestrictionScreen kind="time" />; }
export function PermissionRestrictionScreen() { return <VotingRestrictionScreen kind="permission" />; }
export function NotFoundRestrictionScreen() { return <VotingRestrictionScreen kind="not-found" />; }

function InfoLine({ label }: { label: string }) {
  return <View style={styles.infoLine}>
    <View style={styles.infoDot} />
    <AppText color="text.secondary">{label}</AppText>
  </View>;
}

const styles = StyleSheet.create({
  flexCopy: { minWidth: 0, flex: 1, gap: spacing[4] },
  upcomingCard: {
    width: '100%', minHeight: 90, flexDirection: 'row', alignItems: 'center', gap: spacing[12],
    padding: spacing[12], borderWidth: 1, borderColor: colors.border.subtle,
    borderRadius: radius.medium, backgroundColor: colors.background.surface,
  },
  upcomingArtwork: { width: spacing[64], height: spacing[64], borderRadius: radius.small, backgroundColor: colors.category.secondary },
  eventHero: { width: '100%', height: 180, overflow: 'hidden', borderRadius: radius.media, backgroundColor: colors.background.surface },
  heroCircle: { position: 'absolute', left: 20, bottom: 30, width: 88, height: 88, borderRadius: radius.full, backgroundColor: colors.action.secondary },
  heroCard: { position: 'absolute', right: 22, bottom: 24, width: 190, height: 112, borderRadius: radius.medium, backgroundColor: colors.action.primary },
  heroTape: { position: 'absolute', right: 56, top: 24, width: 120, height: 48, backgroundColor: colors.text.primary, transform: [{ rotate: '5deg' }] },
  infoLine: { width: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing[12] },
  infoDot: { width: spacing[12], height: spacing[12], borderRadius: radius.full, borderWidth: 2, borderColor: colors.text.primary },
  nowPlaying: { alignSelf: 'flex-start', minWidth: 208, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.card, backgroundColor: colors.background.surface },
  nowPlayingArtwork: { width: 56, height: 56, borderRadius: radius.small, backgroundColor: colors.action.secondary },
  friendCard: { width: '100%', minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[16], borderRadius: radius.card, backgroundColor: colors.background.surface },
  invitePill: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing[12], borderRadius: radius.full, backgroundColor: colors.background.app },
  invitePillSelected: { backgroundColor: colors.category.secondary },
  trackChoice: { width: '100%', borderWidth: 2, borderColor: 'transparent', borderRadius: radius.medium, overflow: 'hidden' },
  trackChoiceSelected: { borderColor: colors.action.secondary, backgroundColor: colors.background.surface },
  restrictionNotice: { width: '100%', minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
});
