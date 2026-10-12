import { Add01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, Avatar, Button, SearchField, TextField, TrackRow } from '../../components/ui';
import { animateNextLayout, pressedFeedback } from '../../components/ui/interaction-feedback';
import playlistContent from '../../content/playlists.json';
import { goBackOrReplace } from '../../lib/navigation';
import { suggestedTracks } from '../../mocks/track-vote-examples';
import { usePlaybackStore } from '../../stores/playback.store';
import { colors, radius, spacing } from '../../theme';
import { ChoiceCard, SectionRow } from '../track-vote/track-vote-ui';
import { PlaylistHeader, PlaylistScreen, PlaylistTile, RoleBanner, playlistStyles } from './playlist-ui';

const playlistTracks = playlistContent.tracks;
type PlaylistTileTone = 'coral' | 'teal' | 'purple';

const removeActionWidth = 88;
const reorderThreshold = 36;
const reorderDistance = 88;

export function DiscoverPlaylistsScreen() {
  const router = useRouter();
  return <PlaylistScreen showNavigation testID="discover-playlists-screen">
    <PlaylistHeader title="Playlists" action />
    <AppText variant="h2">Collected by people,{`\n`}not an algorithm.</AppText>
    <View style={styles.homeActions}>
      <Button style={styles.flexButton} onPress={() => router.push('/playlists/create')}>Add playlist</Button>
      <Button style={styles.flexButton} variant="secondary" onPress={() => router.push('/playlists/mine')}>My playlists</Button>
    </View>
    <SearchField placeholder="Search playlists" />
    <SectionRow title="Featured" action="See all" onAction={() => router.push('/playlists/mine')} />
    <View style={playlistStyles.tileRow}>
      {playlistContent.featured.map((playlist) => <PlaylistTile
        key={playlist.title}
        {...playlist}
        tone={playlist.tone as PlaylistTileTone}
        onPress={() => router.push(playlist.target === 'read-only' ? '/playlists/read-only' : '/playlists/details')}
      />)}
    </View>
    <SectionRow title="Made by the community" />
    <Pressable accessibilityRole="button" onPress={() => router.push('/playlists/details')} style={({ pressed }) => [styles.communityRow, pressed && pressedFeedback]}>
      <View style={styles.smallArtwork} />
      <View style={styles.flexCopy}><AppText variant="navigationLabel">{playlistContent.community.title}</AppText><AppText variant="caption" color="text.muted">{playlistContent.community.meta}</AppText></View>
    </Pressable>
  </PlaylistScreen>;
}

export function MyPlaylistsScreen() {
  const router = useRouter();
  return <PlaylistScreen showNavigation testID="my-playlists-screen">
    <PlaylistHeader title="My playlists" action onBack={() => goBackOrReplace(router, '/playlists')} />
    <SectionRow title="Owned" />
    <View style={playlistStyles.tileRow}>
      {playlistContent.owned.map((playlist) => <PlaylistTile key={playlist.title} {...playlist} tone={playlist.tone as PlaylistTileTone} onPress={() => router.push('/playlists/details')} />)}
    </View>
    <SectionRow title="Collaborating" />
    <View style={playlistStyles.tileRow}>
      {playlistContent.collaborating.map((playlist) => <PlaylistTile key={playlist.title} {...playlist} tone={playlist.tone as PlaylistTileTone} onPress={() => router.push('/playlists/collaborate')} />)}
    </View>
  </PlaylistScreen>;
}

