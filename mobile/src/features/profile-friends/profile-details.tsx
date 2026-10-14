import { Globe02Icon, SquareLock01Icon, UserGroupIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { View } from 'react-native';

import { AppIcon, AppText } from '../../components/ui';
import { colors } from '../../theme';
import { profileFriendsInternalStyles as styles } from './profile-friends.styles';

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

export function ProfileInformationRow({ compact = false, label, value }: {
  compact?: boolean;
  label: string;
  value: string;
}) {
  return <View style={[styles.informationRow, compact && styles.compactInformationRow]}>
    <View style={styles.informationCopy}>
      <AppText variant="caption" color="text.muted">{label}</AppText>
      <AppText variant="bodySmall" color="text.primary" numberOfLines={1}>{value}</AppText>
    </View>
  </View>;
}
