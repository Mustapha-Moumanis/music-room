import { Add01Icon, HeartIcon, PauseIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, Avatar, Button, SearchField, Select, TextField, TrackRow } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { queuedTracks, suggestedTracks } from '../../mocks/track-vote-examples';
import { colors, radius, spacing } from '../../theme';
import { SectionRow } from '../track-vote/track-vote-ui';
import { PlaylistHeader, PlaylistScreen, PlaylistTile, RoleBanner, playlistStyles } from './playlist-ui';

const playlistTracks = [
  { id: 'better-off-alone', title: 'Better Off Alone', artist: 'The Midnight', duration: '3:56' },
  ...queuedTracks,
];

export function DiscoverPlaylistsScreen() {
  const router = useRouter();
  return <PlaylistScreen showNavigation testID="discover-playlists-screen">
    <PlaylistHeader title="Playlists" action onBack={() => router.back()} onAction={() => router.push('/playlists/mine')} />
    <AppText variant="h2">Collected by people,{`\n`}not an algorithm.</AppText>
    <SearchField placeholder="Search playlists" />
    <SectionRow title="Featured" action="See all" onAction={() => router.push('/playlists/mine')} />
    <View style={playlistStyles.tileRow}>
      <PlaylistTile title="Friends Tape" meta="4 members · 24 tracks" tone="teal" onPress={() => router.push('/playlists/read-only')} />
      <PlaylistTile title="Sunday Vinyl" meta="18 tracks · Soul / Jazz" tone="purple" onPress={() => router.push('/playlists/details')} />
    </View>
    <SectionRow title="Made by the community" />
    <Pressable accessibilityRole="button" onPress={() => router.push('/playlists/details')} style={({ pressed }) => [styles.communityRow, pressed && pressedFeedback]}>
      <View style={styles.smallArtwork} />
      <View style={styles.flexCopy}><AppText variant="navigationLabel">Desert Drive</AppText><AppText variant="caption" color="text.muted">32 tracks · by Yassine</AppText></View>
    </Pressable>
  </PlaylistScreen>;
}

export function MyPlaylistsScreen() {
  const router = useRouter();
  return <PlaylistScreen showNavigation testID="my-playlists-screen">
    <PlaylistHeader title="My playlists" action onBack={() => router.back()} />
    <Pressable accessibilityRole="button" onPress={() => router.push('/playlists/create')} style={({ pressed }) => [styles.inlineAction, pressed && pressedFeedback]}>
      <AppIcon icon={Add01Icon} size="standard" /><AppText variant="navigationLabel" color="action.primary">Create playlist</AppText>
    </Pressable>
    <SectionRow title="Owned" />
    <View style={playlistStyles.tileRow}>
      <PlaylistTile title="Late Night Drive" meta="18 tracks · owned" onPress={() => router.push('/playlists/details')} />
      <PlaylistTile title="Soft Focus" meta="12 tracks · private" onPress={() => router.push('/playlists/details')} />
    </View>
    <SectionRow title="Collaborating" />
    <View style={playlistStyles.tileRow}>
      <PlaylistTile title="Friends Tape" meta="4 members · editing" tone="teal" onPress={() => router.push('/playlists/collaborate')} />
      <PlaylistTile title="Studio Picks" meta="3 members · 9 tracks" tone="teal" onPress={() => router.push('/playlists/collaborate')} />
    </View>
  </PlaylistScreen>;
}

export function CreatePlaylistScreen() {
  const router = useRouter();
  const [name, setName] = useState('Late Night Drive');
  const [description, setDescription] = useState('Warm synths for quiet roads');
  return <PlaylistScreen testID="create-playlist-screen">
    <PlaylistHeader title="Create playlist" onBack={() => router.back()} />
    <AppText variant="h2">Start a new collection</AppText>
    <AppText variant="bodySmall" color="text.secondary">Create it alone or invite people to build the sequence together in real time.</AppText>
    <View style={playlistStyles.form}>
      <TextField label="Playlist name" value={name} onChangeText={setName} />
      <TextField label="Description" value={description} onChangeText={setDescription} />
      <Select label="Visibility" value="Friends only" />
      <Select label="Collaboration" value="Allow collaborators" />
    </View>
    <View style={styles.note}><AppIcon icon={UserGroupIcon} size="standard" /><AppText color="text.secondary" style={styles.flexCopy}>You can invite collaborators after the playlist is created.</AppText></View>
    <View style={playlistStyles.grow} />
    <Button onPress={() => router.replace('/playlists/details')}>Create playlist</Button>
  </PlaylistScreen>;
}