export function CreatePlaylistScreen() {
  const router = useRouter();
  const [name, setName] = useState(playlistContent.createDefaults.name);
  const [description, setDescription] = useState(playlistContent.createDefaults.description);
  const [visibility, setVisibility] = useState<'Public' | 'Private'>(playlistContent.createDefaults.visibility as 'Public' | 'Private');
  const [editAccess, setEditAccess] = useState<'Everyone' | 'Invited only'>(playlistContent.createDefaults.editAccess as 'Everyone' | 'Invited only');
  return <PlaylistScreen testID="create-playlist-screen">
    <PlaylistHeader title="Create playlist" onBack={() => goBackOrReplace(router, '/playlists')} />
    <AppText variant="h2">Start a new collection</AppText>
    <AppText variant="bodySmall" color="text.secondary">Create it alone or invite people to build the sequence together in real time.</AppText>
    <View style={playlistStyles.form}>
      <TextField label="Playlist name" value={name} onChangeText={setName} />
      <TextField label="Description" value={description} onChangeText={setDescription} />
      <AppText variant="navigationLabel">Visibility</AppText>
      <View accessibilityRole="radiogroup" style={styles.optionGroup}>
        {playlistContent.visibilityOptions.map((option) => <ChoiceCard key={option.value} {...option} selected={visibility === option.value} onPress={() => setVisibility(option.value as 'Public' | 'Private')} />)}
      </View>
      <AppText variant="navigationLabel">Who can edit?</AppText>
      <View accessibilityRole="radiogroup" style={styles.optionGroup}>
        {playlistContent.editAccessOptions.map((option) => <ChoiceCard key={option.value} {...option} selected={editAccess === option.value} onPress={() => setEditAccess(option.value as 'Everyone' | 'Invited only')} />)}
      </View>
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
  const startPlayback = usePlaybackStore((state) => state.start);
  const openPlayer = () => {
    startPlayback();
    router.push('/player');
  };
  return <PlaylistScreen showMiniPlayer showNavigation testID="playlist-details-screen">
    <PlaylistHeader title="Playlist" action onBack={() => goBackOrReplace(router, '/playlists')} />
    <PlaylistArtwork />
    <AppText variant="h2">{playlistContent.details.title}</AppText>
    <AppText variant="bodySmall" color="text.secondary">{playlistContent.details.meta}</AppText>
    <AppText variant="bodySmall" color="text.muted">{playlistContent.details.description}</AppText>
    <Button onPress={openPlayer}>Play</Button>
    <View style={styles.compactActions}>
      <Button size="small" style={styles.flexButton} variant="secondary" onPress={() => router.push('/playlists/edit')}>Edit</Button>
      <Button size="small" style={styles.flexButton} variant="secondary" onPress={() => router.push('/playlists/members')}>Members</Button>
    </View>
    <SectionRow title="Tracks" />
    {playlistTracks.map((track) => <Pressable
      key={track.id}
      accessibilityLabel={`Play ${track.title}`}
      accessibilityRole="button"
      onPress={openPlayer}
      style={({ pressed }) => pressed && pressedFeedback}
    ><TrackRow {...track} /></Pressable>)}
  </PlaylistScreen>;
}

