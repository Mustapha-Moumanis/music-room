import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Music Room',
  slug: 'music-room-mobile',
  version: '1.0.0',
  scheme: 'musicroom',
  platforms: ['android'],
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
};
export default config;
