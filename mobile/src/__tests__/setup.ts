/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});
jest.mock('expo-device', () => ({ brand: 'TestBrand', modelName: 'TestPhone' }));
jest.mock('expo-application', () => ({ nativeApplicationVersion: '1.0.0', nativeBuildVersion: '7' }));
jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => 'test-request-id') }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));
