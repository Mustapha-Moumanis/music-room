// Type-only reference: importing this helper must not load the native module.
type GoogleModule = typeof import('@react-native-google-signin/google-signin');

export type GoogleSignInErrorCode = 'cancelled' | 'in_progress' | 'play_services_missing' | 'configuration' | 'native_module_missing' | 'sign_in_required' | 'unknown';
export type GoogleSignInResult = { idToken: string; email: string };

/** Native Google Sign-In ships in the Android app; the web build swaps in google.web.ts. */
export const googleSignInAvailable = true;

export class GoogleSignInError extends Error {
  constructor(public readonly code: GoogleSignInErrorCode, message: string) {
    super(message);
    this.name = 'GoogleSignInError';
  }
}

const configurationHint = 'SHA-1 / package name not registered in Google Cloud';

function nativeModule(): GoogleModule {
  try {
    // Expo Go and JS-only tests do not contain RNGoogleSignin.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-google-signin/google-signin') as GoogleModule;
  } catch {
    throw new GoogleSignInError('native_module_missing', 'Google Sign-In is unavailable in this build. Install a new Android development client with the Google Sign-In plugin; Expo Go is unsupported.');
  }
}

function readableError(error: unknown): GoogleSignInError {
  if (error instanceof GoogleSignInError) return error;
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message : '';
  switch (code) {
    case 'SIGN_IN_CANCELLED': case '12501':
      return new GoogleSignInError('cancelled', 'Google sign-in was cancelled. Try again when ready.');
    case 'IN_PROGRESS': case 'ASYNC_OP_IN_PROGRESS': case '12502':
      return new GoogleSignInError('in_progress', 'Google sign-in is already in progress. Finish the open sign-in prompt.');
    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return new GoogleSignInError('play_services_missing', 'Google Play Services are missing or outdated. Install or update them on your Android device.');
    case 'SIGN_IN_REQUIRED': case '4':
      return new GoogleSignInError('sign_in_required', 'Google sign-in is required. Sign out and try signing in again.');
    case 'DEVELOPER_ERROR': case '10':
      return new GoogleSignInError('configuration', `Google Sign-In configuration error: ${configurationHint}. Check the Web client ID too.`);
  }
  if (message.includes('DEVELOPER_ERROR')) {
    return new GoogleSignInError('configuration', `Google Sign-In configuration error: ${configurationHint}. Check the Web client ID too.`);
  }
  return new GoogleSignInError('unknown', 'Google sign-in failed. Check your connection and try again.');
}

export function configureGoogleSignIn(): void {
  try {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
    if (!webClientId) {
      throw new GoogleSignInError('configuration', `Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Set it to the Google Cloud Web client ID. Setup hint: ${configurationHint}.`);
    }
    nativeModule().GoogleSignin.configure({ webClientId, offlineAccess: false });
  } catch (error) {
    throw readableError(error);
  }
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    configureGoogleSignIn();
    const { GoogleSignin } = nativeModule();
    const available = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    if (!available) throw new GoogleSignInError('play_services_missing', 'Google Play Services are missing or outdated. Install or update them on your Android device.');
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') throw new GoogleSignInError('cancelled', 'Google sign-in was cancelled. Try again when ready.');
    const { idToken, user } = response.data;
    if (!idToken) throw new GoogleSignInError('configuration', `Google returned no idToken. Check the Web client ID and Android registration: ${configurationHint}.`);
    return { idToken, email: user.email };
  } catch (error) {
    throw readableError(error);
  }
}

export async function signOutWithGoogle(): Promise<void> {
  try {
    configureGoogleSignIn();
    await nativeModule().GoogleSignin.signOut();
  } catch (error) {
    throw readableError(error);
  }
}
