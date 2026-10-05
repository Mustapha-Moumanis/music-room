# Music Room mobile

Expo SDK 57, TypeScript and Expo Router. Android development client required.
Routes live in `app/`; configuration, API clients, stores and shared UI live in `src/`.

From the repo root, run `make mobile`, or from this directory run `npm install`
and `npx expo start --dev-client`.

Build the dev client with `npx expo run:android` (requires an Android SDK), or
`npx eas-cli@latest build --platform android --profile development` using the included EAS profile.
Native `android/` and `ios/` directories are generated and ignored by Git.

Copy `.env.example` to `.env` if needed. `APP_VARIANT=development` selects
`com.musicroom.app.dev`; other variants use `com.musicroom.app`.

Open **Server settings** to test and save a backend URL at runtime. The Android
emulator reaches the computer at `http://10.0.2.2:3000`; a physical phone needs
the computer’s LAN IP (e.g. `http://192.168.1.10:3000`) and the same Wi-Fi network.
The backend must listen on a LAN-accessible interface. API requests append `/api`.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npx expo-doctor`.
