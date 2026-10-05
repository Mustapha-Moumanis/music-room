import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export function clientInfoHeaders(): Record<string, string> {
  const version = Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? 'unknown';
  const build = Application.nativeBuildVersion ?? Constants.expoConfig?.android?.versionCode?.toString() ?? 'unknown';
  return {
    'X-Platform': Platform.OS,
    'X-Device': [Device.brand, Device.modelName].filter(Boolean).join(' ') || 'unknown',
    'X-App-Version': `${version}(${build})`,
  };
}
