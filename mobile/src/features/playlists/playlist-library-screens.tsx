import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Button, SearchField } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import playlistContent from '../../content/playlists.json';
import { goBackOrReplace } from '../../lib/navigation';
import { SectionRow } from '../track-vote/track-vote-ui';
import { type PlaylistTileTone } from './model/playlist-data';
import { playlistScreenStyles as styles } from './playlist-screen.styles';
import { PlaylistHeader, PlaylistScreen, PlaylistTile, playlistStyles } from './playlist-ui';

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
