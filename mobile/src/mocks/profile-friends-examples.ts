import profileContent from '../content/profile.json';

export const profilePreferences = profileContent.preferences;
export const editablePreferences = profileContent.editablePreferences;
export const friends = profileContent.friends;
export const recentSearches = profileContent.recentSearches;
export const searchResults = profileContent.searchResults as Array<
  (typeof profileContent.searchResults)[number] & { relation: 'friend' | 'stranger' }
>;
export const incomingRequests = profileContent.incomingRequests;
