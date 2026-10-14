import type { ImageProps } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, layout, radius, spacing } from '../../theme';
import { AppText } from './app-text';

export type IdentityLayoutStyle = Pick<
  ViewStyle,
  'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type AvatarSize = 'small' | 'medium' | 'topBar' | 'header' | 'card' | 'large';

export type AvatarProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  accessibilityLabel?: string;
  initials: string;
  size?: AvatarSize;
  source?: ImageProps['source'];
  style?: StyleProp<IdentityLayoutStyle>;
};

export type VisibilityType = 'public' | 'friends' | 'private';

export type VisibilityBadgeProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  style?: StyleProp<IdentityLayoutStyle>;
  type?: VisibilityType;
};

export type LicenseType = 'invite' | 'location' | 'time' | 'restricted';

export type LicenseBadgeProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  style?: StyleProp<IdentityLayoutStyle>;
  type?: LicenseType;
};

export type MusicPreferenceChipProps = Omit<
  PressableProps,
  'accessibilityRole' | 'children' | 'disabled' | 'style'
> & {
  children: string;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<IdentityLayoutStyle>;
};

export const avatarSizes: Record<AvatarSize, number> = {
  small: spacing[32],
  medium: layout.minimumTouchTarget,
  topBar: 36,
  header: 40,
  card: spacing[48],
  large: spacing[64],
};

export const visibilityLabels: Record<VisibilityType, string> = {
  public: 'Public',
  friends: 'Friends',
  private: 'Private',
};

export const visibilityBackgrounds: Record<VisibilityType, string> = {
  public: colors.action.secondary,
  friends: colors.category.secondary,
  private: colors.background.surface,
};

export const licenseLabels: Record<LicenseType, string> = {
  invite: 'Invite only',
  location: 'Location',
  time: 'Time window',
  restricted: 'Restricted',
};

export const licenseBackgrounds: Record<LicenseType, string> = {
  invite: colors.category.secondary,
  location: colors.action.secondary,
  time: colors.action.primary,
  restricted: colors.background.surface,
};

export type BadgeProps = Omit<ViewProps, 'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'> & {
  accessibilityLabel: string;
  backgroundColor: string;
  children: ReactNode;
  onAccent?: boolean;
  style?: StyleProp<IdentityLayoutStyle>;
  testID?: string;
};

export function Badge({
  accessibilityLabel,
  backgroundColor,
  children,
  onAccent = false,
  style,
  testID,
  ...viewProps
}: BadgeProps) {
  return <View
    {...viewProps}
    testID={testID}
    accessible
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="text"
    style={[style, identityStyles.badge, { backgroundColor }]}
  >
    <AppText variant="caption" color={onAccent ? 'text.onAccent' : 'text.primary'}>
      {children}
    </AppText>
  </View>;
}

export const identityStyles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.category.secondary,
  },
  avatarImage: {
    ...StyleSheet.absoluteFill,
  },
  badge: {
    height: spacing[32],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.full,
  },
  chip: {
    height: spacing[32],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.full,
  },
  defaultChip: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
  },
  selectedChip: {
    backgroundColor: colors.action.secondary,
  },
  disabledChip: {
    opacity: 0.38,
    borderWidth: 0,
    backgroundColor: colors.background.surface,
  },
});