function EditorTracks({ collaborator = false }: { collaborator?: boolean }) {
  const initial = collaborator ? playlistTracks.slice(1) : playlistTracks.slice(0, 3);
  const [tracks, setTracks] = useState(() => [...initial]);
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= tracks.length) return;
    setTracks((current) => {
      if (target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const remove = (id: string) => setTracks((current) => current.filter((track) => track.id !== id));
  return <>
    <SectionRow title={`${tracks.length} tracks`} />
    <AppText variant="caption" color="text.muted">{playlistContent.editor.instructions}</AppText>
    {tracks.map((track, index) => <SwipeableEditorTrack
      key={track.id}
      count={tracks.length}
      index={index}
      onMove={(direction) => move(index, direction)}
      onRemove={() => remove(track.id)}
      track={track}
    />)}
  </>;
}

function SwipeableEditorTrack({ count, index, onMove, onRemove, track }: {
  count: number;
  index: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  track: (typeof playlistTracks)[number];
}) {
  const horizontalOffset = useRef(new Animated.Value(0)).current;
  const verticalOffset = useRef(new Animated.Value(0)).current;
  const horizontalStart = useRef(0);
  const [dragging, setDragging] = useState(false);
  const position = useRef({ count, index, onMove });
  position.current = { count, index, onMove };

  const settleHorizontal = (open: boolean) => Animated.spring(horizontalOffset, {
    toValue: open ? -removeActionWidth : 0,
    useNativeDriver: true,
  }).start();

  const horizontalGesture = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: () => horizontalOffset.stopAnimation((value) => { horizontalStart.current = value; }),
    onPanResponderMove: (_event, gesture) => horizontalOffset.setValue(Math.max(-removeActionWidth, Math.min(0, horizontalStart.current + gesture.dx))),
    onPanResponderRelease: (_event, gesture) => settleHorizontal(horizontalStart.current + gesture.dx < -removeActionWidth / 2 || gesture.vx < -0.35),
    onPanResponderTerminate: () => settleHorizontal(false),
  })).current;

  const resetVerticalPosition = () => Animated.spring(verticalOffset, {
    damping: 18,
    stiffness: 220,
    toValue: 0,
    useNativeDriver: true,
  }).start(() => setDragging(false));

  const finishReorder = (direction: -1 | 1, releasedOffset = 0) => {
    const current = position.current;
    const canMove = direction === -1 ? current.index > 0 : current.index < current.count - 1;
    if (!canMove) {
      resetVerticalPosition();
      return;
    }
    current.onMove(direction);
    verticalOffset.setValue(releasedOffset - direction * reorderDistance);
    resetVerticalPosition();
  };

  const verticalGesture = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dy) > 4,
    onPanResponderGrant: () => {
      verticalOffset.stopAnimation();
      setDragging(true);
    },
    onPanResponderMove: (_event, gesture) => verticalOffset.setValue(Math.max(-96, Math.min(96, gesture.dy))),
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dy <= -reorderThreshold) finishReorder(-1, gesture.dy);
      else if (gesture.dy >= reorderThreshold) finishReorder(1, gesture.dy);
      else resetVerticalPosition();
    },
    onPanResponderTerminate: resetVerticalPosition,
  })).current;

  const removeWithAnimation = () => Animated.timing(horizontalOffset, {
    duration: 180,
    toValue: -500,
    useNativeDriver: true,
  }).start(onRemove);

  const accessibilityActions = [
    ...(index > 0 ? [{ name: 'decrement' as const, label: 'Move up' }] : []),
    ...(index < count - 1 ? [{ name: 'increment' as const, label: 'Move down' }] : []),
  ];

  return <Animated.View style={[
    styles.swipeTrack,
    dragging && styles.draggingTrack,
    { transform: [{ translateY: verticalOffset }, { scale: dragging ? 1.015 : 1 }] },
  ]}>
    <Pressable accessibilityLabel={`Remove ${track.title}`} accessibilityRole="button" onPress={removeWithAnimation} style={({ pressed }) => [styles.removeAction, pressed && pressedFeedback]}>
      <AppText variant="buttonLabel" color="text.onAccent">Remove</AppText>
    </Pressable>
    <Animated.View
      {...horizontalGesture.panHandlers}
      style={[styles.swipeForeground, { transform: [{ translateX: horizontalOffset }] }]}
      testID={`editor-row-${track.id}`}
    >
      <View>
        <TrackRow
          {...track}
          dragHandleProps={{
            accessibilityActions,
            accessibilityLabel: `Reorder ${track.title}`,
            onAccessibilityAction: (event) => {
              if (event.nativeEvent.actionName === 'decrement') finishReorder(-1);
              if (event.nativeEvent.actionName === 'increment') finishReorder(1);
            },
            ...verticalGesture.panHandlers,
          }}
          mode="dragging"
          status={track.id === 'night-drive' ? 'Nada is moving this track' : undefined}
        />
      </View>
    </Animated.View>
  </Animated.View>;
}

export function OwnerPlaylistEditorScreen() {
  const router = useRouter();
  return <PlaylistScreen showMiniPlayer showNavigation testID="owner-playlist-editor-screen">
    <PlaylistHeader title="Edit playlist" onBack={() => goBackOrReplace(router, '/playlists/details')} />
    <RoleBanner role="owner" title="You're the owner" />
    <View style={styles.editorTools}>
      <InlineIconAction label="Add track" onPress={() => router.push('/playlists/add-track')} />
      <InlineIconAction label="Members" icon="members" onPress={() => router.push('/playlists/members')} />
    </View>
    <EditorTracks />
    <AppText variant="caption" color="text.muted" style={styles.note}>{playlistContent.editor.ownerSync}</AppText>
  </PlaylistScreen>;
}

