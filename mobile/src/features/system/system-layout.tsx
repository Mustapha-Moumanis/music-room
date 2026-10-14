import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, AppText, Avatar, BottomNavigation, ScrollSurface, type MobileNavigationDestination } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { goBackOrReplace } from '../../lib/navigation';
import { PlaybackMiniPlayer } from '../playback/playback-mini-player';
import { systemScreenStyles as styles } from './system-screen.styles';

export function SystemScreen({ active = 'home', bodyStyle, children, miniPlayer = false, navigation = true, showContinuationCue = true, testID }: PropsWithChildren<{
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

export function SystemHeader({ title }: { title: string }) {
  const router = useRouter();
  return <View style={styles.header}><View style={styles.headerLeft}><Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => goBackOrReplace(router, '/home')} style={({ pressed }) => [styles.iconButton, pressed && pressedFeedback]}><AppIcon icon={ArrowLeft02Icon} size="standard" /></Pressable><AppText variant="h4" color="action.primary">{title}</AppText></View><Pressable accessibilityLabel="Open profile" accessibilityRole="button" onPress={() => router.push('/profile')} style={({ pressed }) => [styles.avatarButton, pressed && pressedFeedback]}><Avatar initials="SH" size="header" /></Pressable></View>;
}
