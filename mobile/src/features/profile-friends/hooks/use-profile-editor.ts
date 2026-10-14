import { useMemo, useState } from 'react';

import { profilePreferences } from '../../../mocks/profile-friends-examples';
import {
  canAudienceSeeProfileField,
  initialProfileValues,
  initialProfileVisibilities,
  type EditableVisibility,
  type PreviewAudience,
  type ProfileValues,
  type VisibilityField,
} from '../model/profile-editor';

export function useProfileEditor() {
  const [audience, setAudience] = useState<PreviewAudience>('public');
  const [photoChanged, setPhotoChanged] = useState(false);
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState(initialProfileValues);
  const [visibilities, setVisibilities] = useState(initialProfileVisibilities);
  const [preferences, setPreferences] = useState<Set<string>>(() => new Set(profilePreferences));

  const selectedPreferences = useMemo(
    () => profilePreferences.filter((preference) => preferences.has(preference)),
    [preferences],
  );

  const updateValue = (field: keyof ProfileValues, value: string) => {
    setSaved(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const updateVisibility = (field: VisibilityField, visibility: EditableVisibility) => {
    setSaved(false);
    setVisibilities((current) => ({ ...current, [field]: visibility }));
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

  const markPhotoChanged = () => {
    setPhotoChanged(true);
    setSaved(false);
  };

  const canAudienceSee = (field: VisibilityField) => (
    canAudienceSeeProfileField(audience, visibilities[field])
  );

  return {
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
    updateVisibility,
    values,
    visibilities,
  };
}
