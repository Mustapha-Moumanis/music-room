import { SquareLock01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Modal as NativeModal, Pressable, StyleSheet, View } from 'react-native';

import {
  AppIcon,
  AppText,
  Avatar,
  Button,
  EventCard,
  LicenseBadge,
  SearchField,
  TextField,
  TrackRow,
  VisibilityBadge,
} from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import eventContent from '../../content/events.json';
import { eventFriends, queuedTracks, suggestedTracks } from '../../mocks/track-vote-examples';
import { goBackOrReplace } from '../../lib/navigation';
import { usePlaybackStore } from '../../stores/playback.store';
import { colors, radius, spacing } from '../../theme';
import { EventScheduleFields } from './event-schedule-fields';
import {
  ChoiceCard,
  EventHeader,
  EventScreen,
  RestrictionCard,
  SectionRow,
  eventStyles,
} from './track-vote-ui';

export function DiscoverEventsScreen() {
  const router = useRouter();

  return <EventScreen showNavigation testID="discover-events-screen">
    <EventHeader title="Events" action />
    <AppText variant="h2">Vote together.{`\n`}Hear what wins.</AppText>
    <Button variant="accent" onPress={() => router.push('/events/create')}>Add event</Button>
    <SearchField placeholder="Search events" />
    <SectionRow title="Live now" />
    <EventCard
      title={eventContent.discovery.live.title}
      state="live"
      meta={eventContent.discovery.live.meta}
      attendeeSummary={eventContent.discovery.live.attendeeSummary}
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
        <AppText variant="navigationLabel">{eventContent.discovery.upcoming.title}</AppText>
        <AppText variant="caption" color="text.muted">{eventContent.discovery.upcoming.meta}</AppText>
      </View>
      <AppText variant="caption" color="text.muted">{eventContent.discovery.upcoming.visibility}</AppText>
    </Pressable>
  </EventScreen>;
}

export function EventDetailsScreen() {
  const router = useRouter();

  return <EventScreen testID="event-details-screen">
    <EventHeader title="Event details" onBack={() => goBackOrReplace(router, '/events')} />
    <View style={styles.eventHero}>
      <View style={styles.heroCircle} />
      <View style={styles.heroCard} />
      <View style={styles.heroTape} />
    </View>
    <AppText variant="h2">{eventContent.details.title}</AppText>
    <AppText color="text.secondary">{eventContent.details.description}</AppText>
    {eventContent.details.information.map((label) => <InfoLine key={label} label={label} />)}
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
  const [name, setName] = useState(eventContent.create.defaults.name);
  const [description, setDescription] = useState(eventContent.create.defaults.description);

  return <EventScreen testID="create-event-basic-screen">
    <EventHeader title="Create event" onBack={() => goBackOrReplace(router, '/events')} />
    <CreateEventIntro {...eventContent.create.steps[0]} />
    <View style={eventStyles.form}>
      <TextField label="Event name" value={name} onChangeText={setName} />
      <TextField label="Short description" value={description} onChangeText={setDescription} />
      <View style={styles.eventType}>
        <View style={styles.flexCopy}><AppText variant="navigationLabel">Track Vote</AppText><AppText variant="caption" color="text.muted">Participants suggest tracks and vote the queue.</AppText></View>
        <AppText variant="caption" color="action.secondary">EVENT TYPE</AppText>
      </View>
    </View>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/create/visibility')}>Continue</Button>
  </EventScreen>;
}

export function CreateEventVisibilityScreen() {
  const router = useRouter();
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');

  return <EventScreen testID="create-event-visibility-screen">
    <EventHeader title="Create event" onBack={() => goBackOrReplace(router, '/events/create')} />
    <CreateEventIntro {...eventContent.create.steps[1]} />
    <View accessibilityRole="radiogroup" style={eventStyles.form}>
      {eventContent.create.visibilityOptions.map((option) => <ChoiceCard key={option.value} {...option} selected={visibility === option.value} onPress={() => setVisibility(option.value as 'Public' | 'Private')} />)}
    </View>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/create/voting-rules')}>Continue</Button>
  </EventScreen>;
}

