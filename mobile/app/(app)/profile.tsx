import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ApiError } from '../../src/api/errors';
import { getGenres, getMyProfile, updateMyProfile, userKeys, type MyProfile, type ProfileUpdate, type ProfileVisibility } from '../../src/api/users';
import { Action, Chip, colors, ErrorText, Field, Screen, styles } from '../../src/components/ui';
import { useSessionStore } from '../../src/stores/session.store';

const MAX_MUSIC_ITEMS = 10;

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = [
  { value: 'PUBLIC', label: 'Everyone' },
  { value: 'FRIENDS', label: 'Friends' },
  { value: 'PRIVATE', label: 'Only me' },
];

type ProfileForm = {
  displayName: string; bio: string; avatarUrl: string;
  realName: string; city: string;
  birthDate: string; phone: string;
  genres: string[]; tags: string; visibility: ProfileVisibility;
};

function toForm(profile: MyProfile): ProfileForm {
  return {
    displayName: profile.public.displayName,
    bio: profile.public.bio ?? '',
    avatarUrl: profile.public.avatarUrl ?? '',
    realName: profile.friends.realName ?? '',
    city: profile.friends.city ?? '',
    birthDate: profile.private.birthDate ?? '',
    phone: profile.private.phone ?? '',
    genres: profile.music.genres,
    tags: profile.music.tags.join(', '),
    visibility: profile.music.visibility,
  };
}

export function parseTags(text: string): string[] {
  const tags = text.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  return [...new Set(tags)];
}

/** Empty strings are sent as-is: the backend stores them as "not set". */
function toUpdate(form: ProfileForm): ProfileUpdate {
  return {
    public: { displayName: form.displayName.trim(), bio: form.bio, avatarUrl: form.avatarUrl },
    friends: { realName: form.realName, city: form.city },
    private: { birthDate: form.birthDate, phone: form.phone },
    music: { genres: form.genres, tags: parseTags(form.tags), visibility: form.visibility },
  };
}

function validate(form: ProfileForm): string {
  if (!form.displayName.trim()) return 'Display name cannot be empty.';
  if (form.birthDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate.trim())) return 'Write your birth date as YYYY-MM-DD.';
  if (parseTags(form.tags).length > MAX_MUSIC_ITEMS) return `Use at most ${MAX_MUSIC_ITEMS} tags.`;
  return '';
}

export default function ProfileScreen() {
  const profile = useQuery({ queryKey: userKeys.me, queryFn: getMyProfile });
  if (profile.data) return <ProfileEditor initial={profile.data} />;
  return <Screen>
    <Text style={styles.eyebrow}>MY PROFILE</Text>
    {profile.isError
      ? <><ErrorText>Could not load your profile. {profile.error.message}</ErrorText><Action title="Try again" onPress={() => void profile.refetch()} /></>
      : <ActivityIndicator color={colors.accent} />}
  </Screen>;
}

function ProfileEditor({ initial }: { initial: MyProfile }) {
  const queryClient = useQueryClient();
  const sessionUser = useSessionStore((state) => state.user);
  const setUser = useSessionStore((state) => state.setUser);
  const genres = useQuery({ queryKey: userKeys.genres, queryFn: getGenres, staleTime: Infinity });
  const [form, setForm] = useState(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const update = (patch: Partial<ProfileForm>) => { setForm({ ...form, ...patch }); setMessage(''); };
  const toggleGenre = (genre: string) => update({
    genres: form.genres.includes(genre) ? form.genres.filter((item) => item !== genre) : [...form.genres, genre],
  });

  async function save() {
    const problem = validate(form);
    setError(problem); setMessage('');
    if (problem) return;
    setSaving(true);
    try {
      const saved = await updateMyProfile(toUpdate(form));
      queryClient.setQueryData(userKeys.me, saved);
      await queryClient.invalidateQueries({ queryKey: [...userKeys.all, 'profile'] });
      setForm(toForm(saved));
      if (sessionUser) setUser({ ...sessionUser, displayName: saved.public.displayName });
      setMessage('Profile saved.');
    } catch (cause) {
      setError(saveErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return <Screen>
    <Text style={styles.eyebrow}>MY PROFILE</Text>
    <Text style={styles.title}>Profile</Text>

    <Section title="Public" audience="Everyone can see this.">
      <Field label="Display name" value={form.displayName} onChangeText={(displayName) => update({ displayName })} autoCapitalize="words" maxLength={80} />
      <Field label="Bio" value={form.bio} onChangeText={(bio) => update({ bio })} multiline maxLength={280} autoCapitalize="sentences" autoCorrect />
      <Field label="Avatar URL" value={form.avatarUrl} onChangeText={(avatarUrl) => update({ avatarUrl })} keyboardType="url"
        placeholder="https://…" hint="A link to a picture of you." />
    </Section>

    <Section title="Friends only" audience="Only people you have accepted as friends.">
      <Field label="Real name" value={form.realName} onChangeText={(realName) => update({ realName })} autoCapitalize="words" maxLength={80} />
      <Field label="City" value={form.city} onChangeText={(city) => update({ city })} autoCapitalize="words" maxLength={80} />
    </Section>

    <Section title="Private" audience="Only you. Never shown to anyone else.">
      <Field label="Birth date" value={form.birthDate} onChangeText={(birthDate) => update({ birthDate })} placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation" maxLength={10} />
      <Field label="Phone" value={form.phone} onChangeText={(phone) => update({ phone })} keyboardType="phone-pad" maxLength={20} />
    </Section>

    <Section title="Music preferences" audience="You choose who can see these.">
      <Text style={styles.label}>Who can see them</Text>
      <View accessibilityRole="radiogroup" style={styles.chipRow}>
        {VISIBILITY_OPTIONS.map((option) => <Chip key={option.value} role="radio" label={option.label}
          selected={form.visibility === option.value} onPress={() => update({ visibility: option.value })} />)}
      </View>
      <Text style={styles.label}>Genres ({form.genres.length}/{MAX_MUSIC_ITEMS})</Text>
      {genres.isError ? <ErrorText>Could not load the genre list.</ErrorText> : null}
      <View style={styles.chipRow}>
        {(genres.data ?? []).map((genre) => <Chip key={genre} label={genre} selected={form.genres.includes(genre)}
          disabled={!form.genres.includes(genre) && form.genres.length >= MAX_MUSIC_ITEMS} onPress={() => toggleGenre(genre)} />)}
      </View>
      <Field label="Tags" value={form.tags} onChangeText={(tags) => update({ tags })} placeholder="road trip, 90s, vinyl"
        hint={`Anything else you like, separated by commas (up to ${MAX_MUSIC_ITEMS}).`} />
    </Section>

    {error ? <ErrorText>{error}</ErrorText> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text> : null}
    <Action title="Save profile" loading={saving} disabled={saving} onPress={() => void save()} />
  </Screen>;
}

function Section({ title, audience, children }: { title: string; audience: string; children: ReactNode }) {
  return <View style={styles.panel}>
    <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
    <Text style={styles.hint}>{audience}</Text>
    {children}
  </View>;
}

function saveErrorMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.details.length > 0) return `Please fix: ${cause.details.join('; ')}`;
  return cause instanceof Error ? cause.message : 'Could not save your profile.';
}
