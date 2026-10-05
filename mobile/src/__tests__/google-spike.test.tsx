import { fireEvent, render, screen } from '@testing-library/react-native';

import GoogleSpikeScreen from '../../app/dev/google-spike';

jest.mock('@react-native-google-signin/google-signin', () => {
  throw new Error('RNGoogleSignin native module is absent');
});
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }));
jest.mock('expo-router', () => ({ Redirect: () => null }));

it('renders without loading native Google Sign-In and handles attempts safely', async () => {
  const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'web-client.apps.googleusercontent.com';
  try {
    await render(<GoogleSpikeScreen />);
    expect(screen.getByText('Google sign-in spike')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in with Google' }));
    expect(await screen.findByText(/Google Sign-In is unavailable in this build/)).toBeTruthy();
  } finally {
    if (originalClientId === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    else process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = originalClientId;
  }
});
