import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { searchUsers, userKeys } from '../../src/api/users';
import { RelationshipAction, relationshipLabel } from '../../src/components/relationship-action';
import { colors, ErrorText, Field, Screen, styles } from '../../src/components/ui';
import { UserRow } from '../../src/components/user-row';
import { useDebounced } from '../../src/lib/use-debounced';

const MIN_QUERY = 2;

export default function PeopleScreen() {
  const [query, setQuery] = useState('');
  const term = useDebounced(query.trim());
  const ready = term.length >= MIN_QUERY;
  const results = useQuery({ queryKey: userKeys.search(term), queryFn: () => searchUsers(term), enabled: ready });

  return <Screen>
    <Text style={styles.eyebrow}>PEOPLE</Text>
    <Text style={styles.title}>Find people</Text>
    <Field label="Search by name" value={query} onChangeText={setQuery} placeholder="At least 2 letters" autoFocus
      autoCapitalize="words" returnKeyType="search" maxLength={50} />
    {!ready ? <Text style={styles.body}>Type a display name to find someone to add.</Text> : null}
    {ready && results.isPending ? <ActivityIndicator color={colors.accent} /> : null}
    {ready && results.isError ? <ErrorText>Search failed. {results.error.message}</ErrorText> : null}
    {ready && results.data?.length === 0 ? <Text style={styles.body}>No one called “{term}” yet.</Text> : null}
    {ready ? results.data?.map((user) => <UserRow key={user.id} user={user} subtitle={relationshipLabel[user.relationship]}
      action={<RelationshipAction compact userId={user.id} name={user.displayName} relationship={user.relationship} />} />) : null}
  </Screen>;
}
