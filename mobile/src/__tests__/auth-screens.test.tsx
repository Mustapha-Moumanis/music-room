/* eslint-disable import/first -- feature imports intentionally follow hoisted router mocks */
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush, replace: mockReplace }),
}));

import {
  CheckMailScreen,
  LoginScreen,
  MusicPreferencesScreen,
  ProfileSetupScreen,
  WelcomeScreen,
} from '../features/auth/auth-screens';

beforeEach(() => {
  jest.clearAllMocks();
});

it('enters the app after profile setup', async () => {
  await render(<ProfileSetupScreen />);

  await fireEvent.press(screen.getByText('Finish setup'));
  expect(mockReplace).toHaveBeenCalledWith('/home');
});

it('renders the Figma welcome screen and navigates to registration', async () => {
  await render(<WelcomeScreen />);

  expect(screen.getByTestId('welcome-screen')).toBeTruthy();
  expect(screen.getByText(/Old sounds/)).toBeTruthy();
  await fireEvent.press(screen.getByText('Create account'));
  expect(mockPush).toHaveBeenCalledWith('/register');
});

it('connects login recovery and provider actions to their local routes', async () => {
  await render(<LoginScreen />);

  await fireEvent.press(screen.getByText('Forgot password?'));
  await fireEvent.press(screen.getByText('Continue with Google'));
  expect(mockPush).toHaveBeenCalledWith('/forgot-password');
  expect(mockPush).toHaveBeenCalledWith('/google-sign-in');
});

it('shows local resend feedback without requiring the backend', async () => {
  await render(<CheckMailScreen />);

  await fireEvent.press(screen.getByText('Resend email'));
  expect(screen.getByText('Email sent again')).toBeTruthy();
});

it('keeps music preferences selectable and advances to profile setup', async () => {
  await render(<MusicPreferencesScreen />);

  const rock = screen.getByRole('checkbox', { name: 'Rock' });
  expect(rock.props.accessibilityState.checked).toBe(false);
  await fireEvent.press(rock);
  expect(screen.getByRole('checkbox', { name: 'Rock' }).props.accessibilityState.checked).toBe(true);

  await fireEvent.press(screen.getByText('Continue'));
  expect(mockPush).toHaveBeenCalledWith('/profile-setup');
});
