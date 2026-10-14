import { useState } from 'react';

import { playlistTracks } from '../model/playlist-data';

export function usePlaylistEditor(collaborator: boolean) {
  const initialTracks = collaborator ? playlistTracks.slice(1) : playlistTracks.slice(0, 3);
  const [tracks, setTracks] = useState(() => [...initialTracks]);

  const moveTrack = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= tracks.length) return;

    setTracks((current) => {
      if (target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeTrack = (id: string) => {
    setTracks((current) => current.filter((track) => track.id !== id));
  };

  return { moveTrack, removeTrack, tracks };
}
