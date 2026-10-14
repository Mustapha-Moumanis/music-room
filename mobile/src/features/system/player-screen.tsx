import { ArrowDown01Icon, HeartIcon, NextIcon, PauseIcon, PlayIcon, Playlist01Icon, PreviousIcon, Queue01Icon, RepeatIcon, ShuffleIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon, AppText, HeaderOverflowMenu, TrackRow } from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import systemContent from '../../content/system.json';
import { queuedTracks } from '../../mocks/track-vote-examples';
import { goBackOrReplace } from '../../lib/navigation';
import { usePlaybackStore } from '../../stores/playback.store';
import { spacing } from '../../theme';
import { SectionRow } from '../track-vote/track-vote-ui';
import { SystemScreen } from './system-layout';
import { systemScreenStyles as styles } from './system-screen.styles';

export function FullPlayerScreen() {
  const router = useRouter();
  const playing = usePlaybackStore((state) => state.playing);
  const startPlayback = usePlaybackStore((state) => state.start);
  const togglePlayback = usePlaybackStore((state) => state.toggle);
  const [favorite, setFavorite] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const tracks = [systemContent.currentTrack, ...queuedTracks];
  const [trackIndex, setTrackIndex] = useState(0);
  const currentTrack = tracks[trackIndex];
  useEffect(() => {
    startPlayback();
  }, [startPlayback]);
  const changeTrack = (direction: -1 | 1) => setTrackIndex((current) => (current + direction + tracks.length) % tracks.length);
  const toggleQueue = () => {
    animateNextLayout();
    setQueueOpen((value) => !value);
  };
  const closePlayer = () => {
    goBackOrReplace(router, '/home');
  };
  return <SystemScreen bodyStyle={styles.playerBody} navigation={false} testID="full-player-screen">
    <View style={styles.playerTop}>
      <Pressable
        accessibilityLabel="Close player"
        accessibilityRole="button"
        hitSlop={spacing[8]}
        onPress={closePlayer}
        style={({ pressed }) => [styles.playerHeaderAction, pressed && pressedFeedback]}
      >
        <AppIcon icon={ArrowDown01Icon} size="standard" />
      </Pressable>
      <AppText variant="navigationLabel">Now Playing</AppText>
      <HeaderOverflowMenu />
    </View>
    <View style={styles.albumArtworkArea}><View style={styles.albumArtwork} /></View>
    <View style={styles.playerDetails}>
      <AppText variant="h2">{currentTrack.title}</AppText>
      <AppText variant="h4" color="text.secondary">{currentTrack.artist}</AppText>
      <View accessibilityLabel="Playback progress, 1 minute 42 seconds of 3 minutes 56 seconds" accessibilityRole="progressbar" style={styles.progress}><View style={styles.elapsed} /></View>
      <View style={styles.times}><AppText variant="caption" color="text.muted">1:42</AppText><AppText variant="caption" color="text.muted">{currentTrack.duration}</AppText></View>
    </View>
    <View style={styles.playerControls}>
      <TransportAction active={shuffle} icon={ShuffleIcon} label="Shuffle" onPress={() => setShuffle((value) => !value)} />
      <TransportAction icon={PreviousIcon} label="Previous track" onPress={() => changeTrack(-1)} />
      <Pressable accessibilityLabel={playing ? 'Pause' : 'Play'} accessibilityRole="button" onPress={togglePlayback} style={({ pressed }) => [styles.playButton, pressed && pressedFeedback]}><AppIcon icon={playing ? PauseIcon : PlayIcon} size="standard" tone="onAccent" /></Pressable>
      <TransportAction icon={NextIcon} label="Next track" onPress={() => changeTrack(1)} />
      <TransportAction active={repeat} icon={RepeatIcon} label="Repeat" onPress={() => setRepeat((value) => !value)} />
    </View>
    <View style={styles.secondaryControls}>
      <PlayerAction active={favorite} icon={HeartIcon} label={favorite ? 'Favorited' : 'Favorite'} onPress={() => setFavorite((value) => !value)} />
      <PlayerAction active={queueOpen} icon={Queue01Icon} label={queueOpen ? 'Hide queue' : 'Queue'} onPress={toggleQueue} />
      <PlayerAction icon={Playlist01Icon} label="Playlist" onPress={() => router.push('/playlists/details')} />
    </View>
    {queueOpen ? <><SectionRow title="Up next" />{tracks.map((track, index) => <Pressable key={track.id} accessibilityRole="button" onPress={() => setTrackIndex(index)} style={({ pressed }) => pressed && pressedFeedback}><TrackRow {...track} mode={index === trackIndex ? 'playing' : 'default'} /></Pressable>)}</> : null}
  </SystemScreen>;
}

function PlayerAction({ active = false, icon, label, onPress }: { active?: boolean; icon: Parameters<typeof AppIcon>[0]['icon']; label: string; onPress?: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.playerAction, pressed && pressedFeedback]}><AppIcon icon={icon} size="compact" tone={active ? 'secondary' : 'muted'} /><AppText variant="caption" color={active ? 'action.secondary' : 'text.muted'}>{label}</AppText></Pressable>; }
function TransportAction({ active = false, icon, label, onPress }: { active?: boolean; icon: Parameters<typeof AppIcon>[0]['icon']; label: string; onPress: () => void }) { return <Pressable accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.transportAction, pressed && pressedFeedback]}><AppIcon icon={icon} size="standard" tone={active ? 'secondary' : 'default'} /></Pressable>; }
