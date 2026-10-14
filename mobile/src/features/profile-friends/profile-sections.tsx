import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import profileContent from '../../content/profile.json';
import { spacing } from '../../theme';
import { profileFriendsInternalStyles as styles } from './profile-friends.styles';

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

export function ProfileStats({ onEventsPress, onFriendsPress, onPlaylistsPress }: {
  onEventsPress?: () => void;
  onFriendsPress?: () => void;
  onPlaylistsPress?: () => void;
}) {
  const stats = Object.fromEntries(profileContent.stats.map((stat) => [stat.key, stat]));
  return <View style={styles.stats}>
    <ProfileStat value={stats.friends.value} label={stats.friends.label} onPress={onFriendsPress} />
    <ProfileStat value={stats.playlists.value} label={stats.playlists.label} onPress={onPlaylistsPress} />
    <ProfileStat value={stats.events.value} label={stats.events.label} onPress={onEventsPress} />
  </View>;
}

function ProfileStat({ label, onPress, value }: { label: string; onPress?: () => void; value: string }) {
  const content = <>
    <AppText variant="h5">{value}</AppText>
    <AppText variant="caption" color="text.muted">{label}</AppText>
  </>;
  return onPress ? <Pressable
    accessibilityLabel={`Open ${label}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.stat, pressed && pressedFeedback]}
  >{content}</Pressable> : <View style={styles.stat}>{content}</View>;
}

export function IconNote({ icon, children }: PropsWithChildren<{ icon: ReactNode }>) {
  return <View style={styles.iconNote}>
    {icon}
    <AppText variant="caption" color="text.muted" style={styles.noteCopy}>{children}</AppText>
  </View>;
}
