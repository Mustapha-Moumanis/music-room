/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
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

it('enters the app after profile setup', () => {
  render(<ProfileSetupScreen />);

  fireEvent.press(screen.getByText('Finish setup'));
  expect(mockReplace).toHaveBeenCalledWith('/home');
});

it('renders the Figma welcome screen and navigates to registration', () => {
  render(<WelcomeScreen />);

  expect(screen.getByTestId('welcome-screen')).toBeTruthy();
  expect(screen.getByText(/Old sounds/)).toBeTruthy();
  fireEvent.press(screen.getByText('Create account'));
  expect(mockPush).toHaveBeenCalledWith('/register');
});

it('connects login recovery and provider actions to their local routes', () => {
  render(<LoginScreen />);

  fireEvent.press(screen.getByText('Forgot password?'));
  fireEvent.press(screen.getByText('Continue with Google'));
  expect(mockPush).toHaveBeenCalledWith('/forgot-password');
  expect(mockPush).toHaveBeenCalledWith('/google-sign-in');
});

it('shows local resend feedback without requiring the backend', () => {
  render(<CheckMailScreen />);

  fireEvent.press(screen.getByText('Resend email'));
  expect(screen.getByText('Email sent again')).toBeTruthy();
});

it('keeps music preferences selectable and advances to profile setup', () => {
  render(<MusicPreferencesScreen />);

  const rock = screen.getByRole('checkbox', { name: 'Rock' });
  expect(rock.props.accessibilityState.checked).toBe(false);
  fireEvent.press(rock);
  expect(screen.getByRole('checkbox', { name: 'Rock' }).props.accessibilityState.checked).toBe(true);

  fireEvent.press(screen.getByText('Continue'));
  expect(mockPush).toHaveBeenCalledWith('/profile-setup');
});
