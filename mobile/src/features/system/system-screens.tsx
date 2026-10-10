import {
  ArrowDown01Icon,
  ArrowLeft02Icon,
  HeartIcon,
  MoreVerticalIcon,
  NextIcon,
  PauseIcon,
  PreviousIcon,
  Queue01Icon,
  RepeatIcon,
  ShuffleIcon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppIcon,
  AppText,
  Avatar,
  BottomNavigation,
  Button,
  EmptyState,
  ErrorState,
  MiniPlayer,
  SkeletonLoader,
  Toast,
  TrackRow,
  type MobileNavigationDestination,
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { colors, radius, spacing } from '../../theme';
import { SectionRow } from '../track-vote/track-vote-ui';

function SystemScreen({ active = 'home', children, miniPlayer = false, navigation = true, testID }: PropsWithChildren<{
  active?: MobileNavigationDestination;
  miniPlayer?: boolean;
  navigation?: boolean;
  testID: string;
}>) {
  const router = useRouter();
  const [playing, setPlaying] = useState(true);
  const navigate = (destination: MobileNavigationDestination) => {
    if (destination === 'home') router.replace('/home');
    if (destination === 'events') router.replace('/events');
    if (destination === 'playlists') router.replace('/playlists');
    if (destination === 'friends') router.replace('/friends');
    if (destination === 'profile') router.replace('/profile');
  };
  return <SafeAreaView style={styles.safeArea} testID={testID}><View style={styles.phoneFrame}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>{children}</ScrollView>
    {miniPlayer ? <MiniPlayer title="Better Off Alone" artist="The Midnight" state={playing ? 'playing' : 'paused'} onPlayPausePress={() => setPlaying((value) => !value)} /> : null}
    {navigation ? <BottomNavigation active={active} onNavigate={navigate} /> : null}
  </View></SafeAreaView>;
}

function SystemHeader({ title }: { title: string }) {
  const router = useRouter();
  return <View style={styles.header}><View style={styles.headerLeft}><Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && pressedFeedback]}><AppIcon icon={ArrowLeft02Icon} size="standard" /></Pressable><AppText variant="h4">{title}</AppText></View><Avatar initials="SH" size="header" /></View>;
}

export function HomeScreen() {
  const router = useRouter();
  return <SystemScreen miniPlayer testID="home-screen">
    <View style={styles.greeting}><AppText variant="h4">Good evening.</AppText><Avatar initials="SH" size="header" /></View>
    <AppText variant="h2">Find something{`\n`}worth listening to.</AppText>
    <SectionRow title="Made for you" action="See all" onAction={() => router.push('/playlists')} />
    <Pressable accessibilityRole="button" onPress={() => router.push('/playlists/radio')} style={({ pressed }) => [styles.dailyMix, pressed && pressedFeedback]}><AppText variant="caption">YOUR DAILY MIX</AppText><AppText variant="h4">Analog After Dark</AppText><AppText variant="bodySmall" color="text.secondary">Picked from your recent listening</AppText></Pressable>
    <SectionRow title="Recently played" />
    <View style={styles.mediaRow}><MediaCard title="Late Nights" meta="Playlist" tone="coral" /><MediaCard title="Friends Tape" meta="Collaborative" tone="teal" /></View>
  </SystemScreen>;
}

export function MiniPlayerDemoScreen() {
  return <SystemScreen active="playlists" miniPlayer testID="mini-player-demo-screen">
    <SystemHeader title="Mini player" />
    <AppText variant="bodySmall" color="text.secondary">The mini player stays available while you browse. Tap the track area to expand Now Playing.</AppText>
    <SectionRow title="Queue preview" />
    <TrackRow title="Better Off Alone" artist="The Midnight" duration="3:56" mode="playing" />
    <TrackRow title="Night Drive" artist="FM-84" duration="3:56" mode="playing" />
    <TrackRow title="Under Neon" artist="Chromatics" duration="4:12" mode="playing" />
  </SystemScreen>;
}

