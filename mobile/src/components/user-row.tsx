import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { UserSummary } from '../api/users';
import { Avatar, styles } from './ui';

export function openProfile(userId: string) {
  router.push({ pathname: '/(app)/users/[id]', params: { id: userId } });
}

/** One person in a list: tapping the name opens their profile; `action` sits on the right. */
export function UserRow({ user, subtitle, action }: { user: UserSummary; subtitle?: string; action?: ReactNode }) {
  return <View style={[styles.panel, styles.row, { padding: 14 }]}>
    <Pressable accessibilityRole="link" accessibilityLabel={`Open ${user.displayName}'s profile`} onPress={() => openProfile(user.id)}
      style={({ pressed }) => [styles.row, { flex: 1 }, pressed && styles.pressed]}>
      <Avatar name={user.displayName} url={user.avatarUrl} size={44} />
      <View style={styles.rowText}>
        <Text style={styles.label} numberOfLines={1}>{user.displayName}</Text>
        {subtitle ? <Text style={styles.hint} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
    </Pressable>
    {action}
  </View>;
}