function PlaylistArtwork() {
  return <View style={styles.playlistArtwork}><View style={styles.artCircle} /><View style={styles.artCard} /><View style={styles.artTape} /></View>;
}

export function PlaylistDetailsScreen() {
  const router = useRouter();
  return <PlaylistScreen showMiniPlayer showNavigation testID="playlist-details-screen">
    <PlaylistHeader title="Playlist" action onBack={() => router.back()} />
    <PlaylistArtwork />
    <AppText variant="h2">Late Night Drive</AppText>
    <AppText variant="bodySmall" color="text.secondary">18 tracks · 1h 12m · Friends only</AppText>
    <AppText variant="bodySmall" color="text.muted">Warm synths, soft guitars, and a little neon for late roads.</AppText>
    <View style={styles.actionRow}><Button style={styles.flexButton} onPress={() => router.push('/playlists/radio')}>Play</Button><Button style={styles.flexButton} variant="secondary" onPress={() => router.push('/playlists/edit')}>Edit</Button></View>
    <SectionRow title="Tracks" action="View all" />
    {playlistTracks.slice(0, 2).map((track) => <TrackRow key={track.id} {...track} />)}
  </PlaylistScreen>;
}

function Presence() {
  return <View style={styles.presence}><Avatar initials="NA" size="medium" /><View style={styles.flexCopy}><AppText variant="bodySmall">Nada is editing</AppText><AppText variant="caption" color="text.muted">Moving a track</AppText></View></View>;
}

function EditorTracks({ collaborator = false }: { collaborator?: boolean }) {
  const router = useRouter();
  const initial = collaborator ? playlistTracks.slice(1) : playlistTracks.slice(0, 3);
  const [tracks, setTracks] = useState(() => [...initial]);
  const moveFirst = (id: string) => setTracks((current) => {
    const picked = current.find((track) => track.id === id);
    return picked ? [picked, ...current.filter((track) => track.id !== id)] : current;
  });
  return <>
    <SectionRow title="Drag to reorder" action={collaborator ? 'Add track' : `${tracks.length + 1} tracks`} onAction={() => router.push('/playlists/add-track')} />
    {tracks.map((track) => <Pressable key={track.id} accessibilityLabel={`Move ${track.title} to top`} accessibilityRole="button" onPress={() => moveFirst(track.id)} style={({ pressed }) => pressed && pressedFeedback}>
      <TrackRow {...track} mode="dragging" />
    </Pressable>)}
  </>;
}

export function OwnerPlaylistEditorScreen() {
  const router = useRouter();
  return <PlaylistScreen showMiniPlayer showNavigation testID="owner-playlist-editor-screen">
    <PlaylistHeader title="Edit playlist" onBack={() => router.back()} />
    <RoleBanner role="owner" title="You're the owner" />
    <Presence />
    <View style={styles.editorTools}>
      <InlineIconAction label="Add track" onPress={() => router.push('/playlists/add-track')} />
      <InlineIconAction label="Members" icon="members" onPress={() => router.push('/playlists/members')} />
    </View>
    <EditorTracks />
    <AppText variant="caption" color="text.muted" style={styles.note}>Swipe or open track actions to remove a song.</AppText>
  </PlaylistScreen>;
}

export function CollaboratorPlaylistEditorScreen() {
  const router = useRouter();
  return <PlaylistScreen showMiniPlayer showNavigation testID="collaborator-playlist-editor-screen">
    <PlaylistHeader title="Edit playlist" action onBack={() => router.back()} />
    <RoleBanner role="collaborator" title="You can edit" />
    <Presence />
    <AppText variant="caption" color="text.muted" style={styles.note}>Changes sync instantly for everyone in this playlist.</AppText>
    <EditorTracks collaborator />
    <AppText variant="caption" color="text.muted" style={styles.note}>You can add, move, and remove tracks, but only the owner can manage members or delete the playlist.</AppText>
  </PlaylistScreen>;
}

