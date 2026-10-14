import type { PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Avatar } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { authUiStyles as styles } from './auth-ui.styles';

export type AuthStatusTone = 'pending' | 'success';

export function AuthStatusCard({ icon, title, description, tone = 'success' }: {
  icon: string;
  title: string;
  description: string;
  tone?: AuthStatusTone;
}) {
  return <View style={styles.statusCard}>
    <View style={[styles.statusIcon, tone === 'pending' ? styles.pendingIcon : styles.successIcon]}>
      <AppText variant="h4" color={tone === 'pending' ? 'text.primary' : 'text.onAccent'}>{icon}</AppText>
    </View>
    <AppText variant="h4" style={styles.centeredText}>{title}</AppText>
    <AppText variant="bodySmall" color="text.secondary" style={styles.statusDescription}>{description}</AppText>
  </View>;
}

export function AuthNotice({ label, children }: PropsWithChildren<{ label: string }>) {
  return <View style={styles.notice}>
    <AppText variant="navigationLabel">{label}</AppText>
    <AppText variant="bodySmall" color="text.secondary">{children}</AppText>
  </View>;
}

export function AccountRow({ initials, name, email, onPress }: {
  initials: string;
  name: string;
  email: string;
  onPress: () => void;
}) {
  return <Pressable
    accessibilityLabel={`Continue as ${name}, ${email}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.accountRow, pressed && pressedFeedback]}
  >
    <Avatar initials={initials} size="medium" />
    <View style={styles.accountCopy}>
      <AppText variant="navigationLabel" numberOfLines={1}>{name}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={1}>{email}</AppText>
    </View>
    <AppText variant="h5" color="text.muted">›</AppText>
  </Pressable>;
}
