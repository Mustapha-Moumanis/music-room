import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal as NativeModal, Pressable, View } from 'react-native';

import { AppText, Button, LicenseBadge, TrackRow } from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import eventContent from '../../content/events.json';
import { goBackOrReplace } from '../../lib/navigation';
import { queuedTracks } from '../../mocks/track-vote-examples';
import { usePlaybackStore } from '../../stores/playback.store';
import { eventScreenStyles as styles } from './track-vote-screen.styles';
import { EventHeader, EventScreen, SectionRow, eventStyles } from './track-vote-ui';

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
