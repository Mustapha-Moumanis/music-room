import {
  ArrowDown01Icon,
  ArrowLeft02Icon,
  CheckmarkCircle01Icon,
  Upload03Icon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import {
  createContext,
  type ComponentProps,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Modal as NativeModal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  AppIcon,
  AppText,
  Avatar,
  Button,
  MusicPreferenceChip,
  TextField,
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import profileContent from '../../content/profile.json';
import { profilePreferences } from '../../mocks/profile-friends-examples';
import { goBackOrReplace } from '../../lib/navigation';
import { colors, radius, shadows, spacing, type SemanticColorRole } from '../../theme';
import { ProfileFriendsScreen } from './profile-friends-ui';

type EditableVisibility = 'public' | 'friends' | 'private';
type PreviewAudience = 'public' | 'friend';
type VisibilityAnchor = { height: number; width: number; x: number; y: number };
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

const visibilityOptions = profileContent.editor.visibilityOptions as Array<{ id: EditableVisibility; label: string }>;

const ActiveVisibilityContext = createContext<VisibilityField | null>(null);
const dropdownGap = 6;
const dropdownMargin = spacing[16];
const dropdownPreferredWidth = 184;
const dropdownHeight = 140;

const visibilityLabels: Record<EditableVisibility, string> = {
  public: 'Public',
  friends: 'Friends',
  private: 'Private',
};

const visibilityColors: Record<EditableVisibility, SemanticColorRole> = {
  public: 'action.secondary',
  friends: 'text.primary',
  private: 'action.primary',
};

const initialVisibilities = profileContent.editor.initialVisibilities as Record<VisibilityField, EditableVisibility>;
const initialValues = profileContent.editor.initialValues as ProfileValues;

export function EditProfileScreen() {
  const router = useRouter();
  const { height: viewportHeight, width: viewportWidth } = useWindowDimensions();
  const [visibilityDropdown, setVisibilityDropdown] = useState<{
    anchor: VisibilityAnchor;
    field: VisibilityField;
  } | null>(null);
  const activeVisibility = visibilityDropdown?.field ?? null;
  const [audience, setAudience] = useState<PreviewAudience>('public');
  const [photoChanged, setPhotoChanged] = useState(false);
  const [photoFocused, setPhotoFocused] = useState(false);
  const [photoHovered, setPhotoHovered] = useState(false);
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [visibilities, setVisibilities] = useState(initialVisibilities);
  const [preferences, setPreferences] = useState<Set<string>>(() => new Set(profilePreferences));

  const selectedPreferences = useMemo(
    () => profilePreferences.filter((preference) => preferences.has(preference)),
    [preferences],
  );

  const closeVisibility = useCallback(() => setVisibilityDropdown(null), []);

  const openVisibility = (field: VisibilityField, anchor?: VisibilityAnchor) => {
    setVisibilityDropdown((current) => ({
      field,
      anchor: anchor ?? (current?.field === field
        ? current.anchor
        : {
            x: viewportWidth - dropdownMargin - 88,
            y: spacing[64],
            width: 88,
            height: 36,
          }),
    }));
  };

  const dropdownLayout = useMemo(() => {
    if (!visibilityDropdown) return null;
    const width = Math.min(dropdownPreferredWidth, viewportWidth - dropdownMargin * 2);
    const rightAlignedLeft = visibilityDropdown.anchor.x + visibilityDropdown.anchor.width - width;
    const left = Math.max(
      dropdownMargin,
      Math.min(rightAlignedLeft, viewportWidth - dropdownMargin - width),
    );
    const below = visibilityDropdown.anchor.y + visibilityDropdown.anchor.height + dropdownGap;
    const top = below + dropdownHeight <= viewportHeight - dropdownMargin
      ? below
      : Math.max(dropdownMargin, visibilityDropdown.anchor.y - dropdownGap - dropdownHeight);
    return { left, top, width };
  }, [visibilityDropdown, viewportHeight, viewportWidth]);

  useEffect(() => {
    if (!activeVisibility || typeof document === 'undefined') return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeVisibility();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [activeVisibility, closeVisibility]);

  const updateValue = (field: keyof ProfileValues, value: string) => {
    setSaved(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const updateVisibility = (visibility: EditableVisibility) => {
    if (!activeVisibility) return;
    setSaved(false);
    setVisibilities((current) => ({ ...current, [activeVisibility]: visibility }));
    closeVisibility();
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

  return <ActiveVisibilityContext.Provider value={activeVisibility}>
    <ProfileFriendsScreen
      active="profile"
      bodyStyle={styles.editorBody}
      footer={<View style={styles.actions}>
        <Button variant="secondary" style={styles.actionButton} onPress={() => goBackOrReplace(router, '/profile')}>
          Cancel
        </Button>
        <Button style={styles.actionButton} onPress={() => setSaved(true)}>
          {saved ? 'Changes saved' : 'Save changes'}
        </Button>
      </View>}
      showNavigation={false}
      testID="edit-profile-screen"
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => goBackOrReplace(router, '/profile')}
          style={({ pressed }) => [styles.headerButton, pressed && pressedFeedback]}
        >
          <AppIcon icon={ArrowLeft02Icon} size="standard" />
        </Pressable>
        <AppText variant="h4" color="action.primary" style={styles.headerTitle}>Edit profile</AppText>
      </View>

      <View style={styles.intro}>
        <AppText variant="bodySmall" color="text.secondary">
          Edit each piece of information, then choose exactly who can see it.
        </AppText>
      </View>

      <View style={styles.photoCard}>
        <View style={styles.photoRow}>
          <Pressable
            accessibilityHint="Choose a JPG or PNG image"
            accessibilityLabel={photoChanged ? 'Choose a different profile photo' : 'Upload profile photo'}
            accessibilityRole="button"
            onBlur={() => setPhotoFocused(false)}
            onFocus={() => setPhotoFocused(true)}
            onHoverIn={() => setPhotoHovered(true)}
            onHoverOut={() => setPhotoHovered(false)}
            onPress={() => {
              setPhotoChanged(true);
              setSaved(false);
            }}
            style={({ pressed }) => [styles.photoUpload, pressed && pressedFeedback]}
            testID="profile-photo-upload"
          >
            <Avatar accessible={false} initials="SH" size="large" />
            {photoHovered || photoFocused ? <View
              pointerEvents="none"
              style={styles.photoUploadOverlay}
            >
              <AppIcon icon={Upload03Icon} size="compact" />
              <AppText variant="caption">Upload</AppText>
            </View> : null}
          </Pressable>
          <View style={styles.photoCopy}>
            <AppText variant="h5">Profile photo</AppText>
            <AppText variant="caption" color={photoChanged ? 'action.secondary' : 'text.muted'}>
              {photoChanged ? 'Photo ready' : 'JPG or PNG'}
            </AppText>
          </View>
          <VisibilityControl
            field="photo"
            label="Profile photo"
            value={visibilities.photo}
            onOpen={openVisibility}
          />
        </View>
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
          onOpenVisibility={openVisibility}
        />
        <ProfileEditField
          field="username"
          label="Username"
          value={values.username}
          visibility={visibilities.username}
          autoCapitalize="none"
          onChangeText={(value) => updateValue('username', value)}
          onOpenVisibility={openVisibility}
        />
        <ProfileEditField
          field="bio"
          label="Bio"
          value={values.bio}
          visibility={visibilities.bio}
          multiline
          onChangeText={(value) => updateValue('bio', value)}
          onOpenVisibility={openVisibility}
        />
        <ProfileEditField
          field="location"
          label="Location"
          value={values.location}
          visibility={visibilities.location}
          onChangeText={(value) => updateValue('location', value)}
          onOpenVisibility={openVisibility}
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
          onOpenVisibility={openVisibility}
        />
        <View style={styles.field}>
          <FieldHeader
            field="musicPreferences"
            label="Music preferences"
            visibility={visibilities.musicPreferences}
            onOpenVisibility={openVisibility}
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
          onOpenVisibility={openVisibility}
        />
        <ProfileEditField
          field="listeningActivity"
          label="Listening activity"
          value={values.listeningActivity}
          visibility={visibilities.listeningActivity}
          multiline
          onChangeText={(value) => updateValue('listeningActivity', value)}
          onOpenVisibility={openVisibility}
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
          onOpenVisibility={openVisibility}
        />
        <ProfileEditField
          field="email"
          label="Email"
          value={values.email}
          visibility={visibilities.email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(value) => updateValue('email', value)}
          onOpenVisibility={openVisibility}
        />
        <ProfileEditField
          field="phone"
          label="Phone"
          value={values.phone}
          visibility={visibilities.phone}
          keyboardType="phone-pad"
          onChangeText={(value) => updateValue('phone', value)}
          onOpenVisibility={openVisibility}
        />
        <ProfileEditField
          field="birthday"
          label="Birthday"
          value={values.birthday}
          visibility={visibilities.birthday}
          onChangeText={(value) => updateValue('birthday', value)}
          onOpenVisibility={openVisibility}
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
          {canAudienceSee('photo') ? <Avatar initials="SH" size="medium" /> : null}
          <View>
            {canAudienceSee('displayName') ? <AppText variant="h5">{values.displayName}</AppText> : null}
            {canAudienceSee('username') ? <AppText variant="caption" color="text.muted">@{values.username}</AppText> : null}
          </View>
        </View>
        {canAudienceSee('bio') ? <AppText variant="bodySmall" color="text.secondary">{values.bio}</AppText> : null}
        {canAudienceSee('musicPreferences') ? <PreviewRow
          accent
          label="Music taste"
          value={selectedPreferences.slice(0, 2).join(' · ') || 'Not selected'}
        /> : null}
        {canAudienceSee('location') ? <PreviewRow label="Location" value={values.location} /> : null}
        {canAudienceSee('instagram') ? <PreviewRow label="Instagram" value={values.instagram} /> : null}
        {canAudienceSee('email') ? <PreviewRow label="Email" value={values.email} /> : null}
        <AppText variant="caption" color="action.secondary">
          Viewing as {audience === 'public' ? 'Public' : 'Friend'} · Only visible fields are shown.
        </AppText>
      </View>

    </ProfileFriendsScreen>

    <NativeModal
      animationType="fade"
      onRequestClose={closeVisibility}
      transparent
      visible={activeVisibility !== null}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Close visibility options"
          accessibilityRole="button"
          onPress={closeVisibility}
          style={StyleSheet.absoluteFill}
          testID="profile-visibility-dropdown-backdrop"
        />
        {dropdownLayout ? <View
          accessibilityLabel="Visibility options"
          accessibilityRole="radiogroup"
          style={[styles.visibilityDropdown, dropdownLayout]}
          testID="profile-visibility-dropdown"
        >
          {visibilityOptions.map((option) => {
            const selected = activeVisibility
              ? visibilities[activeVisibility] === option.id
              : false;
            return <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => updateVisibility(option.id)}
              style={({ pressed }) => [
                styles.visibilityOption,
                selected && styles.visibilityOptionSelected,
                pressed && pressedFeedback,
              ]}
              testID={`profile-visibility-dropdown-option-${option.id}`}
            >
              <AppText
                variant="bodySmall"
                color={selected ? 'text.primary' : 'text.secondary'}
              >
                {option.label}
              </AppText>
              {selected ? <AppIcon
                icon={CheckmarkCircle01Icon}
                size="compact"
                tone="default"
              /> : null}
            </Pressable>;
          })}
        </View> : null}
      </View>
    </NativeModal>
  </ActiveVisibilityContext.Provider>;
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
  onOpenVisibility: (field: VisibilityField, anchor?: VisibilityAnchor) => void;
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
  onOpenVisibility: (field: VisibilityField, anchor?: VisibilityAnchor) => void;
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
  onOpen: (field: VisibilityField, anchor?: VisibilityAnchor) => void;
  value: EditableVisibility;
}) {
  const activeVisibility = useContext(ActiveVisibilityContext);
  const controlRef = useRef<View>(null);
  const visibleLabel = visibilityLabels[value];
  const expanded = activeVisibility === field;

  const handleOpen = () => {
    onOpen(field);
    controlRef.current?.measureInWindow((x, y, width, height) => {
      onOpen(field, { x, y, width, height });
    });
  };

  return <Pressable
    ref={controlRef}
    accessibilityLabel={`Change ${label} visibility, currently ${visibleLabel}`}
    accessibilityRole="combobox"
    accessibilityState={{ expanded }}
    onPress={handleOpen}
    style={({ pressed }) => [
      styles.visibilityControl,
      expanded && styles.visibilityControlExpanded,
      pressed && pressedFeedback,
    ]}
  >
    <AppText variant="caption" color={expanded ? 'text.primary' : visibilityColors[value]}>{visibleLabel}</AppText>
    <AppIcon icon={ArrowDown01Icon} size="compact" tone={expanded ? 'default' : 'muted'} />
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
    minHeight: 92,
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
  photoUpload: {
    width: spacing[64],
    height: spacing[64],
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  photoUploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    borderWidth: 2,
    borderColor: colors.action.secondary,
    borderRadius: radius.full,
    backgroundColor: colors.background.app,
  },
  photoCopy: {
    minWidth: 1,
    flex: 1,
    gap: 2,
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
  visibilityControlExpanded: {
    borderColor: colors.category.secondary,
    backgroundColor: colors.category.secondary,
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
    flexDirection: 'row',
    gap: 10,
    paddingTop: spacing[8],
    paddingRight: spacing[16],
    paddingBottom: spacing[12],
    paddingLeft: spacing[16],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.background.app,
  },
  actionButton: {
    minWidth: 1,
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  visibilityDropdown: {
    position: 'absolute',
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
    ...shadows.floating,
  },
  visibilityOption: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[12],
    borderRadius: radius.small,
  },
  visibilityOptionSelected: {
    backgroundColor: colors.category.secondary,
  },
});
