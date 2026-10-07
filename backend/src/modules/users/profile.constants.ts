/** Fixed genre list for music preferences; free-form tastes go in tags. */
export const MUSIC_GENRES = [
  'afrobeat', 'ambient', 'blues', 'chaabi', 'classical', 'country', 'dance', 'disco', 'drum-and-bass', 'dubstep',
  'electronic', 'folk', 'funk', 'gnawa', 'gospel', 'hip-hop', 'house', 'indie', 'jazz', 'k-pop', 'latin', 'lo-fi',
  'metal', 'pop', 'punk', 'r-and-b', 'rai', 'rap', 'reggae', 'reggaeton', 'rock', 'soul', 'soundtrack', 'techno',
  'trap', 'world',
] as const;

export type MusicGenre = (typeof MUSIC_GENRES)[number];

export const PROFILE_LIMITS = {
  displayName: 80,
  bio: 280,
  avatarUrl: 2048,
  realName: 80,
  city: 80,
  phone: 20,
  musicItems: 10,
  tag: 30,
} as const;
