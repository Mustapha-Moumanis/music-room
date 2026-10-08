// Web build only: native Google Sign-In exists only in the Android app.
export type GoogleSignInErrorCode = 'cancelled' | 'in_progress' | 'play_services_missing' | 'configuration' | 'native_module_missing' | 'sign_in_required' | 'unknown';
export type GoogleSignInResult = { idToken: string; email: string };

export const googleSignInAvailable = false;

export class GoogleSignInError extends Error {
  constructor(public readonly code: GoogleSignInErrorCode, message: string) {
    super(message);
    this.name = 'GoogleSignInError';
  }
}

const unavailable = () => new GoogleSignInError('native_module_missing', 'Google sign-in is only available in the Android app. Use email and password on the web.');

export function configureGoogleSignIn(): void {
  throw unavailable();
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  throw unavailable();
}

export async function signOutWithGoogle(): Promise<void> {
  throw unavailable();
}
