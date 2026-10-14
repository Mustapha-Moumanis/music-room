import { View } from 'react-native';

import { MusicPreferenceChip } from '../../../../components/ui';
import { profilePreferences } from '../../../../mocks/profile-friends-examples';
import type {
  ProfileValues,
  ProfileVisibilities,
  VisibilityAnchor,
  VisibilityField,
} from '../../model/profile-editor';
import {
  EditorSection,
  FieldHeader,
  ProfileEditField,
} from './profile-editor-fields';
import { profileEditorStyles as styles } from './profile-editor.styles';

type SectionProps = {
  onOpenVisibility: (field: VisibilityField, anchor?: VisibilityAnchor) => void;
  onUpdateValue: (field: keyof ProfileValues, value: string) => void;
  values: ProfileValues;
  visibilities: ProfileVisibilities;
};

export function ProfileInformationFields({
  onOpenVisibility,
  onUpdateValue,
  values,
  visibilities,
}: SectionProps) {
  return <EditorSection
    title="Profile information"
    subtitle="Identity and profile details. Visibility is controlled field by field."
  >
    <ProfileEditField
      field="displayName"
      label="Display name"
      value={values.displayName}
      visibility={visibilities.displayName}
      onChangeText={(value) => onUpdateValue('displayName', value)}
      onOpenVisibility={onOpenVisibility}
    />
    <ProfileEditField
      field="username"
      label="Username"
      value={values.username}
      visibility={visibilities.username}
      autoCapitalize="none"
      onChangeText={(value) => onUpdateValue('username', value)}
      onOpenVisibility={onOpenVisibility}
    />
    <ProfileEditField
      field="bio"
      label="Bio"
      value={values.bio}
      visibility={visibilities.bio}
      multiline
      onChangeText={(value) => onUpdateValue('bio', value)}
      onOpenVisibility={onOpenVisibility}
    />
    <ProfileEditField
      field="location"
      label="Location"
      value={values.location}
      visibility={visibilities.location}
      onChangeText={(value) => onUpdateValue('location', value)}
      onOpenVisibility={onOpenVisibility}
    />
  </EditorSection>;
}

export function MusicActivityFields({
  onOpenVisibility,
  onTogglePreference,
  onUpdateValue,
  preferences,
  values,
  visibilities,
}: SectionProps & {
  onTogglePreference: (preference: string) => void;
  preferences: Set<string>;
}) {
  return <EditorSection
    title="Music & activity"
    subtitle="Taste and listening activity can be shared independently."
  >
    <ProfileEditField
      field="favoriteArtist"
      label="Favorite artist"
      value={values.favoriteArtist}
      visibility={visibilities.favoriteArtist}
      onChangeText={(value) => onUpdateValue('favoriteArtist', value)}
      onOpenVisibility={onOpenVisibility}
    />
    <View style={styles.field}>
      <FieldHeader
        field="musicPreferences"
        label="Music preferences"
        visibility={visibilities.musicPreferences}
        onOpenVisibility={onOpenVisibility}
      />
      <View style={styles.preferenceChips}>
        {profilePreferences.map((preference) => <MusicPreferenceChip
          key={preference}
          selected={preferences.has(preference)}
          onPress={() => onTogglePreference(preference)}
        >
          {preference}
        </MusicPreferenceChip>)}
      </View>
    </View>
    <ProfileEditField
      field="recentlyPlayed"
      label="Recently played"
      value={values.recentlyPlayed}
      visibility={visibilities.recentlyPlayed}
      multiline
      onChangeText={(value) => onUpdateValue('recentlyPlayed', value)}
      onOpenVisibility={onOpenVisibility}
    />
    <ProfileEditField
      field="listeningActivity"
      label="Listening activity"
      value={values.listeningActivity}
      visibility={visibilities.listeningActivity}
      multiline
      onChangeText={(value) => onUpdateValue('listeningActivity', value)}
      onOpenVisibility={onOpenVisibility}
    />
  </EditorSection>;
}

export function ContactPersonalFields({
  onOpenVisibility,
  onUpdateValue,
  values,
  visibilities,
}: SectionProps) {
  return <EditorSection
    title="Contact & personal"
    subtitle="Sensitive information defaults to private."
  >
    <ProfileEditField
      field="instagram"
      label="Instagram"
      value={values.instagram}
      visibility={visibilities.instagram}
      autoCapitalize="none"
      onChangeText={(value) => onUpdateValue('instagram', value)}
      onOpenVisibility={onOpenVisibility}
    />
    <ProfileEditField
      field="email"
      label="Email"
      value={values.email}
      visibility={visibilities.email}
      autoCapitalize="none"
      keyboardType="email-address"
      onChangeText={(value) => onUpdateValue('email', value)}
      onOpenVisibility={onOpenVisibility}
    />
    <ProfileEditField
      field="phone"
      label="Phone"
      value={values.phone}
      visibility={visibilities.phone}
      keyboardType="phone-pad"
      onChangeText={(value) => onUpdateValue('phone', value)}
      onOpenVisibility={onOpenVisibility}
    />
    <ProfileEditField
      field="birthday"
      label="Birthday"
      value={values.birthday}
      visibility={visibilities.birthday}
      onChangeText={(value) => onUpdateValue('birthday', value)}
      onOpenVisibility={onOpenVisibility}
    />
  </EditorSection>;
}