export function CollaboratorPlaylistEditorScreen() {
  const router = useRouter();
  return <PlaylistScreen showMiniPlayer showNavigation testID="collaborator-playlist-editor-screen">
    <PlaylistHeader title="Edit playlist" action onBack={() => goBackOrReplace(router, '/playlists/mine')} />
    <RoleBanner role="collaborator" title="You can edit" />
    <AppText variant="caption" color="text.muted" style={styles.note}>{playlistContent.editor.collaboratorSync}</AppText>
    <View style={styles.editorTools}>
      <InlineIconAction label="Add track" onPress={() => router.push('/playlists/add-track')} />
    </View>
    <EditorTracks collaborator />
    <AppText variant="caption" color="text.muted" style={styles.note}>{playlistContent.editor.collaboratorPermissions}</AppText>
  </PlaylistScreen>;
}

export function ReadOnlyPlaylistScreen() {
  const router = useRouter();
  const startPlayback = usePlaybackStore((state) => state.start);
  const openPlayer = () => {
    startPlayback();
    router.push('/player');
  };
  return <PlaylistScreen showMiniPlayer showNavigation testID="read-only-playlist-screen">
    <PlaylistHeader title={playlistContent.readOnly.title} onBack={() => goBackOrReplace(router, '/playlists')} />
    <PlaylistArtwork />
    <AppText variant="h2">{playlistContent.readOnly.title}</AppText>
    <AppText variant="bodySmall" color="text.secondary">{playlistContent.readOnly.meta}</AppText>
    <Button onPress={openPlayer}>Play</Button>
    <SectionRow title="Track list" />
    {playlistTracks.map((track) => <Pressable
      key={track.id}
      accessibilityLabel={`Play ${track.title}`}
      accessibilityRole="button"
      onPress={openPlayer}
      style={({ pressed }) => pressed && pressedFeedback}
    ><TrackRow {...track} /></Pressable>)}
  </PlaylistScreen>;
}

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

function InlineIconAction({ icon = 'add', label, onPress }: { icon?: 'add' | 'members'; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.inlineAction, pressed && pressedFeedback]}><AppIcon icon={icon === 'add' ? Add01Icon : UserGroupIcon} size="standard" /><AppText variant="navigationLabel" color="action.secondary">{label}</AppText></Pressable>;
}

function MemberRow({ initials, name, onPress, role }: { initials: string; name: string; onPress?: () => void; role: string }) {
  return <Pressable disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={({ pressed }) => [styles.memberRow, pressed && pressedFeedback]}><Avatar initials={initials} size="medium" /><View style={styles.flexCopy}><AppText variant="navigationLabel">{name}</AppText><AppText variant="caption" color="text.muted">{role === 'Friend' ? 'Friend · can collaborate' : role}</AppText></View><View style={styles.rolePill}><AppText variant="caption">{role}</AppText></View></Pressable>;
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
  compactActions: { width: '100%', flexDirection: 'row', gap: spacing[8] },
  homeActions: { width: '100%', flexDirection: 'row', gap: spacing[12] },
  flexButton: { flex: 1 },
  editorTools: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  swipeTrack: { width: '100%', minHeight: 72, overflow: 'hidden', borderRadius: radius.medium, backgroundColor: colors.background.surface },
  draggingTrack: { zIndex: 20, opacity: 0.94 },
  swipeForeground: { width: '100%', minHeight: 72, backgroundColor: colors.background.surface },
  removeAction: { position: 'absolute', top: 0, right: 0, bottom: 0, width: removeActionWidth, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.action.primary },
  optionGroup: { width: '100%', gap: spacing[8] },
  searchResult: { width: '100%', minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  disabledResult: { opacity: 0.55 },
  resultStatus: { minWidth: 82, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  memberRow: { width: '100%', minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  rolePill: { paddingHorizontal: spacing[12], paddingVertical: spacing[8], borderRadius: radius.full, backgroundColor: colors.category.secondary },
  inviteUsername: { width: '100%', minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[16], borderRadius: radius.medium, backgroundColor: colors.background.surface },
});
