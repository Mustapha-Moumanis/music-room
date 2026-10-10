import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import {
  Avatar,
  LicenseBadge,
  MusicPreferenceChip,
  VisibilityBadge,
  type AvatarSize,
  type LicenseType,
  type VisibilityType,
} from '../components/ui';
import { colors, layout, radius, spacing, typography } from '../theme';

const avatarDimensions: Record<AvatarSize, number> = {
  small: spacing[32],
  medium: layout.minimumTouchTarget,
  topBar: 36,
  card: spacing[48],
  large: spacing[64],
};

it.each(Object.entries(avatarDimensions) as Array<[AvatarSize, number]>) (
  'matches the %s Avatar fallback from Figma',
  (size, dimension) => {
    const view = render(<Avatar initials="SH" size={size} testID="avatar" />);
    const avatarStyle = StyleSheet.flatten(view.getByTestId('avatar').props.style);
    const initialsStyle = StyleSheet.flatten(view.getByTestId('avatar-initials').props.style);

    expect(avatarStyle).toEqual(expect.objectContaining({
      width: dimension,
      height: dimension,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: colors.category.secondary,
    }));
    expect(initialsStyle).toEqual(expect.objectContaining(
      size === 'large' ? typography.h5 : typography.caption,
    ));
    expect(view.getByTestId('avatar').props).toEqual(expect.objectContaining({
      accessibilityLabel: 'SH avatar',
      accessibilityRole: 'image',
    }));
  },
);

it('uses a supplied photo instead of fallback initials', () => {
  const view = render(<Avatar
    accessibilityLabel="Souad profile photo"
    initials="SH"
    source={{ uri: 'https://example.com/avatar.jpg' }}
    testID="avatar"
  />);

  expect(view.getByTestId('avatar-image')).toBeTruthy();
  expect(view.queryByTestId('avatar-initials')).toBeNull();
  expect(view.getByTestId('avatar').props.accessibilityLabel).toBe('Souad profile photo');
});

const visibilityVariants: Record<VisibilityType, { background: string; label: string; color: string }> = {
  public: { background: colors.action.secondary, label: 'Public', color: colors.text.onAccent },
  friends: { background: colors.category.secondary, label: 'Friends', color: colors.text.primary },
  private: { background: colors.background.surface, label: 'Private', color: colors.text.primary },
};

it.each(Object.entries(visibilityVariants) as Array<[VisibilityType, (typeof visibilityVariants)[VisibilityType]]>) (
  'matches the %s Visibility Badge',
  (type, expected) => {
    const view = render(<VisibilityBadge type={type} testID="badge" />);

    expect(StyleSheet.flatten(view.getByTestId('badge').props.style)).toEqual(expect.objectContaining({
      height: spacing[32],
      paddingHorizontal: spacing[12],
      paddingVertical: spacing[8],
      borderRadius: radius.full,
      backgroundColor: expected.background,
    }));
    expect(StyleSheet.flatten(view.getByText(expected.label).props.style)).toEqual(expect.objectContaining({
      ...typography.caption,
      color: expected.color,
    }));
    expect(view.getByTestId('badge').props.accessibilityLabel).toBe(`Visibility: ${expected.label}`);
  },
);

const licenseVariants: Record<LicenseType, { background: string; label: string; color: string }> = {
  invite: { background: colors.category.secondary, label: 'Invite only', color: colors.text.primary },
  location: { background: colors.action.secondary, label: 'Location', color: colors.text.onAccent },
  time: { background: colors.action.primary, label: 'Time window', color: colors.text.onAccent },
  restricted: { background: colors.background.surface, label: 'Restricted', color: colors.text.primary },
};

it.each(Object.entries(licenseVariants) as Array<[LicenseType, (typeof licenseVariants)[LicenseType]]>) (
  'matches the %s License Badge',
  (type, expected) => {
    const view = render(<LicenseBadge type={type} testID="badge" />);

    expect(StyleSheet.flatten(view.getByTestId('badge').props.style).backgroundColor).toBe(expected.background);
    expect(StyleSheet.flatten(view.getByText(expected.label).props.style).color).toBe(expected.color);
    expect(view.getByTestId('badge').props.accessibilityLabel).toBe(`Restriction: ${expected.label}`);
  },
);

it('matches default, selected, and disabled Music Preference Chip states', () => {
  const initial = render(<MusicPreferenceChip testID="initial">Indie</MusicPreferenceChip>);
  const selected = render(<MusicPreferenceChip selected testID="selected">Indie</MusicPreferenceChip>);
  const disabled = render(<MusicPreferenceChip disabled testID="disabled">Indie</MusicPreferenceChip>);

  expect(StyleSheet.flatten(initial.getByTestId('initial').props.style)).toEqual(expect.objectContaining({
    height: spacing[32],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
  }));
  expect(StyleSheet.flatten(selected.getByTestId('selected').props.style)).toEqual(expect.objectContaining({
    backgroundColor: colors.action.secondary,
  }));
  expect(StyleSheet.flatten(selected.getByText('Indie').props.style).color).toBe(colors.text.onAccent);
  expect(StyleSheet.flatten(disabled.getByTestId('disabled').props.style)).toEqual(expect.objectContaining({
    opacity: 0.38,
    borderWidth: 0,
    backgroundColor: colors.background.surface,
  }));
  expect(selected.getByTestId('selected').props.accessibilityState).toEqual({ checked: true, disabled: false });
  expect(disabled.getByTestId('disabled').props.accessibilityState).toEqual({ checked: false, disabled: true });
});

it('forwards chip presses and blocks them while disabled', () => {
  const onPress = jest.fn();
  const active = render(<MusicPreferenceChip onPress={onPress} testID="active">Indie</MusicPreferenceChip>);
  const disabled = render(<MusicPreferenceChip disabled onPress={onPress} testID="disabled">Indie</MusicPreferenceChip>);

  fireEvent(active.getByTestId('active'), 'pressIn');
  expect(StyleSheet.flatten(active.getByTestId('active').props.style)).toEqual(expect.objectContaining({
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  }));
  fireEvent(active.getByTestId('active'), 'pressOut');
  fireEvent.press(active.getByTestId('active'));
  fireEvent.press(disabled.getByTestId('disabled'));

  expect(onPress).toHaveBeenCalledTimes(1);
  expect(active.getByTestId('active').props.accessibilityRole).toBe('checkbox');
  expect(active.getByTestId('active').props.hitSlop).toBe(spacing[8]);
});
