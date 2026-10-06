import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { apiClient, authRefreshClient } from '../api/client';
import { useSessionStore } from '../stores/session.store';

const adapter: jest.MockedFunction<AxiosAdapter> = jest.fn();

beforeEach(() => {
  adapter.mockReset();
  apiClient.defaults.adapter = adapter;
  authRefreshClient.defaults.adapter = adapter;
  jest.mocked(SecureStore.deleteItemAsync).mockClear();
  useSessionStore.setState({ status: 'loading', user: null });
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
});

it('bootstraps to signed out without a stored refresh token', async () => {
  await useSessionStore.getState().bootstrap();
  expect(useSessionStore.getState()).toMatchObject({ status: 'signedOut', user: null });
  expect(adapter).not.toHaveBeenCalled();
});

it('bootstraps a stored session through /auth/me', async () => {
  jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => key.includes('refresh') ? 'refresh-token' : 'access-token');
  adapter.mockResolvedValue({
    data: { id: 'u1', email: 'ana@example.com', displayName: 'Ana', emailVerified: true, hasPassword: true, providers: ['LOCAL'] },
    status: 200, statusText: 'OK', headers: {}, config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
  });

  await useSessionStore.getState().bootstrap();

  expect(useSessionStore.getState()).toMatchObject({ status: 'signedIn', user: { email: 'ana@example.com' } });
});

it('clears a broken stored session during bootstrap', async () => {
  jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => key.includes('refresh') ? 'refresh-token' : 'access-token');
  adapter.mockImplementation(async (config) => {
    throw new AxiosError('failed', 'ERR_BAD_REQUEST', config, undefined, { data: { code: 'UNAUTHORIZED' }, status: 401, statusText: 'Unauthorized', headers: {}, config });
  });

  await useSessionStore.getState().bootstrap();

  expect(useSessionStore.getState().status).toBe('signedOut');
  expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
});

it('keeps the stored session when the backend is unreachable at startup', async () => {
  jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => key.includes('refresh') ? 'refresh-token' : 'access-token');
  adapter.mockImplementation(async (config) => {
    throw new AxiosError('Network Error', 'ERR_NETWORK', config);
  });

  await useSessionStore.getState().bootstrap();

  expect(useSessionStore.getState()).toMatchObject({ status: 'signedIn', user: null });
  expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
});
