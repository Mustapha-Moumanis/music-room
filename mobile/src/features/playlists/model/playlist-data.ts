import playlistContent from '../../../content/playlists.json';

export const playlistTracks = playlistContent.tracks;
export type PlaylistTrack = (typeof playlistTracks)[number];
export type PlaylistTileTone = 'coral' | 'teal' | 'purple';
