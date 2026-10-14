import {
  ArrowLeft02Icon,
  CheckmarkCircle01Icon,
  Upload03Icon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import {
  useCallback,
  useMemo,
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
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { goBackOrReplace } from '../../lib/navigation';
import { useEscapeKey } from '../../lib/use-escape-key';
import { spacing } from '../../theme';
import { useProfileEditor } from './hooks/use-profile-editor';
import { ActiveVisibilityProvider, VisibilityControl } from './components/profile-editor/profile-editor-fields';
import { ContactPersonalFields, MusicActivityFields, ProfileInformationFields } from './components/profile-editor/profile-editor-sections';
import { ProfilePreview } from './components/profile-editor/profile-preview';
import { profileEditorStyles as styles } from './components/profile-editor/profile-editor.styles';
import {
  visibilityOptions,
  type EditableVisibility,
  type VisibilityAnchor,
  type VisibilityField,
} from './model/profile-editor';
import { ProfileFriendsScreen } from './profile-friends-ui';

const dropdownGap = 6;
const dropdownMargin = spacing[16];
const dropdownPreferredWidth = 184;
const dropdownHeight = 140;

export function EditProfileScreen() {
  const router = useRouter();
  const { height: viewportHeight, width: viewportWidth } = useWindowDimensions();
  const [visibilityDropdown, setVisibilityDropdown] = useState<{
    anchor: VisibilityAnchor;
    field: VisibilityField;
  } | null>(null);
  const activeVisibility = visibilityDropdown?.field ?? null;
  const [photoFocused, setPhotoFocused] = useState(false);
  const [photoHovered, setPhotoHovered] = useState(false);
  const {
    audience,
    canAudienceSee,
    markPhotoChanged,
    photoChanged,
    preferences,
    saved,
    selectedPreferences,
    setAudience,
    setSaved,
    togglePreference,
    updateValue,
    updateVisibility: updateFieldVisibility,
    values,
    visibilities,
  } = useProfileEditor();

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

  useEscapeKey(activeVisibility !== null, closeVisibility);

  const updateVisibility = (visibility: EditableVisibility) => {
    if (!activeVisibility) return;
    updateFieldVisibility(activeVisibility, visibility);
    closeVisibility();
  };

  return <ActiveVisibilityProvider value={activeVisibility}>
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
            onPress={markPhotoChanged}
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

      <ProfileInformationFields
        onOpenVisibility={openVisibility}
        onUpdateValue={updateValue}
        values={values}
        visibilities={visibilities}
      />
      <MusicActivityFields
        onOpenVisibility={openVisibility}
        onTogglePreference={togglePreference}
        onUpdateValue={updateValue}
        preferences={preferences}
        values={values}
        visibilities={visibilities}
      />
      <ContactPersonalFields
        onOpenVisibility={openVisibility}
        onUpdateValue={updateValue}
        values={values}
        visibilities={visibilities}
      />

      <ProfilePreview
        audience={audience}
        canAudienceSee={canAudienceSee}
        onAudienceChange={setAudience}
        selectedPreferences={selectedPreferences}
        values={values}
      />

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
  </ActiveVisibilityProvider>;
}
