import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';

import { ApiError } from '../api/errors';
import { acceptFriendRequest, cancelFriendRequest, declineFriendRequest, friendKeys, removeFriend, sendFriendRequest } from '../api/friends';
import { userKeys, type Relationship } from '../api/users';
import { Action, ErrorText, styles } from './ui';

type Busy = '' | 'send' | 'cancel' | 'accept' | 'decline' | 'remove';

/** Refreshes every list and profile that shows a relationship after one changes. */
export function useInvalidateFriendships() {
  const client = useQueryClient();
  return () => Promise.all([
    client.invalidateQueries({ queryKey: friendKeys.all }),
    client.invalidateQueries({ queryKey: [...userKeys.all, 'search'] }),
    client.invalidateQueries({ queryKey: [...userKeys.all, 'profile'] }),
  ]);
}

/**
 * The friend button for one user, matching how we relate. `compact` is for list rows: no remove,
 * which lives on the user's profile screen behind a confirmation.
 */
export function RelationshipAction({ userId, name, relationship, compact = false }: {
  userId: string; name: string; relationship: Relationship; compact?: boolean;
}) {
  const invalidate = useInvalidateFriendships();
  const [busy, setBusy] = useState<Busy>('');
  const [error, setError] = useState('');

  async function run(kind: Exclude<Busy, ''>, action: () => Promise<unknown>) {
    setBusy(kind); setError('');
    try {
      await action();
    } catch (cause) {
      setError(friendErrorMessage(cause));
    } finally {
      // Refresh even after an error: the other person may have acted first.
      await invalidate();
      setBusy('');
    }
  }

  function confirmRemove() {
    // react-native-web's Alert is a no-op, so the browser build asks with the native dialog.
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${name}? They will no longer see your friends-only details.`)) {
        void run('remove', () => removeFriend(userId));
      }
      return;
    }
    Alert.alert(`Remove ${name}?`, 'They will no longer see your friends-only details.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void run('remove', () => removeFriend(userId)) },
    ]);
  }

  const disabled = busy !== '';
  let actions;
  switch (relationship) {
    case 'SELF':
      return null;
    case 'NONE':
      actions = <Action compact={compact} title="Add friend" loading={busy === 'send'} disabled={disabled}
        onPress={() => void run('send', () => sendFriendRequest(userId))} />;
      break;
    case 'REQUEST_SENT':
      actions = <Action compact={compact} secondary title="Cancel request" loading={busy === 'cancel'} disabled={disabled}
        onPress={() => void run('cancel', () => cancelFriendRequest(userId))} />;
      break;
    case 'REQUEST_RECEIVED':
      actions = <View style={compact ? styles.row : { gap: 12 }}>
        <Action compact={compact} title="Accept" loading={busy === 'accept'} disabled={disabled}
          onPress={() => void run('accept', () => acceptFriendRequest(userId))} />
        <Action compact={compact} secondary title="Decline" loading={busy === 'decline'} disabled={disabled}
          onPress={() => void run('decline', () => declineFriendRequest(userId))} />
      </View>;
      break;
    case 'FRIENDS':
      actions = compact
        ? <Text style={styles.success}>Friends</Text>
        : <Action secondary title="Remove friend" loading={busy === 'remove'} disabled={disabled} onPress={confirmRemove} />;
      break;
  }
  return <View style={{ gap: 8 }}>
    {actions}
    {error ? <ErrorText>{error}</ErrorText> : null}
  </View>;
}

export function friendErrorMessage(cause: unknown): string {
  if (cause instanceof ApiError) {
    if (cause.code === 'USER_NOT_FOUND') return 'This account is no longer available.';
    if (cause.code === 'FRIEND_REQUEST_NOT_FOUND') return 'That request was withdrawn.';
  }
  return cause instanceof Error ? cause.message : 'Something went wrong. Try again.';
}

export const relationshipLabel: Record<Relationship, string> = {
  SELF: 'You',
  FRIENDS: 'Friend',
  REQUEST_SENT: 'Request sent',
  REQUEST_RECEIVED: 'Wants to be your friend',
  NONE: '',
};
