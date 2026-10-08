// Web build only (used for UI testing in a browser). Browsers have no secure keystore, so tokens
// live in localStorage; the Android app keeps using expo-secure-store via token-storage.ts.
const ACCESS_KEY = 'music-room.access-token';
const REFRESH_KEY = 'music-room.refresh-token';

const read = async (key: string): Promise<string | null> => window.localStorage.getItem(key);
const write = async (key: string, value: string): Promise<void> => window.localStorage.setItem(key, value);
const remove = async (key: string): Promise<void> => window.localStorage.removeItem(key);

export const getAccessToken = () => read(ACCESS_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);
export const setAccessToken = (token: string) => write(ACCESS_KEY, token);
export const setRefreshToken = (token: string) => write(REFRESH_KEY, token);
export const clearAccessToken = () => remove(ACCESS_KEY);
export const clearRefreshToken = () => remove(REFRESH_KEY);
export async function clearTokens(): Promise<void> {
  await Promise.all([clearAccessToken(), clearRefreshToken()]);
}
