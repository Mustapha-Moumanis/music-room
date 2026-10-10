import {
  ArrowLeft02Icon,
  Globe02Icon,
  MoreVerticalIcon,
  SquareLock01Icon,
  UserGroupIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppIcon,
  AppText,
  BottomNavigation,
  MiniPlayer,
  type MobileNavigationDestination,
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { colors, radius, spacing } from '../../theme';

export function ProfileFriendsScreen({
  active,
  bodyStyle,
  children,
  showMiniPlayer = false,
  showNavigation = true,
  testID,
}: PropsWithChildren<{
  active: 'friends' | 'profile';
  bodyStyle?: StyleProp<ViewStyle>;
  showMiniPlayer?: boolean;
  showNavigation?: boolean;
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

  return <SafeAreaView testID={testID} style={styles.safeArea}>
    <View style={styles.phoneFrame}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, bodyStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {showMiniPlayer ? <MiniPlayer
        title="Better Off Alone"
        artist="The Midnight"
        state={playing ? 'playing' : 'paused'}
        onPlayPausePress={() => setPlaying((current) => !current)}
      /> : null}
      {showNavigation ? <BottomNavigation active={active} onNavigate={navigate} /> : null}
    </View>
  </SafeAreaView>;
}

export function MobileProfileHeader({
  action = false,
  onBack,
  onAction,
  title,
}: {
  action?: boolean;
  onAction?: () => void;
  onBack: () => void;
  title: string;
}) {
  return <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.headerIconButton, pressed && pressedFeedback]}
      >
        <AppIcon icon={ArrowLeft02Icon} size="standard" />
      </Pressable>
      <AppText variant="h4" numberOfLines={1} style={styles.headerTitle}>{title}</AppText>
    </View>
    {action ? <Pressable
      accessibilityLabel="More options"
      accessibilityRole="button"
      onPress={onAction}
      style={({ pressed }) => [styles.headerIconButton, pressed && pressedFeedback]}
    >
      <AppIcon icon={MoreVerticalIcon} size="standard" />
    </Pressable> : <View style={styles.headerIconButton} />}
  </View>;
}

export type VisibilityLevel = 'public' | 'friends' | 'private' | 'hidden';

const visibilityContent: Record<VisibilityLevel, {
  badge: string;
  description: string;
  label: string;
  backgroundColor: string;
}> = {
  public: { badge: 'Public', description: 'Visible to everyone', label: 'Public', backgroundColor: colors.action.secondary },
  friends: { badge: 'Friends', description: 'Visible to friends', label: 'Friends only', backgroundColor: colors.category.secondary },
  private: { badge: 'Private', description: 'Only visible to you', label: 'Private', backgroundColor: colors.action.primary },
  hidden: { badge: 'Hidden', description: 'Not shown to this viewer', label: 'Hidden', backgroundColor: colors.background.app },
};

const visibilityIcons = {
  public: Globe02Icon,
  friends: UserGroupIcon,
  private: SquareLock01Icon,
  hidden: ViewOffSlashIcon,
};

export function ProfileVisibilityRow({ level }: { level: VisibilityLevel }) {
  const content = visibilityContent[level];

  return <View style={styles.visibilityRow}>
    <AppIcon icon={visibilityIcons[level]} size="standard" />
    <View style={styles.visibilityCopy}>
      <AppText variant="navigationLabel">{content.label}</AppText>
      <AppText variant="caption" color="text.muted">{content.description}</AppText>
    </View>
    <View style={[styles.visibilityBadge, { backgroundColor: content.backgroundColor }]}>
      <AppText variant="caption" color={level === 'hidden' ? 'text.secondary' : 'text.onAccent'}>{content.badge}</AppText>
    </View>
  </View>;
}

export function ProfileInformationRow({ compact = false, hidden = false, label, value }: {
  compact?: boolean;
  hidden?: boolean;
  label: string;
  value: string;
}) {
  return <View style={[styles.informationRow, compact && styles.compactInformationRow]}>
    <View style={styles.informationCopy}>
      <AppText variant="caption" color="text.muted">{label}</AppText>
      <AppText variant="bodySmall" color={hidden ? 'text.muted' : 'text.primary'} numberOfLines={1}>{value}</AppText>
    </View>
    {hidden ? <AppIcon icon={SquareLock01Icon} size="compact" tone="muted" /> : null}
  </View>;
}

export function SectionHeading({ action, onAction, title }: {
  action?: string;
  onAction?: () => void;
  title: string;
}) {
  return <View style={styles.sectionHeading}>
    <AppText variant="h5">{title}</AppText>
    {action ? <Pressable
      accessibilityRole="button"
      onPress={onAction}
      hitSlop={spacing[8]}
      style={({ pressed }) => pressed && pressedFeedback}
    >
      <AppText variant="caption" color="action.secondary">{action}</AppText>
    </Pressable> : null}
  </View>;
}

export function ProfileStats() {
  return <View style={styles.stats}>
    <ProfileStat value="42" label="Friends" />
    <ProfileStat value="6" label="Playlists" />
    <ProfileStat value="3" label="Events" />
  </View>;
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}>
    <AppText variant="h5">{value}</AppText>
    <AppText variant="caption" color="text.muted">{label}</AppText>
  </View>;
}

export function IconNote({ icon, children }: PropsWithChildren<{ icon: ReactNode }>) {
  return <View style={styles.iconNote}>
    {icon}
    <AppText variant="caption" color="text.muted" style={styles.noteCopy}>{children}</AppText>
  </View>;
}

export const profileFriendsStyles = StyleSheet.create({
  form: {
    width: '100%',
    gap: spacing[16],
  },
  chips: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[8],
  },
  spacer: {
    minHeight: spacing[24],
    flexGrow: 1,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing[12],
  },
  centered: {
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.app,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 390,
    minHeight: 1,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: colors.background.app,
  },
  scroll: {
    flex: 1,
  },
  body: {
    width: '100%',
    minHeight: '100%',
    flexGrow: 1,
    alignItems: 'stretch',
    gap: spacing[16],
    padding: spacing[16],
  },
  header: {
    width: '100%',
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    minWidth: 1,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    minWidth: 1,
    flexShrink: 1,
  },
  visibilityRow: {
    width: '100%',
    height: spacing[64],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  visibilityCopy: {
    minWidth: 1,
    flex: 1,
  },
  visibilityBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  informationRow: {
    width: '100%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[12],
    paddingVertical: 10,
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  compactInformationRow: {
    minHeight: 54,
  },
  informationCopy: {
    minWidth: 1,
    flex: 1,
  },
  sectionHeading: {
    width: '100%',
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stats: {
    width: '100%',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconNote: {
    width: '100%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  noteCopy: {
    minWidth: 1,
    flex: 1,
  },
});
