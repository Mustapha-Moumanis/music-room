import { ArrowDown01Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { type ComponentProps, type ReactNode, useMemo, useState } from 'react';
import {
  Modal as NativeModal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  AppIcon,
  AppText,
  Avatar,
  BottomSheet,
  Button,
  MusicPreferenceChip,
  TextField,
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { profilePreferences } from '../../mocks/profile-friends-examples';
import { colors, radius, spacing, type SemanticColorRole } from '../../theme';
import { ProfileFriendsScreen } from './profile-friends-ui';

type EditableVisibility = 'public' | 'friends' | 'private';
type PreviewAudience = 'public' | 'friend';
type VisibilityField =
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

type ProfileValues = {
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

const visibilityOptions = [
  { id: 'public', label: 'Public — visible to everyone' },
  { id: 'friends', label: 'Friends — visible to accepted friends' },
  { id: 'private', label: 'Private — visible only to you' },
] as const;

const visibilityLabels: Record<EditableVisibility, string> = {
  public: 'Public',
  friends: 'Friends',
  private: 'Private',
};

const visibilityColors: Record<EditableVisibility, SemanticColorRole> = {
  public: 'action.secondary',
  friends: 'category.secondary',
  private: 'action.primary',
};

const initialVisibilities: Record<VisibilityField, EditableVisibility> = {
  photo: 'public',
  displayName: 'public',
  username: 'public',
  bio: 'public',
  location: 'friends',
  favoriteArtist: 'public',
  musicPreferences: 'public',
  recentlyPlayed: 'friends',
  listeningActivity: 'friends',
  instagram: 'friends',
  email: 'private',
  phone: 'private',
  birthday: 'private',
};

const initialValues: ProfileValues = {
  displayName: 'Souad Hilal',
  username: 'souad',
  bio: 'Frontend dev, night-drive playlists',
  location: 'Benguerir, Morocco',
  favoriteArtist: 'The Midnight',
  recentlyPlayed: 'Better Off Alone · The Midnight',
  listeningActivity: 'Share when you are listening',
  instagram: '@souad.designs',
  email: 'souad@musicroom.app',
  phone: 'Not added',
  birthday: 'Not added',
};

export function EditProfileScreen() {
  const router = useRouter();
  const [activeVisibility, setActiveVisibility] = useState<VisibilityField | null>(null);
  const [audience, setAudience] = useState<PreviewAudience>('public');
  const [photoChanged, setPhotoChanged] = useState(false);
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [visibilities, setVisibilities] = useState(initialVisibilities);
  const [preferences, setPreferences] = useState<Set<string>>(() => new Set(profilePreferences));

  const selectedPreferences = useMemo(
    () => profilePreferences.filter((preference) => preferences.has(preference)),
    [preferences],
  );

  const updateValue = (field: keyof ProfileValues, value: string) => {
    setSaved(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const updateVisibility = (visibility: EditableVisibility) => {
    if (!activeVisibility) return;
    setSaved(false);
    setVisibilities((current) => ({ ...current, [activeVisibility]: visibility }));
    setActiveVisibility(null);
  };

  const togglePreference = (preference: string) => {
    setSaved(false);
    setPreferences((current) => {
      const next = new Set(current);
      if (next.has(preference)) next.delete(preference);
      else next.add(preference);
      return next;
    });
  };

  const canAudienceSee = (field: VisibilityField) => {
    const visibility = visibilities[field];
    return visibility === 'public' || (audience === 'friend' && visibility === 'friends');
  };

  const previewValue = (field: VisibilityField, value: string) => {
    if (canAudienceSee(field)) return value;
    return visibilities[field] === 'friends' ? 'Friends only' : 'Private';
  };

  return <>
    <ProfileFriendsScreen
      active="profile"
      bodyStyle={styles.editorBody}
      showNavigation={false}
      testID="edit-profile-screen"
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerButton, pressed && pressedFeedback]}
        >
          <AppIcon icon={ArrowLeft02Icon} size="standard" />
        </Pressable>
        <AppText variant="h4" style={styles.headerTitle}>Edit profile</AppText>
      </View>

      <View style={styles.intro}>
        <AppText variant="caption" color="action.primary">PROFILE SETTINGS</AppText>
        <AppText variant="bodySmall" color="text.secondary">
          Edit each piece of information, then choose exactly who can see it.
        </AppText>
      </View>

      <View style={styles.photoCard}>
        <View style={styles.photoRow}>
          <Avatar initials="SH" size="large" />
          <View style={styles.photoCopy}>
            <AppText variant="h5">Profile photo</AppText>
            <AppText variant="caption" color="text.muted">JPG or PNG</AppText>
          </View>
          <VisibilityControl
            field="photo"
            label="Profile photo"
            value={visibilities.photo}
            onOpen={setActiveVisibility}
          />
        </View>
        <Button
          size="small"
          variant="secondary"
          style={styles.changePhotoButton}
          onPress={() => setPhotoChanged(true)}
        >
          {photoChanged ? 'Photo ready' : 'Change photo'}
        </Button>
      </View>

      <EditorSection
        title="Profile information"
        subtitle="Identity and profile details. Visibility is controlled field by field."
      >
        <ProfileEditField
          field="displayName"
          label="Display name"
          value={values.displayName}
          visibility={visibilities.displayName}
          onChangeText={(value) => updateValue('displayName', value)}
          onOpenVisibility={setActiveVisibility}
        />
        <ProfileEditField
          field="username"
          label="Username"
          value={values.username}
          visibility={visibilities.username}
          autoCapitalize="none"
          onChangeText={(value) => updateValue('username', value)}
          onOpenVisibility={setActiveVisibility}
        />
        <ProfileEditField
          field="bio"
          label="Bio"
          value={values.bio}
          visibility={visibilities.bio}
          multiline
          onChangeText={(value) => updateValue('bio', value)}
          onOpenVisibility={setActiveVisibility}
        />
        <ProfileEditField
          field="location"
          label="Location"
          value={values.location}
          visibility={visibilities.location}
          onChangeText={(value) => updateValue('location', value)}
          onOpenVisibility={setActiveVisibility}
        />
      </EditorSection>

      <EditorSection
        title="Music & activity"
        subtitle="Taste and listening activity can be shared independently."
      >
        <ProfileEditField
          field="favoriteArtist"
          label="Favorite artist"
          value={values.favoriteArtist}
          visibility={visibilities.favoriteArtist}
          onChangeText={(value) => updateValue('favoriteArtist', value)}
          onOpenVisibility={setActiveVisibility}
        />
        <View style={styles.field}>
          <FieldHeader
            field="musicPreferences"
            label="Music preferences"
            visibility={visibilities.musicPreferences}
            onOpenVisibility={setActiveVisibility}
          />
          <View style={styles.preferenceChips}>
            {profilePreferences.map((preference) => <MusicPreferenceChip
              key={preference}
              selected={preferences.has(preference)}
              onPress={() => togglePreference(preference)}
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
          onChangeText={(value) => updateValue('recentlyPlayed', value)}
          onOpenVisibility={setActiveVisibility}
        />
        <ProfileEditField
          field="listeningActivity"
          label="Listening activity"
          value={values.listeningActivity}
          visibility={visibilities.listeningActivity}
          multiline
          onChangeText={(value) => updateValue('listeningActivity', value)}
          onOpenVisibility={setActiveVisibility}
        />
      </EditorSection>

      <EditorSection
        title="Contact & personal"
        subtitle="Sensitive information defaults to private."
      >
        <ProfileEditField
          field="instagram"
          label="Instagram"
          value={values.instagram}
          visibility={visibilities.instagram}
          autoCapitalize="none"
          onChangeText={(value) => updateValue('instagram', value)}
          onOpenVisibility={setActiveVisibility}
        />
        <ProfileEditField
          field="email"
          label="Email"
          value={values.email}
          visibility={visibilities.email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(value) => updateValue('email', value)}
          onOpenVisibility={setActiveVisibility}
        />
        <ProfileEditField
          field="phone"
          label="Phone"
          value={values.phone}
          visibility={visibilities.phone}
          keyboardType="phone-pad"
          onChangeText={(value) => updateValue('phone', value)}
          onOpenVisibility={setActiveVisibility}
        />
        <ProfileEditField
          field="birthday"
          label="Birthday"
          value={values.birthday}
          visibility={visibilities.birthday}
          onChangeText={(value) => updateValue('birthday', value)}
          onOpenVisibility={setActiveVisibility}
        />
      </EditorSection>

      <View style={styles.previewCard}>
        <View style={styles.previewHeading}>
          <AppText variant="h5">Profile preview</AppText>
          <AppText variant="caption" color="action.secondary">Live preview</AppText>
        </View>
        <View accessibilityRole="tablist" style={styles.previewSwitch}>
          {(['public', 'friend'] as const).map((item) => {
            const selected = audience === item;
            return <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setAudience(item)}
              style={({ pressed }) => [
                styles.previewTab,
                selected && styles.previewTabSelected,
                pressed && pressedFeedback,
              ]}
            >
              <AppText
                variant="navigationLabel"
                color={selected ? 'text.primary' : 'text.muted'}
              >
                {item === 'public' ? 'Public' : 'Friend'}
              </AppText>
            </Pressable>;
          })}
        </View>
        <View style={styles.previewIdentity}>
          <Avatar initials="SH" size="medium" />
          <View>
            <AppText variant="h5">{values.displayName}</AppText>
            <AppText variant="caption" color="text.muted">@{values.username}</AppText>
          </View>
        </View>
        <AppText variant="bodySmall" color="text.secondary">{values.bio}</AppText>
        <PreviewRow
          accent
          label="Music taste"
          value={previewValue('musicPreferences', selectedPreferences.slice(0, 2).join(' · ') || 'Not selected')}
        />
        <PreviewRow label="Location" value={previewValue('location', values.location)} />
        <PreviewRow label="Instagram" value={previewValue('instagram', values.instagram)} />
        <PreviewRow label="Email" value={previewValue('email', values.email)} />
        <AppText variant="caption" color="action.secondary">
          Viewing as {audience === 'public' ? 'Public' : 'Friend'} · Hidden fields respect each visibility choice.
        </AppText>
      </View>

      <View style={styles.actions}>
        <Button variant="secondary" style={styles.actionButton} onPress={() => router.back()}>
          Cancel
        </Button>
        <Button style={styles.actionButton} onPress={() => setSaved(true)}>
          {saved ? 'Changes saved' : 'Save changes'}
        </Button>
      </View>
    </ProfileFriendsScreen>

    <NativeModal
      animationType="slide"
      onRequestClose={() => setActiveVisibility(null)}
      transparent
      visible={activeVisibility !== null}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Close visibility options"
          accessibilityRole="button"
          onPress={() => setActiveVisibility(null)}
          style={StyleSheet.absoluteFill}
        />
        <BottomSheet
          testID="profile-visibility-sheet"
          type="picker"
          title="Who can see this field?"
          options={[...visibilityOptions]}
          onOptionPress={(option) => updateVisibility(option.id as EditableVisibility)}
        />
      </View>
    </NativeModal>
  </>;
}

function EditorSection({ children, subtitle, title }: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return <View style={styles.section}>
    <View style={styles.sectionHeading}>
      <AppText variant="h5">{title}</AppText>
      <AppText variant="caption" color="text.muted">{subtitle}</AppText>
    </View>
    {children}
  </View>;
}

function ProfileEditField({
  field,
  label,
  onOpenVisibility,
  visibility,
  ...inputProps
}: Pick<
  ComponentProps<typeof TextField>,
  'autoCapitalize' | 'keyboardType' | 'multiline' | 'onChangeText' | 'value'
> & {
  field: VisibilityField;
  label: string;
  onOpenVisibility: (field: VisibilityField) => void;
  visibility: EditableVisibility;
}) {
  return <View style={styles.field}>
    <FieldHeader
      field={field}
      label={label}
      visibility={visibility}
      onOpenVisibility={onOpenVisibility}
    />
    <TextField {...inputProps} label="" />
  </View>;
}

function FieldHeader({ field, label, onOpenVisibility, visibility }: {
  field: VisibilityField;
  label: string;
  onOpenVisibility: (field: VisibilityField) => void;
  visibility: EditableVisibility;
}) {
  return <View style={styles.fieldHeader}>
    <AppText variant="bodySmall" color="text.secondary">{label}</AppText>
    <VisibilityControl
      field={field}
      label={label}
      value={visibility}
      onOpen={onOpenVisibility}
    />
  </View>;
}

function VisibilityControl({ field, label, onOpen, value }: {
  field: VisibilityField;
  label: string;
  onOpen: (field: VisibilityField) => void;
  value: EditableVisibility;
}) {
  const visibleLabel = visibilityLabels[value];

  return <Pressable
    accessibilityLabel={`Change ${label} visibility, currently ${visibleLabel}`}
    accessibilityRole="button"
    onPress={() => onOpen(field)}
    style={({ pressed }) => [styles.visibilityControl, pressed && pressedFeedback]}
  >
    <AppText variant="caption" color={visibilityColors[value]}>{visibleLabel}</AppText>
    <AppIcon icon={ArrowDown01Icon} size="compact" tone="muted" />
  </Pressable>;
}

function PreviewRow({ accent = false, label, value }: {
  accent?: boolean;
  label: string;
  value: string;
}) {
  return <View style={styles.previewRow}>
    <AppText variant="caption" color={accent ? 'action.secondary' : 'text.muted'}>{label}</AppText>
    <AppText variant="caption" color="text.secondary" numberOfLines={1} style={styles.previewValue}>
      {value}
    </AppText>
  </View>;
}

const styles = StyleSheet.create({
  editorBody: {
    gap: 18,
    paddingBottom: spacing[24],
  },
  header: {
    width: '100%',
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
  },
  headerButton: {
    width: 24,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    minWidth: 1,
    flex: 1,
  },
  intro: {
    width: '100%',
    gap: spacing[4],
  },
  photoCard: {
    width: '100%',
    minHeight: 128,
    gap: 10,
    padding: spacing[12],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  photoRow: {
    width: '100%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
  },
  photoCopy: {
    minWidth: 1,
    flex: 1,
    gap: 2,
  },
  changePhotoButton: {
    alignSelf: 'flex-start',
  },
  section: {
    width: '100%',
    gap: spacing[12],
  },
  sectionHeading: {
    width: '100%',
    gap: 3,
  },
  field: {
    width: '100%',
    gap: 6,
  },
  fieldHeader: {
    width: '100%',
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[12],
  },
  visibilityControl: {
    minWidth: 88,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingLeft: spacing[12],
    paddingRight: spacing[8],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  preferenceChips: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[8],
  },
  previewCard: {
    width: '100%',
    gap: spacing[12],
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  previewHeading: {
    width: '100%',
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewSwitch: {
    width: '100%',
    height: 42,
    flexDirection: 'row',
    gap: spacing[4],
    padding: 3,
    borderRadius: radius.medium,
    backgroundColor: colors.background.app,
  },
  previewTab: {
    minWidth: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.small,
  },
  previewTabSelected: {
    backgroundColor: colors.background.surface,
  },
  previewIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewRow: {
    width: '100%',
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[12],
  },
  previewValue: {
    minWidth: 1,
    flexShrink: 1,
    textAlign: 'right',
  },
  actions: {
    width: '100%',
    height: spacing[48],
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    minWidth: 1,
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.56)',
  },
});