export function FullPlayerScreen() {
  const router = useRouter();
  const [playing, setPlaying] = useState(true);
  const [favorite, setFavorite] = useState(false);
  return <SystemScreen navigation={false} testID="full-player-screen">
    <View style={styles.playerTop}><Pressable accessibilityLabel="Close player" accessibilityRole="button" onPress={() => router.back()}><AppIcon icon={ArrowDown01Icon} size="standard" /></Pressable><AppText variant="navigationLabel">Now Playing</AppText><AppIcon icon={MoreVerticalIcon} size="standard" /></View>
    <View style={styles.albumArtwork} />
    <AppText variant="h2">Better Off Alone</AppText><AppText variant="h4" color="text.secondary">The Midnight</AppText>
    <View style={styles.progress}><View style={styles.elapsed} /></View><View style={styles.times}><AppText variant="caption" color="text.muted">1:42</AppText><AppText variant="caption" color="text.muted">3:56</AppText></View>
    <View style={styles.playerControls}><AppIcon icon={ShuffleIcon} size="standard" /><AppIcon icon={PreviousIcon} size="standard" /><Pressable accessibilityLabel={playing ? 'Pause' : 'Play'} accessibilityRole="button" onPress={() => setPlaying((value) => !value)} style={({ pressed }) => [styles.playButton, pressed && pressedFeedback]}><AppIcon icon={PauseIcon} size="standard" tone="onAccent" /></Pressable><AppIcon icon={NextIcon} size="standard" /><AppIcon icon={RepeatIcon} size="standard" tone="secondary" /></View>
    <View style={styles.secondaryControls}><PlayerAction icon={HeartIcon} label={favorite ? 'Favorited' : 'Favorite'} onPress={() => setFavorite((value) => !value)} /><PlayerAction icon={Queue01Icon} label="Queue" /><PlayerAction icon={ArrowDown01Icon} label="Offline" /><PlayerAction icon={RepeatIcon} label="Device" /></View>
  </SystemScreen>;
}

export function NotificationsScreen() {
  const [read, setRead] = useState<Set<number>>(() => new Set([2]));
  const notifications = [
    ['Nada invited you to Friends Tape', '2 min ago'],
    ['Your vote moved a track to #1', '12 min ago'],
    ['Playlist invite accepted', 'Yesterday'],
  ];
  return <SystemScreen testID="notifications-screen"><SystemHeader title="Notifications" />
    {notifications.map(([title, time], index) => <Pressable key={title} accessibilityRole="button" onPress={() => setRead((current) => new Set(current).add(index))} style={({ pressed }) => [styles.notification, !read.has(index) && styles.unreadNotification, pressed && pressedFeedback]}><View style={[styles.notificationDot, read.has(index) && styles.readDot]} /><View style={styles.flexCopy}><AppText variant="bodySmall">{title}</AppText><AppText variant="caption" color="text.muted">{time}</AppText></View></Pressable>)}
    <SectionRow title="Toast examples" /><Toast message="Playlist updated" tone="success" /><Toast message="Nada is editing" tone="info" /><Toast message="Connection failed" tone="error" />
  </SystemScreen>;
}

export function EmptyStatesScreen() {
  const router = useRouter();
  return <SystemScreen active="playlists" testID="empty-states-screen"><SystemHeader title="Empty states" /><SectionRow title="No playlists" /><EmptyState title="Nothing here yet" description="Your music will appear here when there is something to show." actionLabel="Explore" onAction={() => router.push('/playlists')} /><SectionRow title="Search" /><EmptyState type="noResults" title="No matches yet" description="Try another search or clear filters." actionLabel="Clear search" /></SystemScreen>;
}

export function LoadingStatesScreen() {
  return <SystemScreen testID="loading-states-screen"><SystemHeader title="Loading" /><SectionRow title="Card loading" /><SkeletonLoader /><SectionRow title="Track list loading" />{[0, 1, 2].map((id) => <SkeletonLoader key={id} type="row" />)}</SystemScreen>;
}

export function ErrorRetryScreen() {
  const [attempts, setAttempts] = useState(0);
  return <SystemScreen active="events" testID="error-retry-screen"><SystemHeader title="Something went wrong" /><ErrorState title="Something went wrong" description="Try again or check your connection." actionLabel={attempts ? 'Retrying…' : 'Retry'} onAction={() => setAttempts((value) => value + 1)} /><SectionRow title="Inline retry" /><View style={styles.inlineError}><AppText variant="bodySmall">Couldn't load upcoming events</AppText><AppText variant="caption" color="text.muted">The server returned an unexpected response.</AppText><Button variant="secondary" onPress={() => setAttempts((value) => value + 1)}>Try again</Button></View></SystemScreen>;
}

