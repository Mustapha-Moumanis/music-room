import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Button, EmptyState, ErrorState, SkeletonLoader, Toast, TrackRow } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import systemContent from '../../content/system.json';
import { SectionRow } from '../track-vote/track-vote-ui';
import { SystemHeader, SystemScreen } from './system-layout';
import { systemScreenStyles as styles } from './system-screen.styles';

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
  return <SystemScreen active="events" testID="error-retry-screen"><SystemHeader title={error.title} /><ErrorState title={error.title} description={error.description} actionLabel={attempts ? 'Retrying…' : error.actionLabel} onAction={() => setAttempts((value) => value + 1)} /><SectionRow title="Inline retry" /><View style={styles.inlineError}><AppText variant="bodySmall">{"Couldn't load upcoming events"}</AppText><AppText variant="caption" color="text.muted">The server returned an unexpected response.</AppText><Button variant="secondary" onPress={() => setAttempts((value) => value + 1)}>Try again</Button></View></SystemScreen>;
}

export function OfflineScreen() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  return <SystemScreen miniPlayer testID="offline-screen"><SystemHeader title="Offline" /><View style={styles.offlineBanner}><AppText variant="bodySmall">{"×　You're offline"}</AppText></View><AppText variant="h2">{systemContent.offline.title}</AppText><AppText color="text.secondary">{systemContent.offline.description}</AppText><SectionRow title="Available offline" /><TrackRow {...systemContent.offline.track} mode="playing" /><Button onPress={() => setRetrying(true)}>{retrying ? 'Trying again…' : 'Try again'}</Button><Button variant="secondary" onPress={() => router.push('/playlists')}>Open downloads</Button></SystemScreen>;
}
