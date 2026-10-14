import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { goBackOrReplace } from '../../lib/navigation';
import { colors, radius, spacing } from '../../theme';

export function SettingsHeader({ fallback, title }: { fallback: '/profile' | '/settings'; title: string }) {
  const router = useRouter();

  return <View style={profileSettingsStyles.header}>
    <View style={profileSettingsStyles.headerLeft}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={() => goBackOrReplace(router, fallback)}
        style={({ pressed }) => [profileSettingsStyles.headerIconButton, pressed && pressedFeedback]}
      >
        <AppIcon icon={ArrowLeft02Icon} size="standard" />
      </Pressable>
      <AppText variant="h4" color="action.primary" numberOfLines={1} style={profileSettingsStyles.headerTitle}>{title}</AppText>
    </View>
  </View>;
}

export const profileSettingsStyles = StyleSheet.create({
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
  profileSummary: {
    width: '100%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  profileCopy: {
    minWidth: 1,
    flex: 1,
  },
  currentPlanCard: {
    width: '100%',
    gap: spacing[16],
    padding: spacing[16],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  planHeading: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[12],
  },
  freeBadge: {
    height: spacing[32],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[12],
    borderRadius: radius.full,
    backgroundColor: colors.category.secondary,
  },
  proCard: {
    width: '100%',
    gap: spacing[16],
    overflow: 'hidden',
    padding: spacing[24],
    borderRadius: radius.media,
    backgroundColor: colors.background.surface,
  },
  benefitList: {
    gap: spacing[12],
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
  },
  benefitDot: {
    width: spacing[8],
    height: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.action.primary,
  },
  benefitCopy: {
    minWidth: 0,
    flex: 1,
  },
});