export function OfflineScreen() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  return <SystemScreen miniPlayer testID="offline-screen"><SystemHeader title="Offline" /><View style={styles.offlineBanner}><AppText variant="bodySmall">×　You're offline</AppText></View><AppText variant="h2">No internet{`\n`}connection</AppText><AppText color="text.secondary">You can keep listening to downloaded tracks. Reconnect to refresh events, votes, friends, and collaborative playlists.</AppText><SectionRow title="Available offline" /><TrackRow title="Better Off Alone" artist="Downloaded" duration="3:56" mode="playing" /><Button onPress={() => setRetrying(true)}>{retrying ? 'Trying again…' : 'Try again'}</Button><Button variant="secondary" onPress={() => router.push('/playlists')}>Open downloads</Button></SystemScreen>;
}

function MediaCard({ meta, title, tone }: { meta: string; title: string; tone: 'coral' | 'teal' }) { return <View style={styles.mediaCard}><View style={[styles.mediaArtwork, { backgroundColor: tone === 'coral' ? colors.action.primary : colors.action.secondary }]} /><AppText variant="bodySmall">{title}</AppText><AppText variant="caption" color="text.muted">{meta}</AppText></View>; }
function PlayerAction({ icon, label, onPress }: { icon: Parameters<typeof AppIcon>[0]['icon']; label: string; onPress?: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.playerAction, pressed && pressedFeedback]}><AppIcon icon={icon} size="compact" /><AppText variant="caption" color="text.muted">{label}</AppText></Pressable>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.app }, phoneFrame: { width: '100%', maxWidth: 390, minHeight: 1, flex: 1, alignSelf: 'center', backgroundColor: colors.background.app }, scroll: { flex: 1 }, body: { width: '100%', minHeight: '100%', flexGrow: 1, alignItems: 'stretch', gap: spacing[16], padding: spacing[16] },
  flexCopy: { minWidth: 0, flex: 1, gap: spacing[4] }, greeting: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, header: { width: '100%', height: spacing[48], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerLeft: { flexDirection: 'row', alignItems: 'center', marginLeft: -10 }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dailyMix: { width: '100%', minHeight: 150, justifyContent: 'flex-end', gap: spacing[8], padding: spacing[16], borderRadius: radius.card, backgroundColor: colors.category.secondary }, mediaRow: { width: '100%', flexDirection: 'row', gap: spacing[16] }, mediaCard: { minWidth: 0, flex: 1, gap: spacing[8] }, mediaArtwork: { width: '100%', height: 108, borderRadius: radius.card },
  playerTop: { width: '100%', height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, albumArtwork: { width: '100%', aspectRatio: 1, maxHeight: 326, alignSelf: 'center', borderRadius: radius.media, backgroundColor: colors.action.secondary }, progress: { width: '100%', height: 4, borderRadius: radius.full, backgroundColor: colors.border.subtle }, elapsed: { width: '40%', height: 4, borderRadius: radius.full, backgroundColor: colors.action.primary }, times: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' }, playerControls: { width: '100%', minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, playButton: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.text.primary }, secondaryControls: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' }, playerAction: { minWidth: 56, minHeight: 48, alignItems: 'center', gap: spacing[4] },
  notification: { width: '100%', minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium }, unreadNotification: { borderWidth: 1, borderColor: colors.border.subtle, backgroundColor: colors.background.surface }, notificationDot: { width: 10, height: 10, borderRadius: radius.full, backgroundColor: colors.action.primary }, readDot: { backgroundColor: colors.border.subtle }, inlineError: { width: '100%', gap: spacing[8], padding: spacing[16], borderRadius: radius.medium, backgroundColor: colors.background.surface }, offlineBanner: { width: '100%', minHeight: 52, justifyContent: 'center', paddingHorizontal: spacing[16], borderRadius: radius.medium, backgroundColor: colors.category.secondary },
});