export function CreateEventVotingRulesScreen() {
  const router = useRouter();
  const [rule, setRule] = useState<'everyone' | 'invite' | 'place-time'>('place-time');

  return <EventScreen testID="create-event-voting-rules-screen">
    <EventHeader title="Create event" onBack={() => goBackOrReplace(router, '/events/create/visibility')} />
    <CreateEventIntro {...eventContent.create.steps[2]} />
    <View accessibilityRole="radiogroup" style={eventStyles.form}>
      {eventContent.create.votingRuleOptions.map((option) => <ChoiceCard key={option.value} {...option} selected={rule === option.value} onPress={() => setRule(option.value as 'everyone' | 'invite' | 'place-time')} />)}
    </View>
    <AppText variant="bodySmall" color="text.secondary">These restrictions are shown explicitly so the permission model stays clear in the prototype.</AppText>
    <View style={eventStyles.grow} />
    <Button onPress={() => router.push('/events/create/schedule')}>Continue</Button>
  </EventScreen>;
}

export function CreateEventScheduleScreen() {
  const router = useRouter();

  return <EventScreen testID="create-event-schedule-screen">
    <EventHeader title="Create event" onBack={() => goBackOrReplace(router, '/events/create/voting-rules')} />
    <CreateEventIntro {...eventContent.create.steps[3]} />
    <EventScheduleFields />
    <View style={eventStyles.grow} />
    <Button onPress={() => router.replace('/events/owner')}>Publish event</Button>
  </EventScreen>;
}

