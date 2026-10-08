# Music Room mobile

Expo SDK 57, TypeScript and Expo Router. Android development client required.
Routes live in `app/`; configuration, API clients, stores and shared UI live in `src/`.

From the repo root, `make mobile` starts the app **in the browser** (Expo web on
port 8081) so anyone can try the UI without an Android device; `make mobile-android`
starts the dev server for the Android development client (`npm run web` /
`npm start` from this directory do the same).

### Web preview for teammates

Web is a testing and preview target; the shipped app stays Android-only.

1. Run `make up` (backend) and `make mobile` on one machine.
2. Add `http://<that-machine-lan-ip>:8081` to `CORS_ORIGINS` in the root `.env`, then
   `docker compose up -d backend`.
3. Teammates on the same network open `http://<that-machine-lan-ip>:8081`. The web
   build talks to port 3000 on the same host by default, so no Server settings change
   is needed.
4. `make seed` creates two verified demo accounts (see `backend/prisma/seed.ts`).

Web differences: tokens are kept in `localStorage` instead of the secure keystore,
and Google sign-in is Android-only (`src/auth/google.web.ts`).

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
