import profileContent from '../../../content/profile.json';

export type EditableVisibility = 'public' | 'friends' | 'private';
export type PreviewAudience = 'public' | 'friend';
export type VisibilityAnchor = { height: number; width: number; x: number; y: number };
export type VisibilityField =
  | 'photo'
  | 'displayName'
  | 'username'
  | 'bio'
  | 'location'
  | 'favoriteArtist'
  | 'musicPreferences'
  | 'recentlyPlayed'
  | 'listeningActivity'
  | 'instagram'
  | 'email'
  | 'phone'
  | 'birthday';

export type ProfileValues = {
  displayName: string;
  username: string;
  bio: string;
  location: string;
  favoriteArtist: string;
  recentlyPlayed: string;
  listeningActivity: string;
  instagram: string;
  email: string;
  phone: string;
  birthday: string;
};

export type ProfileVisibilities = Record<VisibilityField, EditableVisibility>;

export const visibilityOptions = profileContent.editor.visibilityOptions as {
  id: EditableVisibility;
  label: string;
}[];

export const initialProfileVisibilities = profileContent.editor.initialVisibilities as ProfileVisibilities;
export const initialProfileValues = profileContent.editor.initialValues as ProfileValues;

export function canAudienceSeeProfileField(
  audience: PreviewAudience,
  visibility: EditableVisibility,
) {
  return visibility === 'public' || (audience === 'friend' && visibility === 'friends');
}
