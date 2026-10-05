import { AxiosError, create } from 'axios';

import { pingHealth } from '../api/health';
import { BackendUrlError } from '../config/backend';
import { useSettingsStore } from '../stores/settings.store';

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  create: jest.fn(() => ({ get: jest.fn() })),
}));

const get = jest.mocked(create).mock.results[0].value.get as jest.Mock;

beforeEach(() => get.mockReset());

it('tests the candidate origin, independently of the saved URL, without auth', async () => {
  useSettingsStore.setState({ backendUrl: 'http://saved:3000' });
  get.mockResolvedValue({ status: 200, data: { status: 'ok' } });
  const result = await pingHealth('http://candidate:3000/api/');
  expect(create).toHaveBeenCalledWith({ timeout: 8000 });
  expect(get).toHaveBeenCalledWith('http://candidate:3000/api/health', expect.objectContaining({
    headers: expect.objectContaining({ 'X-Request-Id': 'test-request-id' }),
  }));
  expect(get.mock.calls[0][1].headers.Authorization).toBeUndefined();
  expect(result).toEqual({ ok: true, latencyMs: expect.any(Number) });
});

it('rejects invalid input before making a request', async () => {
  await expect(pingHealth('bad')).rejects.toBeInstanceOf(BackendUrlError);
  expect(get).not.toHaveBeenCalled();
});

it('describes an eight-second timeout with the candidate address', async () => {
  get.mockRejectedValue(new AxiosError('timeout', 'ECONNABORTED'));
  await expect(pingHealth('http://candidate:3000')).rejects.toMatchObject({
    code: 'TIMEOUT', message: 'Server unreachable at http://candidate:3000 (timeout after 8 s)',
  });
});

it('describes the endpoint and HTTP failure status', async () => {
  get.mockRejectedValue(new AxiosError('not found', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 404, statusText: 'Not found', data: {}, headers: {}, config: {} as never,
  }));
  await expect(pingHealth('http://candidate:3000')).rejects.toMatchObject({
    code: 'HTTP', status: 404, message: 'Reached server but /api/health returned 404',
  });
});

it('does not treat an unrelated successful response as a healthy backend', async () => {
  get.mockResolvedValue({ status: 200, data: '<html>not the API</html>' });
  await expect(pingHealth('http://candidate:3000')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
});
