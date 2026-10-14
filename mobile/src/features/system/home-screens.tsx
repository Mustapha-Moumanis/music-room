import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, HeaderOverflowMenu, TrackRow } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import systemContent from '../../content/system.json';
import { usePlaybackStore } from '../../stores/playback.store';
import { colors } from '../../theme';
import { SectionRow } from '../track-vote/track-vote-ui';
import { SystemHeader, SystemScreen } from './system-layout';
import { systemScreenStyles as styles } from './system-screen.styles';

export function HomeScreen() {
  const router = useRouter();
  const startPlayback = usePlaybackStore((state) => state.start);
  const openDailyMix = () => {
    startPlayback();
    router.push('/player');
  };
  return <SystemScreen miniPlayer showContinuationCue={false} testID="home-screen">
    <View style={styles.greeting}>
      <AppText variant="h4" color="action.primary">{systemContent.home.greeting}</AppText>
      <HeaderOverflowMenu />
    </View>
    <AppText variant="h2">{systemContent.home.headline}</AppText>
    <SectionRow title="Made for you" action="See all" onAction={() => router.push('/playlists')} />
    <Pressable accessibilityRole="button" onPress={openDailyMix} style={({ pressed }) => [styles.dailyMix, pressed && pressedFeedback]}><AppText variant="caption">{systemContent.home.dailyMix.eyebrow}</AppText><AppText variant="h4">{systemContent.home.dailyMix.title}</AppText><AppText variant="bodySmall" color="text.secondary">{systemContent.home.dailyMix.description}</AppText></Pressable>
    <SectionRow title="Recently played" />
    <View style={styles.mediaRow}>
      {systemContent.home.recentlyPlayed.map((item) => <MediaCard
        key={item.title}
        {...item}
        tone={item.tone as 'coral' | 'teal'}
        onPress={() => router.push(item.target === 'details' ? '/playlists/details' : '/playlists/read-only')}
      />)}
    </View>
  </SystemScreen>;
}

export function MiniPlayerDemoScreen() {
  const router = useRouter();
  const startPlayback = usePlaybackStore((state) => state.start);
  const openPlayer = () => {
    startPlayback();
    router.push('/player');
  };
  return <SystemScreen active="playlists" miniPlayer testID="mini-player-demo-screen">
    <SystemHeader title="Mini player" />
    <AppText variant="bodySmall" color="text.secondary">The mini player stays available while you browse. Tap the track area to expand Now Playing.</AppText>
    <SectionRow title="Queue preview" />
    {systemContent.queuePreview.map((track) => <Pressable key={track.title} accessibilityLabel={`Play ${track.title}`} accessibilityRole="button" onPress={openPlayer} style={({ pressed }) => pressed && pressedFeedback}><TrackRow {...track} mode="playing" /></Pressable>)}
  </SystemScreen>;
}

export function MediaCard({ meta, onPress, title, tone }: { meta: string; onPress: () => void; title: string; tone: 'coral' | 'teal' }) { return <Pressable accessibilityLabel={`Open ${title}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.mediaCard, pressed && pressedFeedback]}><View style={[styles.mediaArtwork, { backgroundColor: tone === 'coral' ? colors.action.primary : colors.action.secondary }]} /><AppText variant="bodySmall">{title}</AppText><AppText variant="caption" color="text.muted">{meta}</AppText></Pressable>; }
