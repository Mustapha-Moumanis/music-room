import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, AppText, BottomNavigation, HeaderOverflowMenu, ScrollSurface, type MobileNavigationDestination } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { colors, radius, spacing } from '../../theme';
import { PlaybackMiniPlayer } from '../playback/playback-mini-player';

export function PlaylistScreen({
  bodyStyle,
  children,
  showMiniPlayer = false,
  showNavigation = false,
  testID,
}: PropsWithChildren<{
  bodyStyle?: StyleProp<ViewStyle>;
  showMiniPlayer?: boolean;
  showNavigation?: boolean;
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

  return <SafeAreaView testID={testID} style={styles.safeArea}>
    <View style={styles.phoneFrame}>
      <ScrollSurface
        style={styles.scroll}
        contentContainerStyle={[styles.body, bodyStyle]}
        continuationTestID={`${testID}-scroll-cue`}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollSurface>
      {showMiniPlayer ? <PlaybackMiniPlayer /> : null}
      {showNavigation ? <BottomNavigation active="playlists" onNavigate={navigate} /> : null}
    </View>
  </SafeAreaView>;
}

export function PlaylistHeader({ action = false, onBack, title }: {
  action?: boolean;
  onBack?: () => void;
  title: string;
}) {
  return <View style={styles.header}>
    <View style={[styles.headerLeft, !onBack && styles.rootHeaderLeft]}>
      {onBack ? <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && pressedFeedback]}>
        <AppIcon icon={ArrowLeft02Icon} size="standard" />
      </Pressable> : null}
      <AppText variant="h4" color="action.primary" numberOfLines={1} style={styles.headerTitle}>{title}</AppText>
    </View>
    {action ? <HeaderOverflowMenu /> : null}
  </View>;
}

export function PlaylistTile({ meta, onPress, title, tone = 'coral' }: {
  meta: string;
  onPress: () => void;
  title: string;
  tone?: 'coral' | 'teal' | 'purple';
}) {
  const background = tone === 'teal' ? colors.action.secondary : tone === 'coral' ? colors.action.primary : colors.category.secondary;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.tile, pressed && pressedFeedback]}>
    <View style={[styles.tileArtwork, { backgroundColor: background }]} />
    <AppText variant="bodySmall" numberOfLines={1}>{title}</AppText>
    <AppText variant="caption" color="text.muted" numberOfLines={1}>{meta}</AppText>
  </Pressable>;
}

export function RoleBanner({ role, title }: { role: 'owner' | 'collaborator' | 'read-only'; title: string }) {
  const backgroundColor = role === 'owner' ? colors.action.primary : role === 'collaborator' ? colors.action.secondary : colors.background.surface;
  return <View style={[styles.roleBanner, { backgroundColor }]}>
    <AppText variant="navigationLabel" color={role === 'read-only' ? 'text.primary' : 'text.onAccent'}>{title}</AppText>
    <AppText variant="caption" color={role === 'read-only' ? 'text.muted' : 'text.onAccent'}>
      {role === 'owner' ? 'Full playlist control' : role === 'collaborator' ? 'Add, move, and remove tracks' : 'Playback only'}
    </AppText>
  </View>;
}

export const playlistStyles = StyleSheet.create({
  grow: { minHeight: spacing[24], flexGrow: 1 },
  form: { width: '100%', gap: spacing[16] },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing[12] },
  tileRow: { width: '100%', flexDirection: 'row', gap: spacing[16] },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.app },
  phoneFrame: { width: '100%', maxWidth: 430, minHeight: 1, flex: 1, alignSelf: 'center', backgroundColor: colors.background.app },
  scroll: { flex: 1 },
  body: { width: '100%', minHeight: '100%', flexGrow: 1, alignItems: 'stretch', gap: spacing[16], padding: spacing[16] },
  header: { width: '100%', height: spacing[48], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: -10 },
  rootHeaderLeft: { marginLeft: 0 },
  headerTitle: { minWidth: 0, flex: 1 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  tile: { minWidth: 0, flex: 1, height: 220, gap: spacing[8] },
  tileArtwork: { width: '100%', aspectRatio: 1, borderRadius: radius.card },
  roleBanner: { width: '100%', minHeight: 52, justifyContent: 'center', gap: spacing[4], paddingHorizontal: spacing[16], borderRadius: radius.medium },
});
