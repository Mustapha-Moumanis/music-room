import { useRouter } from 'expo-router';

import { MiniPlayer } from '../../components/ui';
import systemContent from '../../content/system.json';
import { usePlaybackStore } from '../../stores/playback.store';

export function PlaybackMiniPlayer() {
  const router = useRouter();
  const hasStarted = usePlaybackStore((state) => state.hasStarted);
  const playing = usePlaybackStore((state) => state.playing);
  const toggle = usePlaybackStore((state) => state.toggle);

  if (!hasStarted) return null;

  return <MiniPlayer
    title={systemContent.currentTrack.title}
    artist={systemContent.currentTrack.artist}
    state={playing ? 'playing' : 'paused'}
    onOpenPress={() => router.push('/player')}
    onPlayPausePress={toggle}
  />;
}
