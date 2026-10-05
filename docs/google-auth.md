# Google Sign-In spike (MCH-84)

This Android-only development screen proves that a real device can obtain a Google ID token whose audience is the **Web** OAuth client ID and that the backend can verify it. It does not create accounts or sessions. M1 (MCH-89/92) will implement the real flow.

## 1. Configure Google Cloud

1. Create or select a project in the [Google Cloud console](https://console.cloud.google.com/). Keep both OAuth clients in this project.
2. Open Google Auth Platform (or APIs & Services → OAuth consent screen). Configure the app name and support/developer email. Choose **External**, keep the app in **Testing**, and add the Google accounts used on test devices under **Test users** (Audience). Basic profile/email scopes are sufficient.
3. Under Clients (or Credentials → Create credentials → OAuth client ID), create a **Web application** OAuth client. No browser redirect URI is needed for this native spike. Copy its client ID, not its client secret, into both local files:

   ```dotenv
   # Repository root .env (backend)
   GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
   ```

   ```dotenv
   # mobile/.env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
   APP_VARIANT=development
   ```

   These must be the same **Web** ID. Do not use the Android client ID in either variable. Restart Metro after changing public environment variables; ensure the public Web client ID is also available to EAS when bundling remotely (local `.env` files are ignored by git; configure the selected EAS environment).
4. Create an **Android** OAuth client using the actual installed package and signing certificate SHA-1:

   | Build | Package name |
   | --- | --- |
   | Development (`APP_VARIANT=development`) | `com.musicroom.app.dev` |
   | Release | `com.musicroom.app` |

   On a machine with the Android SDK and generated `mobile/android` project, inspect the certificate actually used by the build:

   ```sh
   cd mobile/android && ./gradlew signingReport
   ```

   Or inspect the standard local debug keystore, **if that is the keystore your build uses**:

   ```sh
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   Expo-generated projects may use a project-local debug keystore instead. Prefer the matching variant's SHA-1 from `signingReport`. Each package/certificate pair needs a matching Android OAuth client.
5. For EAS builds, run `eas credentials` from `mobile/`, select Android and the appropriate build profile, and obtain the signing certificate SHA-1. Register it with the development package for a development build; do not assume it matches your local debug certificate.
6. Later, register the release keystore SHA-1 with `com.musicroom.app`. If uploaded to Google Play, also register the **Play App Signing** certificate SHA-1, since Play signs the installed app with that certificate (the upload certificate can differ).

See the library's [Android setup](https://react-native-google-signin.github.io/docs/setting-up/android) and [configuration](https://react-native-google-signin.github.io/docs/original) guides.

## 2. Build and run on a real Android device

The package requires a native development client; Expo Go cannot run Google Sign-In. Rebuild any client created before the plugin was added. No iOS URL scheme is needed for this Android-only app.

From `mobile/`, choose one path:

```sh
# On a machine with Android SDK; connect your device with USB debugging enabled.
APP_VARIANT=development npx expo run:android
```

```sh
# Remote native build (development profile already sets APP_VARIANT=development).
eas build --profile development --platform android
```

Install the resulting development APK on the device, then start Metro:

```sh
npx expo start --dev-client
```

Open the development client and connect it to Metro. On the login screen, open **Google sign-in spike** (visible only with `__DEV__`). Press **Sign in with Google**, select an allowed test account, check the displayed email, and press **Copy idToken**. The preview is deliberately truncated; the clipboard contains the full token. **Sign out** clears the native Google session and the displayed result; it does not revoke an already issued token.

## 3. Verify on the backend

With backend dependencies installed and root `.env` configured with the same Web client ID, run from the repository root, replacing `<idToken>` with the full copied token:

```sh
cd backend && npx ts-node scripts/verify-google-id-token.ts '<idToken>'
```

Or, from `backend/`:

```sh
npm run google:verify -- '<idToken>'
```

Expected result: exit code 0 and a verified payload showing `aud` equal to `GOOGLE_WEB_CLIENT_ID`, `iss` equal to `accounts.google.com` or `https://accounts.google.com`, an unexpired `exp`, and `email_verified: true` with your account email. The exact output formatting is owned by the backend verifier. Invalid audience, issuer, expiry, or unverified email must fail verification. Do not paste real tokens into issues, logs, or shared screenshots.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| `DEVELOPER_ERROR` / code `10` | **SHA-1 / package name not registered in Google Cloud**: inspect the installed build's package and signing certificate, register their pair, and verify `webClientId` is the Web client from the same project. Allow configuration changes time to propagate. |
| `SIGN_IN_REQUIRED` | Sign out and sign in interactively again; confirm the account is an allowed consent-screen test user. |
| Google Play Services missing/outdated | Use a Google Play certified device, enable/update Play Services, and retry. A device without Play Services cannot use this flow. |
| Native module unavailable | Install a newly built development client containing the plugin, rather than Expo Go or an older APK. |
| Missing Web client ID / no `idToken` | Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to the Web client ID and restart Metro/rebundle. |
| Wrong audience | Make root `GOOGLE_WEB_CLIENT_ID` and mobile `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` identical Web client IDs; sign in again after rebundling. Never weaken the backend audience check. |
| Token expired (typically after 1 hour) | Obtain and copy a fresh token. The verifier must enforce the token's `exp`. |
| User cancelled / operation in progress | Retry after closing or completing the existing Google prompt. |

## Security and M1 boundary

Client IDs are public identifiers. Never commit OAuth client secrets, keystores, or real ID tokens. The spike keeps its token in screen memory and copies it only on request; clear your clipboard after verifying. It requests `offlineAccess: false` and does not request a refresh token or store an app session.

The backend always verifies Google's signature plus `aud = Web client ID`, `iss`, `exp`, and `email_verified` before trusting identity. The displayed email is diagnostic until that verification succeeds. Use Google's verified `sub` as the provider identity, not a client-supplied email. See [Google backend authentication](https://developers.google.com/identity/sign-in/android/backend-auth).

Follow **A7** in [PLAN.md](PLAN.md): if a social email matches an existing local account, refuse automatic linking and ask the user to log in to that account and explicitly link Google. **No silent account linking**, even when Google reports `email_verified: true`.
