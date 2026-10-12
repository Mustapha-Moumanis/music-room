import {
  ArrowLeft02Icon,
  SquareLock01Icon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import type { PropsWithChildren } from 'react';
import {
  Pressable,
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
  HeaderOverflowMenu,
  ScrollSurface,
  type MobileNavigationDestination,
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { colors, radius, spacing } from '../../theme';
import { PlaybackMiniPlayer } from '../playback/playback-mini-player';

export function EventScreen({
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
      {showNavigation ? <BottomNavigation active="events" onNavigate={navigate} /> : null}
    </View>
  </SafeAreaView>;
}

export function EventHeader({
  action = false,
  onBack,
  title,
}: {
  action?: boolean;
  onBack?: () => void;
  title: string;
}) {
  return <View style={styles.header}>
    <View style={[styles.headerLeft, !onBack && styles.rootHeaderLeft]}>
      {onBack ? <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.iconButton, pressed && pressedFeedback]}
      >
        <AppIcon icon={ArrowLeft02Icon} size="standard" />
      </Pressable> : null}
      <AppText variant="h4" color="action.primary" numberOfLines={1} style={styles.headerTitle}>{title}</AppText>
    </View>
    {action ? <HeaderOverflowMenu /> : null}
  </View>;
}

export function SectionRow({ action, onAction, title }: {
  action?: string;
  onAction?: () => void;
  title: string;
}) {
  return <View style={styles.sectionRow}>
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

export function ChoiceCard({
  badge,
  description,
  onPress,
  selected = false,
  title,
}: {
  badge: string;
  description: string;
  onPress: () => void;
  selected?: boolean;
  title: string;
}) {
  return <Pressable
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    onPress={onPress}
    style={({ pressed }) => [
      styles.choiceCard,
      selected && styles.selectedChoice,
      pressed && pressedFeedback,
    ]}
  >
    <View style={styles.choiceCopy}>
      <AppText variant="navigationLabel">{title}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={2}>{description}</AppText>
    </View>
    <View style={[styles.badge, selected && styles.activeBadge]}>
      <AppText variant="caption" color={selected ? 'text.onAccent' : 'text.primary'}>{badge}</AppText>
    </View>
  </Pressable>;
}

export function RuleCard({ badge, description, onPress, selected = true, title }: {
  badge: string;
  description: string;
  onPress: () => void;
  selected?: boolean;
  title: string;
}) {
  return <Pressable
    accessibilityRole="checkbox"
    accessibilityState={{ checked: selected }}
    onPress={onPress}
    style={({ pressed }) => [styles.ruleCard, !selected && styles.inactiveRule, pressed && pressedFeedback]}
  >
    <View style={styles.choiceCopy}>
      <AppText variant="navigationLabel">{title}</AppText>
      <AppText variant="caption" color="text.muted">{description}</AppText>
    </View>
    <View style={[styles.badge, selected && styles.activeRuleBadge]}>
      <AppText variant="caption">{badge}</AppText>
    </View>
  </Pressable>;
}

export function RestrictionCard({ description, title }: { description: string; title: string }) {
  return <View style={styles.restrictionCard}>
    <View style={styles.lockCircle}>
      <AppIcon icon={SquareLock01Icon} size="standard" />
    </View>
    <AppText variant="h4">{title}</AppText>
    <AppText variant="bodySmall" color="text.secondary">{description}</AppText>
  </View>;
}

export const eventStyles = StyleSheet.create({
  form: { width: '100%', gap: spacing[16] },
  grow: { minHeight: spacing[24], flexGrow: 1 },
  buttonStack: { width: '100%', gap: spacing[16] },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing[8] },
  wrap: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: spacing[8] },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.app },
  phoneFrame: {
    width: '100%', maxWidth: 430, minHeight: 1, flex: 1, alignSelf: 'center',
    backgroundColor: colors.background.app,
  },
  scroll: { flex: 1 },
  body: {
    width: '100%', minHeight: '100%', flexGrow: 1, alignItems: 'stretch',
    gap: spacing[16], padding: spacing[16],
  },
  header: {
    width: '100%', height: spacing[48], flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: -10 },
  rootHeaderLeft: { marginLeft: 0 },
  headerTitle: { minWidth: 0, flex: 1 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sectionRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choiceCard: {
    width: '100%', minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing[12],
    padding: spacing[16], borderWidth: 1, borderColor: colors.border.subtle,
    borderRadius: radius.medium, backgroundColor: colors.background.app,
  },
  selectedChoice: { borderWidth: 2, borderColor: colors.action.secondary, backgroundColor: colors.background.surface },
  choiceCopy: { minWidth: 0, flex: 1, gap: spacing[4] },
  ruleCard: {
    width: '100%', minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: spacing[12],
    padding: spacing[16], borderRadius: radius.medium, backgroundColor: colors.background.surface,
  },
  inactiveRule: { opacity: 0.55 },
  activeRuleBadge: { backgroundColor: colors.category.secondary },
  badge: { paddingHorizontal: spacing[12], paddingVertical: spacing[8], borderRadius: radius.full, backgroundColor: colors.category.secondary },
  activeBadge: { backgroundColor: colors.action.secondary },
  restrictionCard: {
    width: '100%', minHeight: 250, justifyContent: 'center', gap: spacing[16],
    padding: spacing[24], borderWidth: 1, borderColor: colors.border.subtle,
    borderRadius: radius.card, backgroundColor: colors.background.surface,
  },
  lockCircle: {
    width: spacing[64], height: spacing[64], alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', borderRadius: radius.full, backgroundColor: colors.category.secondary,
  },
});
