import {
  ArrowDown01Icon,
  ArrowLeft02Icon,
  HeartIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  Playlist01Icon,
  PreviousIcon,
  Queue01Icon,
  RepeatIcon,
  ShuffleIcon,
} from '@hugeicons/core-free-icons';
import { useRouter, type Href } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppIcon,
  AppText,
  Avatar,
  BottomNavigation,
  Button,
  EmptyState,
  ErrorState,
  HeaderOverflowMenu,
  ScrollSurface,
  SkeletonLoader,
  Toast,
  TrackRow,
  type MobileNavigationDestination,
} from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import systemContent from '../../content/system.json';
import { queuedTracks } from '../../mocks/track-vote-examples';
import { goBackOrReplace } from '../../lib/navigation';
import { usePlaybackStore } from '../../stores/playback.store';
import { colors, radius, spacing } from '../../theme';
import { PlaybackMiniPlayer } from '../playback/playback-mini-player';
import { SectionRow } from '../track-vote/track-vote-ui';

function SystemScreen({ active = 'home', bodyStyle, children, miniPlayer = false, navigation = true, showContinuationCue = true, testID }: PropsWithChildren<{
  active?: MobileNavigationDestination;
  bodyStyle?: StyleProp<ViewStyle>;
  miniPlayer?: boolean;
  navigation?: boolean;
  showContinuationCue?: boolean;
  testID: string;
}>) {
  const router = useRouter();
  const navigate = (destination: MobileNavigationDestination) => {
    if (destination === 'home') router.replace('/home');
    if (destination === 'events') router.replace('/events');
    if (destination === 'playlists') router.replace('/playlists');
    if (destination === 'friends') router.replace('/friends');
    if (destination === 'profile') router.replace('/profile');
  };
  return <SafeAreaView style={styles.safeArea} testID={testID}>
      <View style={styles.phoneFrame}>
      <ScrollSurface
        style={styles.scroll}
        contentContainerStyle={[styles.body, bodyStyle]}
        continuationTestID={`${testID}-scroll-cue`}
        showContinuationCue={showContinuationCue}
      >
        {children}
      </ScrollSurface>
    {miniPlayer ? <PlaybackMiniPlayer /> : null}
      {navigation ? <BottomNavigation active={active} onNavigate={navigate} /> : null}
    </View>
  </SafeAreaView>;
}

function SystemHeader({ title }: { title: string }) {
  const router = useRouter();
  return <View style={styles.header}><View style={styles.headerLeft}><Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => goBackOrReplace(router, '/home')} style={({ pressed }) => [styles.iconButton, pressed && pressedFeedback]}><AppIcon icon={ArrowLeft02Icon} size="standard" /></Pressable><AppText variant="h4" color="action.primary">{title}</AppText></View><Pressable accessibilityLabel="Open profile" accessibilityRole="button" onPress={() => router.push('/profile')} style={({ pressed }) => [styles.avatarButton, pressed && pressedFeedback]}><Avatar initials="SH" size="header" /></Pressable></View>;
}

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

export function NotificationsScreen() {
  const router = useRouter();
  const [read, setRead] = useState<Set<number>>(() => new Set([2]));
  return <SystemScreen testID="notifications-screen"><SystemHeader title="Notifications" />
    {systemContent.notifications.map(({ route, time, title }, index) => <Pressable key={title} accessibilityRole="button" onPress={() => { setRead((current) => new Set(current).add(index)); router.push(route as Href); }} style={({ pressed }) => [styles.notification, !read.has(index) && styles.unreadNotification, pressed && pressedFeedback]}><View style={[styles.notificationDot, read.has(index) && styles.readDot]} /><View style={styles.flexCopy}><AppText variant="bodySmall">{title}</AppText><AppText variant="caption" color="text.muted">{time}</AppText></View></Pressable>)}
    <SectionRow title="Toast examples" />{systemContent.toasts.map((toast) => <Toast key={toast.message} message={toast.message} tone={toast.tone as 'success' | 'info' | 'error'} />)}
  </SystemScreen>;
}

export function EmptyStatesScreen() {
  const router = useRouter();
  const [empty, noResults] = systemContent.emptyStates;
  return <SystemScreen active="playlists" testID="empty-states-screen"><SystemHeader title="Empty states" /><SectionRow title="No playlists" /><EmptyState {...empty} type="default" onAction={() => router.push('/playlists')} /><SectionRow title="Search" /><EmptyState {...noResults} type="noResults" /></SystemScreen>;
}

export function LoadingStatesScreen() {
  return <SystemScreen testID="loading-states-screen"><SystemHeader title="Loading" /><SectionRow title="Card loading" /><SkeletonLoader /><SectionRow title="Track list loading" />{[0, 1, 2].map((id) => <SkeletonLoader key={id} type="row" />)}</SystemScreen>;
}

export function ErrorRetryScreen() {
  const [attempts, setAttempts] = useState(0);
  const error = systemContent.errorState;
  return <SystemScreen active="events" testID="error-retry-screen"><SystemHeader title={error.title} /><ErrorState title={error.title} description={error.description} actionLabel={attempts ? 'Retrying…' : error.actionLabel} onAction={() => setAttempts((value) => value + 1)} /><SectionRow title="Inline retry" /><View style={styles.inlineError}><AppText variant="bodySmall">Couldn't load upcoming events</AppText><AppText variant="caption" color="text.muted">The server returned an unexpected response.</AppText><Button variant="secondary" onPress={() => setAttempts((value) => value + 1)}>Try again</Button></View></SystemScreen>;
}

