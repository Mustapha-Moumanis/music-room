import { AxiosError, type AxiosAdapter } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { apiClient } from '../api/client';
import { ApiError } from '../api/errors';
import { DEFAULT_BACKEND_URL } from '../config/backend';
import { useSettingsStore } from '../stores/settings.store';

const adapter: jest.MockedFunction<AxiosAdapter> = jest.fn(async (config) => ({
  data: { status: 'ok' }, status: 200, statusText: 'OK', headers: {}, config,
}));

beforeEach(() => {
  adapter.mockClear();
  apiClient.defaults.adapter = adapter;
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
  useSettingsStore.setState({ backendUrl: DEFAULT_BACKEND_URL, hydrated: true });
});

it('adds client information and a request ID, and reads the latest backend for each request', async () => {
  await apiClient.get('/health');
  useSettingsStore.getState().setBackendUrl('http://192.168.1.20:3000/api');
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue('access-token');
  await apiClient.get('/health');
  const first = adapter.mock.calls[0][0];
  const latest = adapter.mock.calls[1][0];
  expect(first.baseURL).toBe(`${DEFAULT_BACKEND_URL}/api`);
  expect(latest.baseURL).toBe('http://192.168.1.20:3000/api');
  expect(latest.headers.get('X-Platform')).toBe(Platform.OS);
  expect(latest.headers.get('X-Device')).toBe('TestBrand TestPhone');
  expect(latest.headers.get('X-App-Version')).toBe('1.0.0(7)');
  expect(latest.headers.get('X-Request-Id')).toBe('test-request-id');
  expect(latest.headers.get('Authorization')).toBe('Bearer access-token');
  expect(first.headers.has('Authorization')).toBe(false);
  expect(latest.timeout).toBe(8000);
});

it.each([['ECONNABORTED', 'TIMEOUT'], ['ERR_NETWORK', 'NETWORK']])('maps %s to an ApiError', async (code, expected) => {
  adapter.mockRejectedValueOnce(new AxiosError('failed', code));
  await expect(apiClient.get('/health')).rejects.toMatchObject({ name: 'ApiError', code: expected });
});

it('maps HTTP responses to a typed status error', async () => {
  adapter.mockImplementationOnce(async (config) => {
    throw new AxiosError('failed', 'ERR_BAD_REQUEST', config, undefined, { data: {}, status: 404, statusText: 'Not found', headers: {}, config });
  });
  await expect(apiClient.get('/missing')).rejects.toBeInstanceOf(ApiError);
});
