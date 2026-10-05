import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { configureGoogleSignIn, signInWithGoogle, signOutWithGoogle } from '../auth/google';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: { configure: jest.fn(), hasPlayServices: jest.fn(), signIn: jest.fn(), signOut: jest.fn() },
}));

const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
beforeEach(() => {
  jest.resetAllMocks();
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'web-client.apps.googleusercontent.com';
  jest.mocked(GoogleSignin.hasPlayServices).mockResolvedValue(true);
});
afterAll(() => {
  if (originalClientId === undefined) delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  else process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = originalClientId;
});

it('requests a Web-audience ID token and returns its email', async () => {
  jest.mocked(GoogleSignin.signIn).mockResolvedValue({ type: 'success', data: {
    idToken: 'google-id-token', serverAuthCode: null, scopes: [],
    user: { email: 'listener@example.com', id: '123', name: null, givenName: null, familyName: null, photo: null },
  } });
  await expect(signInWithGoogle()).resolves.toEqual({ idToken: 'google-id-token', email: 'listener@example.com' });
  expect(GoogleSignin.configure).toHaveBeenCalledWith({ webClientId: 'web-client.apps.googleusercontent.com', offlineAccess: false });
  expect(GoogleSignin.hasPlayServices).toHaveBeenCalledWith({ showPlayServicesUpdateDialog: true });
});

it('maps a cancelled response', async () => {
  jest.mocked(GoogleSignin.signIn).mockResolvedValue({ type: 'cancelled', data: null });
  await expect(signInWithGoogle()).rejects.toMatchObject({ code: 'cancelled', message: expect.stringContaining('cancelled') });
});

it.each(['SIGN_IN_CANCELLED', '12501'])('maps rejected cancellation %s', async (code) => {
  jest.mocked(GoogleSignin.signIn).mockRejectedValue({ code });
  await expect(signInWithGoogle()).rejects.toMatchObject({ code: 'cancelled' });
});

it.each(['DEVELOPER_ERROR', '10', 10])('maps configuration error %s', async (code) => {
  jest.mocked(GoogleSignin.signIn).mockRejectedValue({ code });
  await expect(signInWithGoogle()).rejects.toMatchObject({ code: 'configuration', message: expect.stringContaining('SHA-1 / package name not registered in Google Cloud') });
});

it('reports a missing Web client ID before invoking native code', () => {
  delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  expect(configureGoogleSignIn).toThrow('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  expect(GoogleSignin.configure).not.toHaveBeenCalled();
});

it.each([
  ['IN_PROGRESS', 'in_progress'],
  ['ASYNC_OP_IN_PROGRESS', 'in_progress'],
  ['PLAY_SERVICES_NOT_AVAILABLE', 'play_services_missing'],
  ['SIGN_IN_REQUIRED', 'sign_in_required'],
  ['unexpected', 'unknown'],
])('maps %s into a typed error', async (code, expected) => {
  jest.mocked(GoogleSignin.signIn).mockRejectedValue({ code });
  await expect(signInWithGoogle()).rejects.toMatchObject({ code: expected });
});

it('signs out through the guarded native helper', async () => {
  await signOutWithGoogle();
  expect(GoogleSignin.signOut).toHaveBeenCalledTimes(1);
});
