import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SettingsScreen from '../../app/settings';
import { pingHealth } from '../api/health';
import { DEFAULT_BACKEND_URL } from '../config/backend';
import { useSettingsStore } from '../stores/settings.store';

jest.mock('../api/health', () => ({ pingHealth: jest.fn() }));

beforeEach(() => {
  jest.mocked(pingHealth).mockReset();
  useSettingsStore.setState({ backendUrl: DEFAULT_BACKEND_URL, hydrated: true });
});

it('shows an invalid-URL error without crashing or sending a request', async () => {
  await render(<SettingsScreen />);
  await fireEvent.changeText(screen.getByLabelText('Backend URL'), 'not a url');
  await fireEvent.press(screen.getByRole('button', { name: 'Test connection' }));
  expect(await screen.findByText('Invalid URL — must start with http:// or https://')).toBeTruthy();
  expect(pingHealth).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('button', { name: 'Save anyway' }));
  expect(useSettingsStore.getState().backendUrl).toBe(DEFAULT_BACKEND_URL);
});

it('requires a successful test before Save, and invalidates it on editing', async () => {
  jest.mocked(pingHealth).mockResolvedValue({ ok: true, latencyMs: 42 });
  await render(<SettingsScreen />);
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Backend URL'), 'http://192.168.1.10:3000/api');
  await fireEvent.press(screen.getByRole('button', { name: 'Test connection' }));
  expect(await screen.findByText('✓ Connected (42 ms)')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  expect(useSettingsStore.getState().backendUrl).toBe('http://192.168.1.10:3000');
  await fireEvent.changeText(screen.getByLabelText('Backend URL'), 'http://other:3000');
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});

it('ignores a successful response for an edited candidate', async () => {
  let resolve!: (result: { ok: true; latencyMs: number }) => void;
  jest.mocked(pingHealth).mockImplementation(() => new Promise((done) => { resolve = done; }));
  await render(<SettingsScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Test connection' }));
  await fireEvent.changeText(screen.getByLabelText('Backend URL'), 'http://other:3000');
  resolve({ ok: true, latencyMs: 42 });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled());
  expect(screen.queryByText('✓ Connected (42 ms)')).toBeNull();
});
