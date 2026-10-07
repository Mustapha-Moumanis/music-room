import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ApiError } from '../../../src/api/errors';
import { getUserProfile, userKeys, type UserProfile } from '../../../src/api/users';
import { RelationshipAction, relationshipLabel } from '../../../src/components/relationship-action';
import { Action, Avatar, Chip, colors, ErrorText, Screen, styles } from '../../../src/components/ui';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useQuery({ queryKey: userKeys.profile(id), queryFn: () => getUserProfile(id), enabled: Boolean(id) });

  if (!profile.data) {
    const gone = profile.error instanceof ApiError && profile.error.code === 'USER_NOT_FOUND';
    return <Screen>
      <Text style={styles.eyebrow}>PROFILE</Text>
      {profile.isError
        ? <><ErrorText>{gone ? 'This account is no longer available.' : `Could not load this profile. ${profile.error.message}`}</ErrorText>
          {gone ? null : <Action title="Try again" onPress={() => void profile.refetch()} />}</>
        : <ActivityIndicator color={colors.accent} />}
    </Screen>;
  }

  const user = profile.data;
  const name = user.public.displayName;
  return <Screen refreshing={profile.isRefetching} onRefresh={() => void profile.refetch()}>
    <Text style={styles.eyebrow}>PROFILE</Text>
    <View style={[styles.row, { gap: 18 }]}>
      <Avatar name={name} url={user.public.avatarUrl} size={88} />
      <View style={styles.rowText}>
        <Text style={[styles.title, { fontSize: 30 }]}>{name}</Text>
        {relationshipLabel[user.relationship] ? <Text style={styles.success}>{relationshipLabel[user.relationship]}</Text> : null}
      </View>
    </View>
    {user.public.bio ? <Text style={styles.body}>{user.public.bio}</Text> : null}
    {user.relationship === 'SELF'
      ? <Action title="Edit my profile" secondary onPress={() => router.push('/(app)/profile')} />
      : <RelationshipAction userId={user.id} name={name} relationship={user.relationship} />}

    <FriendsSection user={user} />
    {user.private ? <Section title="Private">
      <Detail label="Birth date" value={user.private.birthDate} />
      <Detail label="Phone" value={user.private.phone} />
    </Section> : null}
    <MusicSection user={user} />
  </Screen>;
}

function FriendsSection({ user }: { user: UserProfile }) {
  if (!user.friends) {
    return <Section title="Friends only">
      <Text style={styles.body}>Only {user.public.displayName}’s friends can see their real name and city.</Text>
    </Section>;
  }
  return <Section title="Friends only">
    <Detail label="Real name" value={user.friends.realName} />
    <Detail label="City" value={user.friends.city} />
  </Section>;
}

function MusicSection({ user }: { user: UserProfile }) {
  if (!user.music) {
    return <Section title="Music preferences">
      <Text style={styles.body}>{user.public.displayName} keeps their music preferences hidden.</Text>
    </Section>;
  }
  const { genres, tags } = user.music;
  return <Section title="Music preferences">
    {genres.length === 0 && tags.length === 0 ? <Text style={styles.body}>No music preferences yet.</Text> : null}
    {genres.length > 0 ? <View style={styles.chipRow}>{genres.map((genre) => <Chip key={genre} label={genre} />)}</View> : null}
    {tags.length > 0 ? <Text style={styles.body}>{tags.map((tag) => `#${tag}`).join('  ')}</Text> : null}
  </Section>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.panel}>
    <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
    {children}
  </View>;
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return <View style={{ gap: 2 }}>
    <Text style={styles.hint}>{label}</Text>
    <Text style={styles.label}>{value ?? 'Not shared'}</Text>
  </View>;
}
