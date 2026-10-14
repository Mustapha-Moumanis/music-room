import { Add01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon, AppText, Avatar, Button, SearchField } from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import playlistContent from '../../content/playlists.json';
import { goBackOrReplace } from '../../lib/navigation';
import { suggestedTracks } from '../../mocks/track-vote-examples';
import { SectionRow } from '../track-vote/track-vote-ui';
import { playlistScreenStyles as styles } from './playlist-screen.styles';
import { PlaylistHeader, PlaylistScreen, playlistStyles } from './playlist-ui';

export function AddTrackScreen() {
  const router = useRouter();
  const [query, setQuery] = useState(playlistContent.addTrack.initialQuery);
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  const existing = new Set(playlistContent.addTrack.existingTrackIds);
  const visibleTracks = suggestedTracks.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(query.trim().toLowerCase()));
  const toggleAdded = (id: string) => {
    animateNextLayout();
    setAdded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  return <PlaylistScreen testID="add-track-screen">
    <PlaylistHeader title="Add track" onBack={() => goBackOrReplace(router, '/playlists/edit')} />
    <SearchField value={query} onChangeText={setQuery} />
    <SectionRow title="Search results" />
    {visibleTracks.map((track) => {
      const selected = added.has(track.id);
      const alreadyExists = existing.has(track.id);
      return <Pressable key={track.id} disabled={alreadyExists} accessibilityRole="checkbox" accessibilityState={{ checked: selected || alreadyExists, disabled: alreadyExists }} onPress={() => toggleAdded(track.id)} style={({ pressed }) => [styles.searchResult, alreadyExists && styles.disabledResult, pressed && pressedFeedback]}>
        <View style={[styles.smallArtwork, selected && styles.addedArtwork]} /><View style={styles.flexCopy}><AppText variant="navigationLabel">{track.title}</AppText><AppText variant="caption" color="text.muted">{track.artist}</AppText></View><View style={styles.resultStatus}><AppText variant="caption" color={selected ? 'action.secondary' : 'text.secondary'}>{alreadyExists ? 'Already added' : selected ? 'Added' : 'Add'}</AppText></View>
      </Pressable>;
    })}
    {visibleTracks.length === 0 ? <AppText color="text.secondary">No tracks match “{query}”.</AppText> : null}
    <AppText variant="caption" color="text.muted" style={styles.note}>Added tracks appear instantly for everyone currently editing.</AppText>
    <View style={playlistStyles.grow} /><Button onPress={() => goBackOrReplace(router, '/playlists/edit')}>Done</Button>
  </PlaylistScreen>;
}

export function PlaylistMembersScreen() {
  const router = useRouter();
  const [invited, setInvited] = useState(false);
  const invite = () => {
    animateNextLayout();
    setInvited(true);
  };
  return <PlaylistScreen testID="playlist-members-screen">
    <PlaylistHeader title="Members" action onBack={() => goBackOrReplace(router, '/playlists/edit')} />
    <SectionRow title="People" />
    {playlistContent.members.map((member) => <MemberRow key={member.id} {...member} />)}
    <SectionRow title="Invite someone" />
    <MemberRow {...playlistContent.inviteCandidate} role={invited ? 'Invited' : playlistContent.inviteCandidate.role} onPress={invite} />
    <Pressable accessibilityRole="button" onPress={invite} style={({ pressed }) => [styles.inviteUsername, pressed && pressedFeedback]}>
      <AppIcon icon={UserGroupIcon} size="standard" /><View style={styles.flexCopy}><AppText variant="navigationLabel">Invite by username</AppText><AppText variant="caption" color="text.muted">Add another collaborator</AppText></View><AppIcon icon={Add01Icon} size="standard" />
    </Pressable>
    <View style={playlistStyles.grow} /><Button onPress={() => router.replace('/playlists/edit')}>Save member changes</Button>
  </PlaylistScreen>;
}

function MemberRow({ initials, name, onPress, role }: { initials: string; name: string; onPress?: () => void; role: string }) {
  return <Pressable disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={({ pressed }) => [styles.memberRow, pressed && pressedFeedback]}><Avatar initials={initials} size="medium" /><View style={styles.flexCopy}><AppText variant="navigationLabel">{name}</AppText><AppText variant="caption" color="text.muted">{role === 'Friend' ? 'Friend · can collaborate' : role}</AppText></View><View style={styles.rolePill}><AppText variant="caption">{role}</AppText></View></Pressable>;
}