export function ReadOnlyPlaylistScreen() {
  const router = useRouter();
  return <PlaylistScreen showMiniPlayer showNavigation testID="read-only-playlist-screen">
    <PlaylistHeader title="Friends Tape" onBack={() => router.back()} />
    <RoleBanner role="read-only" title="Read-only playlist" />
    <PlaylistArtwork />
    <AppText variant="h2">Friends Tape</AppText>
    <AppText variant="bodySmall" color="text.secondary">24 tracks · 4 members · read only</AppText>
    <Button onPress={() => router.push('/playlists/radio')}>Play</Button>
    <SectionRow title="Track list" />
    {playlistTracks.slice(0, 2).map((track) => <TrackRow key={track.id} {...track} />)}
  </PlaylistScreen>;
}

export function AddTrackScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('midnight');
  const [added, setAdded] = useState<Set<string>>(() => new Set(['night-drive']));
  return <PlaylistScreen testID="add-track-screen">
    <PlaylistHeader title="Add track" onBack={() => router.back()} />
    <SearchField value={query} onChangeText={setQuery} />
    <SectionRow title="Search results" />
    {suggestedTracks.map((track) => {
      const selected = added.has(track.id);
      return <Pressable key={track.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => setAdded((current) => new Set(current).add(track.id))} style={({ pressed }) => [styles.searchResult, pressed && pressedFeedback]}>
        <View style={[styles.smallArtwork, selected && styles.addedArtwork]} /><View style={styles.flexCopy}><AppText variant="navigationLabel">{track.title}</AppText><AppText variant="caption" color="text.muted">{track.artist}</AppText></View><AppIcon icon={Add01Icon} size="standard" tone={selected ? 'secondary' : 'default'} />
      </Pressable>;
    })}
    <AppText variant="caption" color="text.muted" style={styles.note}>Added tracks appear instantly for everyone currently editing.</AppText>
    <View style={playlistStyles.grow} /><Button onPress={() => router.back()}>Done</Button>
  </PlaylistScreen>;
}

const initialMembers = [
  { id: 'owner', initials: 'SH', name: 'Souad Hilal', role: 'Owner' },
  { id: 'nada', initials: 'NA', name: 'Nada Amrani', role: 'Collaborator' },
  { id: 'omar', initials: 'OE', name: 'Omar El Idrissi', role: 'Invited' },
];

export function PlaylistMembersScreen() {
  const router = useRouter();
  const [invited, setInvited] = useState(false);
  return <PlaylistScreen testID="playlist-members-screen">
    <PlaylistHeader title="Members" action onBack={() => router.back()} />
    <SectionRow title="People" action="Invite" />
    {initialMembers.map((member) => <MemberRow key={member.id} {...member} />)}
    <SectionRow title="Invite someone" />
    <MemberRow initials="SB" name="Sara Benali" role={invited ? 'Invited' : 'Friend'} onPress={() => setInvited(true)} />
    <Pressable accessibilityRole="button" onPress={() => setInvited(true)} style={({ pressed }) => [styles.inviteUsername, pressed && pressedFeedback]}>
      <AppIcon icon={UserGroupIcon} size="standard" /><View style={styles.flexCopy}><AppText variant="navigationLabel">Invite by username</AppText><AppText variant="caption" color="text.muted">Add another collaborator</AppText></View><AppIcon icon={Add01Icon} size="standard" />
    </Pressable>
    <View style={playlistStyles.grow} /><Button onPress={() => router.replace('/playlists/edit')}>Save member changes</Button>
  </PlaylistScreen>;
}

