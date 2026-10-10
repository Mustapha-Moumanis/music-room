import { HugeiconsIcon } from '@hugeicons/react-native';
import type { ComponentProps } from 'react';
import { View, type ViewProps } from 'react-native';

import { colors, iconMetrics, type IconSize, type IconStrokeWidth } from '../../theme';

export type AppIconTone = 'default' | 'active' | 'secondary' | 'muted' | 'onAccent';
export type AppIconData = ComponentProps<typeof HugeiconsIcon>['icon'];

export type AppIconProps = Omit<ViewProps, 'accessibilityLabel' | 'accessibilityRole' | 'children'> & {
  icon: AppIconData;
  size?: IconSize;
  strokeWidth?: IconStrokeWidth;
  tone?: AppIconTone;
  label?: string;
};

const iconColors: Record<AppIconTone, string> = {
  default: colors.text.primary,
  active: colors.action.primary,
  secondary: colors.action.secondary,
  muted: colors.text.muted,
  onAccent: colors.text.onAccent,
};

export function AppIcon({ icon, size = 'standard', strokeWidth = 1.5, tone = 'default', label, ...viewProps }: AppIconProps) {
  const isLabeled = Boolean(label);

  return <View
    {...viewProps}
    accessible={isLabeled}
    accessibilityElementsHidden={!isLabeled}
    accessibilityLabel={label}
    accessibilityRole={isLabeled ? 'image' : undefined}
    importantForAccessibility={isLabeled ? 'yes' : 'no-hide-descendants'}
  >
    <HugeiconsIcon icon={icon} size={iconMetrics[size]} strokeWidth={strokeWidth} color={iconColors[tone]} />
  </View>;
}