export function ParticipantEventRoomScreen() {
  const router = useRouter();
  const startPlayback = usePlaybackStore((state) => state.start);
  const [votes, setVotes] = useState<Set<string>>(() => new Set());
  const vote = (id: string) => {
    animateNextLayout();
    setVotes((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const baseVotes = eventContent.baseVotes as Record<string, number>;
  const rankedTracks = [...queuedTracks].sort((a, b) => (baseVotes[b.id] + Number(votes.has(b.id))) - (baseVotes[a.id] + Number(votes.has(a.id))));

  return <EventScreen showMiniPlayer showNavigation testID="participant-event-room-screen">
    <EventHeader title={eventContent.details.title} action onBack={() => goBackOrReplace(router, '/events/details')} />
    <AppText variant="navigationLabel" color="action.primary">● LIVE · 24 listening</AppText>
    <Pressable
      accessibilityLabel={`Open ${eventContent.nowPlaying.title} in Now Playing`}
      accessibilityRole="button"
      onPress={() => {
        startPlayback();
        router.push('/player');
      }}
      style={({ pressed }) => [styles.nowPlaying, pressed && pressedFeedback]}
    >
      <View style={styles.nowPlayingArtwork} />
      <View style={styles.flexCopy}>
        <AppText variant="caption" color="action.primary">NOW PLAYING</AppText>
        <AppText variant="navigationLabel">{eventContent.nowPlaying.title}</AppText>
        <AppText variant="caption" color="text.muted">{eventContent.nowPlaying.artist}</AppText>
      </View>
    </Pressable>
    <SectionRow title="Vote the queue" action="Suggest track" onAction={() => router.push('/events/suggest')} />
    {rankedTracks.map((track, index) => <TrackRow
      key={track.id}
      {...track}
      compactVote
      mode="vote"
      rank={index + 1}
      voteCount={baseVotes[track.id] + Number(votes.has(track.id))}
      voteState={votes.has(track.id) ? 'voted' : 'available'}
      onVotePress={() => vote(track.id)}
      testID={`queue-${track.id}`}
    />)}
  </EventScreen>;
}

export function OwnerEventRoomScreen() {
  const router = useRouter();
  const [ended, setEnded] = useState(false);
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const voteCounts = eventContent.baseVotes as Record<string, number>;

  return <EventScreen showMiniPlayer showNavigation testID="owner-event-room-screen">
    <EventHeader title={eventContent.details.title} onBack={() => goBackOrReplace(router, '/events')} />
    <AppText variant="navigationLabel" color="action.primary">LIVE · OWNER MODE</AppText>
    <SectionRow title="Top voted" />
    {queuedTracks.map((track, index) => <TrackRow key={track.id} {...track} rank={index + 1} voteCount={voteCounts[track.id]} />)}
    <SectionRow title="Owner controls" />
    <View style={styles.ownerControls}>
      <Button size="small" style={styles.flexButton} variant="secondary" onPress={() => router.push('/events/invite')}>Invite</Button>
      <Button size="small" style={styles.flexButton} variant="secondary" onPress={() => router.push('/events/suggest')}>Suggest track</Button>
    </View>
    <SectionRow title="Rules" />
    <View style={eventStyles.wrap}>
      <LicenseBadge type="location" />
      <LicenseBadge type="time" />
    </View>
    <View style={eventStyles.grow} />
    <Button disabled={ended} variant="danger" onPress={() => setConfirmingEnd(true)}>{ended ? 'Event ended' : 'End event'}</Button>
    <NativeModal animationType="fade" transparent visible={confirmingEnd} onRequestClose={() => setConfirmingEnd(false)}>
      <Pressable accessibilityLabel="Close confirmation" accessibilityRole="button" style={styles.modalBackdrop} onPress={() => setConfirmingEnd(false)}>
        <Pressable accessibilityRole="none" style={styles.confirmDialog} onPress={(event) => event.stopPropagation()}>
          <AppText variant="h4">End this event?</AppText>
          <AppText color="text.secondary">Voting will close for everyone. This cannot be undone.</AppText>
          <View style={styles.confirmActions}>
            <Button style={styles.flexButton} variant="secondary" onPress={() => setConfirmingEnd(false)}>Cancel</Button>
            <Button style={styles.flexButton} variant="danger" onPress={() => { setEnded(true); setConfirmingEnd(false); }}>End event</Button>
          </View>
        </Pressable>
      </Pressable>
    </NativeModal>
  </EventScreen>;
}

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

type RestrictionKind = 'invite' | 'location' | 'time' | 'permission' | 'not-found';

const restrictions = eventContent.restrictions as Record<RestrictionKind, { title: string; description: string; action: string }>;

function VotingRestrictionScreen({ kind }: { kind: RestrictionKind }) {
  const router = useRouter();
  const restriction = restrictions[kind];
  const resolveRestriction = () => {
    if (kind === 'permission') void Linking.openSettings();
    else if (kind === 'not-found') router.replace('/events');
    else router.replace('/events/details');
  };

  return <EventScreen testID={`voting-restriction-${kind}-screen`}>
    <EventHeader title="Voting unavailable" onBack={() => goBackOrReplace(router, '/events/details')} />
    <AppText variant="navigationLabel" color="action.primary">VOTE RESTRICTED</AppText>
    <RestrictionCard title={restriction.title} description={restriction.description} />
    <View style={styles.restrictionNotice}>
      <AppIcon icon={SquareLock01Icon} size="compact" />
      <AppText variant="bodySmall" color="text.secondary" style={styles.flexCopy}>Your vote was not submitted. The queue stays unchanged.</AppText>
    </View>
    <View style={eventStyles.grow} />
    <View style={eventStyles.buttonStack}>
      <Button onPress={resolveRestriction}>{restriction.action}</Button>
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
  flexButton: { flex: 1 },
  eventType: { width: '100%', minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[16], borderRadius: radius.medium, backgroundColor: colors.background.surface },
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
  ownerControls: { width: '100%', flexDirection: 'row', gap: spacing[8] },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: spacing[24], backgroundColor: 'rgba(0, 0, 0, 0.68)' },
  confirmDialog: { width: '100%', maxWidth: 382, alignSelf: 'center', gap: spacing[16], padding: spacing[24], borderRadius: radius.card, backgroundColor: colors.background.surface },
  confirmActions: { width: '100%', flexDirection: 'row', gap: spacing[8] },
  friendCard: { width: '100%', minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[16], borderRadius: radius.card, backgroundColor: colors.background.surface },
  invitePill: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing[12], borderRadius: radius.full, backgroundColor: colors.background.app },
  invitePillSelected: { backgroundColor: colors.category.secondary },
  trackChoice: { width: '100%', borderWidth: 2, borderColor: 'transparent', borderRadius: radius.medium, overflow: 'hidden' },
  trackChoiceSelected: { borderColor: colors.action.secondary, backgroundColor: colors.background.surface },
  restrictionNotice: { width: '100%', minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
});
