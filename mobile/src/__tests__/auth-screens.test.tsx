import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import AccountScreen from '../../app/(app)/account';
import LoginScreen from '../../app/(auth)/login';
import RegisterScreen from '../../app/(auth)/register';
import ResetPasswordScreen from '../../app/(auth)/reset-password';
import { login, resetPassword, unlinkGoogle } from '../api/auth';
import { ApiError } from '../api/errors';
import { pingHealth } from '../api/health';
import { useSessionStore } from '../stores/session.store';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), replace: (...args: unknown[]) => mockReplace(...args) },
  useLocalSearchParams: () => ({ email: 'ana@example.com' }),
}));
jest.mock('../api/health', () => ({ pingHealth: jest.fn() }));
jest.mock('../api/auth', () => ({
  login: jest.fn(),
  register: jest.fn(),
  resetPassword: jest.fn(),
  unlinkGoogle: jest.fn(),
  linkGoogle: jest.fn(),
  logoutAll: jest.fn(),
}));
jest.mock('../auth/google', () => ({ googleSignInAvailable: true, signInWithGoogle: jest.fn() }));

function Wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(pingHealth).mockResolvedValue({ ok: true, latencyMs: 4 });
  useSessionStore.setState({ status: 'signedOut', user: null });
});

it('navigates unverified login attempts to check-your-mail with the email', async () => {
  jest.mocked(login).mockRejectedValue(new ApiError('EMAIL_NOT_VERIFIED', 'not verified', 403));
  await render(<LoginScreen />, { wrapper: Wrapper });

  await fireEvent.changeText(screen.getByLabelText('Email'), 'ana@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'password123');
  await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));

  await waitFor(() => expect(mockPush).toHaveBeenCalledWith({ pathname: '/(auth)/check-mail', params: { email: 'ana@example.com' } }));
});

it('maps invalid credentials on login', async () => {
  jest.mocked(login).mockRejectedValue(new ApiError('INVALID_CREDENTIALS', 'bad', 401));
  await render(<LoginScreen />, { wrapper: Wrapper });

  await fireEvent.changeText(screen.getByLabelText('Email'), 'ana@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'wrong-password');
  await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));

  expect(await screen.findByText('Wrong email or password.')).toBeTruthy();
});

it('validates register password mismatch and weak passwords', async () => {
  await render(<RegisterScreen />);

  await fireEvent.changeText(screen.getByLabelText('Password'), 'password123');
  await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'password124');
  await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
  expect(await screen.findByText('Passwords do not match.')).toBeTruthy();

  await fireEvent.changeText(screen.getByLabelText('Password'), 'short');
  await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'short');
  await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
  expect(await screen.findAllByText('Use 10-128 chars with at least one letter and one digit.')).toHaveLength(2);
});

it('maps invalid reset code', async () => {
  jest.mocked(resetPassword).mockRejectedValue(new ApiError('INVALID_RESET_CODE', 'bad code', 400));
  await render(<ResetPasswordScreen />);

  await fireEvent.changeText(screen.getByLabelText('6-digit code'), '123456');
  await fireEvent.changeText(screen.getByLabelText('New password'), 'password123');
  await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'password123');
  await fireEvent.press(screen.getByRole('button', { name: 'Change password' }));

  expect(await screen.findByText('Invalid or expired code.')).toBeTruthy();
});

it('disables unlinking Google when the account has no password', async () => {
  useSessionStore.setState({
    status: 'signedIn',
    user: { id: 'u1', email: 'ana@example.com', displayName: 'Ana', emailVerified: true, hasPassword: false, providers: ['GOOGLE'] },
  });
  await render(<AccountScreen />);

  expect(screen.getByText('Add a password before unlinking Google.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Unlink Google' })).toBeDisabled();
  expect(unlinkGoogle).not.toHaveBeenCalled();
});