export function PlaylistRadioScreen() {
  const router = useRouter();
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  return <PlaylistScreen showMiniPlayer showNavigation testID="playlist-radio-screen">
    <PlaylistHeader title="Playlist radio" action onBack={() => router.back()} />
    <View style={styles.radioHero}><AppIcon icon={PauseIcon} size="standard" /><AppText variant="caption" color="action.primary">RADIO FROM PLAYLIST</AppText><AppText variant="h4">Late Night Drive Radio</AppText><AppText variant="bodySmall" color="text.secondary">Continuous playback based on the tracks and mood of this playlist.</AppText></View>
    <View style={styles.nowPlaying}><View style={styles.playingArtwork} /><View style={styles.flexCopy}><AppText variant="navigationLabel">Better Off Alone</AppText><AppText variant="caption" color="text.muted">The Midnight</AppText></View><Pressable accessibilityLabel={playing ? 'Pause radio' : 'Play radio'} accessibilityRole="button" onPress={() => setPlaying((value) => !value)}><AppIcon icon={PauseIcon} size="standard" /></Pressable></View>
    <SectionRow title="Up next" />
    {queuedTracks.slice(1, 3).map((track) => <TrackRow key={track.id} {...track} />)}
    <View style={styles.radioActions}>
      <RadioAction icon={HeartIcon} label={liked ? 'Liked' : 'Like'} onPress={() => setLiked((value) => !value)} />
      <RadioAction icon={Add01Icon} label="Add" onPress={() => router.push('/playlists/add-track')} />
      <RadioAction icon={PauseIcon} label="Stop" onPress={() => setPlaying(false)} />
    </View>
  </PlaylistScreen>;
}

function InlineIconAction({ icon = 'add', label, onPress }: { icon?: 'add' | 'members'; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.inlineAction, pressed && pressedFeedback]}><AppIcon icon={icon === 'add' ? Add01Icon : UserGroupIcon} size="standard" /><AppText variant="navigationLabel" color="action.secondary">{label}</AppText></Pressable>;
}

function MemberRow({ initials, name, onPress, role }: { initials: string; name: string; onPress?: () => void; role: string }) {
  return <Pressable disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={({ pressed }) => [styles.memberRow, pressed && pressedFeedback]}><Avatar initials={initials} size="medium" /><View style={styles.flexCopy}><AppText variant="navigationLabel">{name}</AppText><AppText variant="caption" color="text.muted">{role === 'Friend' ? 'Friend · can collaborate' : role}</AppText></View><View style={styles.rolePill}><AppText variant="caption">{role}</AppText></View></Pressable>;
}

function RadioAction({ icon, label, onPress }: { icon: Parameters<typeof AppIcon>[0]['icon']; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.radioAction, pressed && pressedFeedback]}><AppIcon icon={icon} size="standard" /><AppText variant="caption">{label}</AppText></Pressable>;
}

const styles = StyleSheet.create({
  flexCopy: { minWidth: 0, flex: 1, gap: spacing[4] },
  inlineAction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing[8] },
  communityRow: { alignSelf: 'flex-start', minWidth: 192, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  smallArtwork: { width: spacing[48], height: spacing[48], borderRadius: radius.small, backgroundColor: colors.category.secondary },
  addedArtwork: { backgroundColor: colors.action.secondary },
  note: { width: '100%', padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  playlistArtwork: { width: '100%', height: 190, overflow: 'hidden', borderRadius: radius.media, backgroundColor: colors.background.surface },
  artCircle: { position: 'absolute', left: -36, top: -18, width: 220, height: 220, borderRadius: radius.full, backgroundColor: colors.background.app },
  artCard: { position: 'absolute', right: 24, bottom: 20, width: 192, height: 116, borderRadius: radius.medium, backgroundColor: colors.action.primary },
  artTape: { position: 'absolute', right: 48, top: 18, width: 127, height: 56, backgroundColor: colors.text.primary, transform: [{ rotate: '5deg' }] },
  actionRow: { width: '100%', flexDirection: 'row', gap: spacing[12] },
  flexButton: { flex: 1 },
  presence: { width: '100%', minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing[12], paddingHorizontal: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  editorTools: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  searchResult: { width: '100%', minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  memberRow: { width: '100%', minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  rolePill: { paddingHorizontal: spacing[12], paddingVertical: spacing[8], borderRadius: radius.full, backgroundColor: colors.category.secondary },
  inviteUsername: { width: '100%', minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[16], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  radioHero: { width: '100%', minHeight: 230, alignItems: 'center', justifyContent: 'center', gap: spacing[12], padding: spacing[24], borderRadius: radius.media, backgroundColor: colors.background.surface },
  nowPlaying: { alignSelf: 'flex-start', minWidth: 192, minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.card, backgroundColor: colors.background.surface },
  playingArtwork: { width: 56, height: 56, borderRadius: radius.small, backgroundColor: colors.action.primary },
  radioActions: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  radioAction: { minWidth: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: spacing[4] },
});
