import { AxiosError, create, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { randomUUID } from 'expo-crypto';

import { clientInfoHeaders } from '../lib/client-info';
import { expireSession } from '../lib/session-events';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '../lib/token-storage';
import { useSettingsStore } from '../stores/settings.store';
import { toApiError } from './errors';

export { ApiError } from './errors';
export const apiClient = create({ timeout: 8000 });
const refreshClient = create({ timeout: 8000 });
export const authRefreshClient = refreshClient;
let refreshPromise: Promise<string> | null = null;

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean; _sentBearer?: boolean };

function authPath(config: AxiosRequestConfig): string {
  const url = config.url ?? '';
  if (/^https?:\/\//.test(url)) {
    try { return new URL(url).pathname.replace(/^\/api/, ''); } catch { return url; }
  }
  return url.split('?')[0];
}

function canRefresh(error: AxiosError, config: RetryConfig): boolean {
  if (error.response?.status !== 401 || config._retry || !config._sentBearer) return false;
  const path = authPath(config);
  return !(
    path === '/auth/login'
    || path === '/auth/register'
    || path === '/auth/refresh'
    || path === '/auth/google'
    || path === '/auth/logout'
    || path.startsWith('/auth/password/')
    || path.startsWith('/auth/verify/')
  );
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');
      const response = await refreshClient.post<{ accessToken: string; refreshToken: string }>(
        `${useSettingsStore.getState().backendUrl}/api/auth/refresh`,
        { refreshToken },
        { headers: { ...clientInfoHeaders(), 'X-Request-Id': randomUUID() } },
      );
      await setAccessToken(response.data.accessToken);
      await setRefreshToken(response.data.refreshToken);
      return response.data.accessToken;
    })().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  // Read after the asynchronous token lookup so a settings change takes effect immediately.
  config.baseURL = `${useSettingsStore.getState().backendUrl}/api`;
  for (const [name, value] of Object.entries(clientInfoHeaders())) config.headers.set(name, value);
  config.headers.set('X-Request-Id', randomUUID());
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
    (config as RetryConfig)._sentBearer = true;
  } else {
    config.headers.delete('Authorization');
    (config as RetryConfig)._sentBearer = false;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (error instanceof AxiosError && error.config && canRefresh(error, error.config as RetryConfig)) {
      const original = error.config as RetryConfig;
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.set('Authorization', `Bearer ${token}`);
        return apiClient.request(original);
      } catch (refreshError) {
        const apiError = toApiError(refreshError);
        // Only a server rejection ends the session; a network blip must not log the user out.
        if (apiError.status === 401 || !(await getRefreshToken())) {
          await clearTokens();
          await expireSession();
        }
        return Promise.reject(apiError);
      }
    }
    return Promise.reject(toApiError(error));
  },
);
