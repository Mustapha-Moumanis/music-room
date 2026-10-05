import Constants from 'expo-constants';

// True in Metro dev builds and in the `.dev` variant APK (EAS "spike" profile),
// which is a release build (__DEV__ false) used to test dev-only screens on a phone.
export function isDevBuild(): boolean {
  return __DEV__ || Constants.expoConfig?.extra?.appVariant === 'development';
}
