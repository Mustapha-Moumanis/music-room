import { Platform, type ViewStyle } from 'react-native';

const needsLegacyAndroidShadow = Platform.OS === 'android' && Number(Platform.Version) < 28;

export const shadows = {
  subtle: {
    boxShadow: '0 8px 24px 0 #0000002E',
    ...(needsLegacyAndroidShadow ? { elevation: 3 } : null),
  },
  floating: {
    boxShadow: '0 12px 32px -4px #00000047',
    ...(needsLegacyAndroidShadow ? { elevation: 8 } : null),
  },
} as const satisfies Record<string, ViewStyle>;

export type ShadowToken = keyof typeof shadows;
