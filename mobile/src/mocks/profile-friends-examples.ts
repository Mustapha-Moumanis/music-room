export const profilePreferences = ['Indie', 'Electronic', 'Soul', 'Alternative', 'Jazz'] as const;

export const editablePreferences = [
  'Indie',
  'Electronic',
  'Soul',
  'Rock',
  'Hip-Hop',
  'Jazz',
  'Pop',
  'R&B',
  'Alternative',
] as const;

export const friends = [
  { initials: 'NA', name: 'Nada Amrani', meta: 'Listening to Friends Tape' },
  { initials: 'NA', name: 'Omar El Idrissi', meta: 'Online now' },
  { initials: 'NA', name: 'Sara Benali', meta: '2 mutual playlists' },
] as const;

export const recentSearches = [
  { initials: 'OM', name: 'Yassine El Mansouri', meta: '@yassine · 2 mutual friends' },
  { initials: 'OM', name: 'Meryem Alaoui', meta: '@meryem · 1 mutual friend' },
] as const;

export const searchResults = [
  { initials: 'OM', name: 'Yassine El Mansouri', meta: '@yassine · 2 mutual friends', relation: 'stranger' as const },
  { initials: 'NA', name: 'Yassine B.', meta: 'Already friends · online', relation: 'friend' as const },
  { initials: 'OM', name: 'Yassine K.', meta: '@yk_music · no mutual friends', relation: 'stranger' as const },
] as const;

export const incomingRequests = [
  { initials: 'NA', name: 'Yassine El Mansouri', summary: '2 mutual friends' },
  { initials: 'NA', name: 'Meryem Alaoui', summary: '1 mutual friend' },
] as const;
