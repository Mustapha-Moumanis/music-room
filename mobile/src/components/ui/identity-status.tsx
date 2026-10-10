import { Image, type ImageProps } from 'expo-image';
import type { ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing } from '../../theme';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';

export type IdentityLayoutStyle = Pick<
  ViewStyle,
  'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type AvatarSize = 'small' | 'medium' | 'topBar' | 'card' | 'large';

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

const avatarSizes: Record<AvatarSize, number> = {
  small: spacing[32],
  medium: layout.minimumTouchTarget,
  topBar: 36,
  card: spacing[48],
  large: spacing[64],
};

const visibilityLabels: Record<VisibilityType, string> = {
  public: 'Public',
  friends: 'Friends',
  private: 'Private',
};

const visibilityBackgrounds: Record<VisibilityType, string> = {
  public: colors.action.secondary,
  friends: colors.category.secondary,
  private: colors.background.surface,
};

const licenseLabels: Record<LicenseType, string> = {
  invite: 'Invite only',
  location: 'Location',
  time: 'Time window',
  restricted: 'Restricted',
};

const licenseBackgrounds: Record<LicenseType, string> = {
  invite: colors.category.secondary,
  location: colors.action.secondary,
  time: colors.action.primary,
  restricted: colors.background.surface,
};

type BadgeProps = Omit<ViewProps, 'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'> & {
  accessibilityLabel: string;
  backgroundColor: string;
  children: ReactNode;
  onAccent?: boolean;
  style?: StyleProp<IdentityLayoutStyle>;
  testID?: string;
};

function Badge({
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
    style={[style, styles.badge, { backgroundColor }]}
  >
    <AppText variant="caption" color={onAccent ? 'text.onAccent' : 'text.primary'}>
      {children}
    </AppText>
  </View>;
}

export function Avatar({
  accessibilityLabel,
  initials,
  size = 'small',
  source,
  style,
  testID,
  ...viewProps
}: AvatarProps) {
  const dimension = avatarSizes[size];

  return <View
    {...viewProps}
    testID={testID}
    accessible
    accessibilityLabel={accessibilityLabel ?? `${initials} avatar`}
    accessibilityRole="image"
    style={[style, styles.avatar, { width: dimension, height: dimension }]}
  >
    {source ? <Image
      testID={testID ? `${testID}-image` : undefined}
      source={source}
      contentFit="cover"
      accessible={false}
      style={styles.avatarImage}
    /> : <AppText
      testID={testID ? `${testID}-initials` : undefined}
      variant={size === 'large' ? 'h5' : 'caption'}
    >
      {initials}
    </AppText>}
  </View>;
}

export function VisibilityBadge({
  style,
  testID,
  type = 'public',
  ...viewProps
}: VisibilityBadgeProps) {
  const label = visibilityLabels[type];

  return <Badge
    {...viewProps}
    testID={testID}
    accessibilityLabel={`Visibility: ${label}`}
    backgroundColor={visibilityBackgrounds[type]}
    onAccent={type === 'public'}
    style={style}
  >
    {label}
  </Badge>;
}

export function LicenseBadge({
  style,
  testID,
  type = 'invite',
  ...viewProps
}: LicenseBadgeProps) {
  const label = licenseLabels[type];

  return <Badge
    {...viewProps}
    testID={testID}
    accessibilityLabel={`Restriction: ${label}`}
    backgroundColor={licenseBackgrounds[type]}
    onAccent={type === 'location' || type === 'time'}
    style={style}
  >
    {label}
  </Badge>;
}

export function MusicPreferenceChip({
  accessibilityLabel,
  accessibilityState,
  children,
  disabled = false,
  selected = false,
  style,
  ...pressableProps
}: MusicPreferenceChipProps) {
  return <Pressable
    {...pressableProps}
    accessible
    accessibilityLabel={accessibilityLabel ?? children}
    accessibilityRole="checkbox"
    accessibilityState={{ ...accessibilityState, checked: selected, disabled }}
    disabled={disabled}
    hitSlop={spacing[8]}
    style={({ pressed }) => [
      style,
      styles.chip,
      selected ? styles.selectedChip : styles.defaultChip,
      disabled && styles.disabledChip,
      !disabled && pressed && pressedFeedback,
    ]}
  >
    <AppText variant="caption" color={selected && !disabled ? 'text.onAccent' : 'text.primary'}>
      {children}
    </AppText>
  </Pressable>;
}

const styles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.category.secondary,
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
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
