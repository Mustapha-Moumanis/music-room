import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, AppText, BottomNavigation, HeaderOverflowMenu, ScrollSurface, type MobileNavigationDestination } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { PlaybackMiniPlayer } from '../playback/playback-mini-player';
import { profileFriendsInternalStyles as styles } from './profile-friends.styles';

export function ProfileFriendsScreen({
  active,
  bodyStyle,
  children,
  footer,
  showMiniPlayer = false,
  showNavigation = true,
  testID,
}: PropsWithChildren<{
  active: 'friends' | 'profile';
  bodyStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
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
      {footer}
      {showMiniPlayer ? <PlaybackMiniPlayer /> : null}
      {showNavigation ? <BottomNavigation active={active} onNavigate={navigate} /> : null}
    </View>
  </SafeAreaView>;
}

export function MobileProfileHeader({
  action = false,
  accountMenuSelection,
  onBack,
  title,
}: {
  action?: boolean;
  accountMenuSelection?: 'profile' | 'subscription' | 'settings';
  onBack?: () => void;
  title: string;
}) {
  return <View style={styles.header}>
    <View style={[styles.headerLeft, !onBack && styles.rootHeaderLeft]}>
      {onBack ? <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.headerIconButton, pressed && pressedFeedback]}
      >
        <AppIcon icon={ArrowLeft02Icon} size="standard" />
      </Pressable> : null}
      <AppText variant="h4" color="action.primary" numberOfLines={1} style={styles.headerTitle}>{title}</AppText>
    </View>
    {action ? <HeaderOverflowMenu
      accessibilityLabel="Open account menu"
      selectedItem={accountMenuSelection}
    /> : <View style={styles.headerIconButton} />}
  </View>;
}