export function OfflineScreen() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  return <SystemScreen miniPlayer testID="offline-screen"><SystemHeader title="Offline" /><View style={styles.offlineBanner}><AppText variant="bodySmall">×　You're offline</AppText></View><AppText variant="h2">{systemContent.offline.title}</AppText><AppText color="text.secondary">{systemContent.offline.description}</AppText><SectionRow title="Available offline" /><TrackRow {...systemContent.offline.track} mode="playing" /><Button onPress={() => setRetrying(true)}>{retrying ? 'Trying again…' : 'Try again'}</Button><Button variant="secondary" onPress={() => router.push('/playlists')}>Open downloads</Button></SystemScreen>;
}

function MediaCard({ meta, onPress, title, tone }: { meta: string; onPress: () => void; title: string; tone: 'coral' | 'teal' }) { return <Pressable accessibilityLabel={`Open ${title}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.mediaCard, pressed && pressedFeedback]}><View style={[styles.mediaArtwork, { backgroundColor: tone === 'coral' ? colors.action.primary : colors.action.secondary }]} /><AppText variant="bodySmall">{title}</AppText><AppText variant="caption" color="text.muted">{meta}</AppText></Pressable>; }
function PlayerAction({ active = false, icon, label, onPress }: { active?: boolean; icon: Parameters<typeof AppIcon>[0]['icon']; label: string; onPress?: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.playerAction, pressed && pressedFeedback]}><AppIcon icon={icon} size="compact" tone={active ? 'secondary' : 'muted'} /><AppText variant="caption" color={active ? 'action.secondary' : 'text.muted'}>{label}</AppText></Pressable>; }
function TransportAction({ active = false, icon, label, onPress }: { active?: boolean; icon: Parameters<typeof AppIcon>[0]['icon']; label: string; onPress: () => void }) { return <Pressable accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.transportAction, pressed && pressedFeedback]}><AppIcon icon={icon} size="standard" tone={active ? 'secondary' : 'default'} /></Pressable>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.app }, phoneFrame: { width: '100%', maxWidth: 430, minHeight: 1, flex: 1, alignSelf: 'center', backgroundColor: colors.background.app }, scroll: { flex: 1 }, body: { width: '100%', minHeight: '100%', flexGrow: 1, alignItems: 'stretch', gap: spacing[16], padding: spacing[16] },
  flexCopy: { minWidth: 0, flex: 1, gap: spacing[4] }, greeting: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, avatarButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full }, header: { width: '100%', height: spacing[48], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerLeft: { flexDirection: 'row', alignItems: 'center', marginLeft: -10 }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dailyMix: { width: '100%', minHeight: 150, justifyContent: 'flex-end', gap: spacing[8], padding: spacing[16], borderRadius: radius.card, backgroundColor: colors.category.secondary }, mediaRow: { width: '100%', flexDirection: 'row', gap: spacing[16] }, mediaCard: { minWidth: 0, flex: 1, gap: spacing[8] }, mediaArtwork: { width: '100%', height: 108, borderRadius: radius.card },
  playerBody: { gap: spacing[8], paddingTop: spacing[12], paddingBottom: spacing[12], justifyContent: 'space-between' }, playerTop: { width: '100%', height: 44, flexShrink: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, playerHeaderAction: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, albumArtworkArea: { width: '100%', minHeight: 160, maxHeight: 326, flex: 1, alignItems: 'center', justifyContent: 'center' }, albumArtwork: { height: '100%', aspectRatio: 1, maxWidth: '100%', maxHeight: 326, borderRadius: radius.media, backgroundColor: colors.action.secondary }, playerDetails: { width: '100%', flexShrink: 0, gap: spacing[8] }, progress: { width: '100%', height: 4, borderRadius: radius.full, backgroundColor: colors.border.subtle }, elapsed: { width: '40%', height: 4, borderRadius: radius.full, backgroundColor: colors.action.primary }, times: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' }, playerControls: { width: '100%', minHeight: 68, flexShrink: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, transportAction: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, playButton: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.text.primary }, secondaryControls: { width: '100%', flexShrink: 0, flexDirection: 'row', justifyContent: 'space-around' }, playerAction: { minWidth: 80, minHeight: 48, alignItems: 'center', gap: spacing[4] },
  notification: { width: '100%', minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium }, unreadNotification: { borderWidth: 1, borderColor: colors.border.subtle, backgroundColor: colors.background.surface }, notificationDot: { width: 10, height: 10, borderRadius: radius.full, backgroundColor: colors.action.primary }, readDot: { backgroundColor: colors.border.subtle }, inlineError: { width: '100%', gap: spacing[8], padding: spacing[16], borderRadius: radius.medium, backgroundColor: colors.background.surface }, offlineBanner: { width: '100%', minHeight: 52, justifyContent: 'center', paddingHorizontal: spacing[16], borderRadius: radius.medium, backgroundColor: colors.category.secondary },
});
