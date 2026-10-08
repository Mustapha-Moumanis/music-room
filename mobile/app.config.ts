import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Music Room',
  slug: 'music-room',
  owner: 'music-room-42s-team',
  version: '1.0.0',
  scheme: 'musicroom',
  // Web is for previewing and testing the UI in a browser; the shipped app is Android.
  platforms: ['android', 'web'],
  web: { bundler: 'metro', output: 'single' },
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  android: {
    package: `com.musicroom.app${process.env.APP_VARIANT === 'development' ? '.dev' : ''}`,
    versionCode: 1,
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    '@react-native-google-signin/google-signin',
    'expo-secure-store',
    ['expo-build-properties', { android: { usesCleartextTraffic: true } }],
  ],
  extra: {
    appVariant: process.env.APP_VARIANT ?? 'production',
    eas: { projectId: '09f95592-6497-4af9-8a1d-af278f06e49a' },
  },
};
export default config;
