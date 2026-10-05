import { create } from 'axios';
import { randomUUID } from 'expo-crypto';

import { clientInfoHeaders } from '../lib/client-info';
import { getAccessToken } from '../lib/token-storage';
import { useSettingsStore } from '../stores/settings.store';
import { toApiError } from './errors';

export { ApiError } from './errors';
export const apiClient = create({ timeout: 8000 });

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  // Read after the asynchronous token lookup so a settings change takes effect immediately.
  config.baseURL = `${useSettingsStore.getState().backendUrl}/api`;
  for (const [name, value] of Object.entries(clientInfoHeaders())) config.headers.set(name, value);
  config.headers.set('X-Request-Id', randomUUID());
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  else config.headers.delete('Authorization');
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
