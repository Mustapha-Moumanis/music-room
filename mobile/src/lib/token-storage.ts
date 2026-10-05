import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'music-room.access-token';
const REFRESH_KEY = 'music-room.refresh-token';

export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY);
export const setAccessToken = (token: string) => SecureStore.setItemAsync(ACCESS_KEY, token);
export const setRefreshToken = (token: string) => SecureStore.setItemAsync(REFRESH_KEY, token);
export const clearAccessToken = () => SecureStore.deleteItemAsync(ACCESS_KEY);
export const clearRefreshToken = () => SecureStore.deleteItemAsync(REFRESH_KEY);
export async function clearTokens(): Promise<void> {
  await Promise.all([clearAccessToken(), clearRefreshToken()]);
}
