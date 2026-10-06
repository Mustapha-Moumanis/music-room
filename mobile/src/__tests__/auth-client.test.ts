import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { apiClient, authRefreshClient } from '../api/client';
import { DEFAULT_BACKEND_URL } from '../config/backend';
import { useSettingsStore } from '../stores/settings.store';
import { useSessionStore } from '../stores/session.store';

const apiAdapter: jest.MockedFunction<AxiosAdapter> = jest.fn();
const refreshAdapter: jest.MockedFunction<AxiosAdapter> = jest.fn();
let secureStore: Record<string, string | undefined>;

function rejectStatus(config: InternalAxiosRequestConfig, status: number, code = 'UNAUTHORIZED') {
  return Promise.reject(new AxiosError('failed', 'ERR_BAD_REQUEST', config, undefined, {
    data: { code }, status, statusText: 'Unauthorized', headers: {}, config,
  }));
}

beforeEach(() => {
  secureStore = {
    'music-room.access-token': 'old-access',
    'music-room.refresh-token': 'old-refresh',
  };
  jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => secureStore[key] ?? null);
  jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => { secureStore[key] = value; });
  jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => { delete secureStore[key]; });
  apiAdapter.mockReset();
  refreshAdapter.mockReset();
  apiClient.defaults.adapter = apiAdapter;
  authRefreshClient.defaults.adapter = refreshAdapter;
  useSettingsStore.setState({ backendUrl: DEFAULT_BACKEND_URL, hydrated: true });
  useSessionStore.setState({ status: 'signedIn', user: null });
});

it('shares one silent refresh across concurrent 401s and retries both requests', async () => {
  apiAdapter.mockImplementation(async (config) => {
    if (config.headers.get('Authorization') === 'Bearer old-access') return rejectStatus(config, 401);
    return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
  });
  refreshAdapter.mockResolvedValue({
    data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    status: 200, statusText: 'OK', headers: {}, config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
  });

  await expect(Promise.all([apiClient.get('/auth/me'), apiClient.get('/rooms')])).resolves.toHaveLength(2);

  expect(refreshAdapter).toHaveBeenCalledTimes(1);
  expect(apiAdapter).toHaveBeenCalledTimes(4);
  expect(secureStore['music-room.access-token']).toBe('new-access');
  expect(secureStore['music-room.refresh-token']).toBe('new-refresh');
});

it('clears tokens and signs out when silent refresh fails', async () => {
  apiAdapter.mockImplementation((config) => rejectStatus(config, 401));
  refreshAdapter.mockImplementation((config) => rejectStatus(config, 401, 'INVALID_REFRESH_TOKEN'));

  await expect(apiClient.get('/auth/me')).rejects.toMatchObject({ code: 'INVALID_REFRESH_TOKEN' });

  expect(secureStore['music-room.access-token']).toBeUndefined();
  expect(secureStore['music-room.refresh-token']).toBeUndefined();
  expect(useSessionStore.getState().status).toBe('signedOut');
});

it('does not refresh auth endpoint failures', async () => {
  apiAdapter.mockImplementation((config) => rejectStatus(config, 401, 'INVALID_CREDENTIALS'));

  await expect(apiClient.post('/auth/login', { email: 'a@b.c', password: 'wrong' })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });

  expect(refreshAdapter).not.toHaveBeenCalled();
});
