import { Pressable, View } from 'react-native';

import { AppText, Avatar } from '../../../../components/ui';
import { pressedFeedback } from '../../../../components/ui/interaction-feedback';
import type {
  PreviewAudience,
  ProfileValues,
  VisibilityField,
} from '../../model/profile-editor';
import { profileEditorStyles as styles } from './profile-editor.styles';

export function ProfilePreview({
  audience,
  canAudienceSee,
  onAudienceChange,
  selectedPreferences,
  values,
}: {
  audience: PreviewAudience;
  canAudienceSee: (field: VisibilityField) => boolean;
  onAudienceChange: (audience: PreviewAudience) => void;
  selectedPreferences: string[];
  values: ProfileValues;
}) {
  return <View style={styles.previewCard}>
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
          onPress={() => onAudienceChange(item)}
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
  </View>;
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
