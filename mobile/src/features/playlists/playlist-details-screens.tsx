import { UserGroupIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon, AppText, Button, TextField, TrackRow } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import playlistContent from '../../content/playlists.json';
import { goBackOrReplace } from '../../lib/navigation';
import { usePlaybackStore } from '../../stores/playback.store';
import { ChoiceCard, SectionRow } from '../track-vote/track-vote-ui';
import { playlistTracks } from './model/playlist-data';
import { playlistScreenStyles as styles } from './playlist-screen.styles';
import { PlaylistHeader, PlaylistScreen, playlistStyles } from './playlist-ui';

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
