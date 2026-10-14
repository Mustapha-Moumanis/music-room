# React Native Structural Audit

## Outcome

The mobile application now follows feature-first boundaries without changing route paths, JSON fixtures, test IDs, accessibility labels, or prototype success messages. Existing aggregate modules remain as compatibility barrels, while routes import focused screen modules directly.

## Completed improvements

- Profile editor state and visibility calculations moved into a typed hook and pure model. Photo, field-group, preview, visibility-control, and style responsibilities are separated from the screen orchestrator.
- Profile, friend discovery, viewer profiles, settings, subscription, and linked-account screens are separated into focused modules.
- Shared navigation/player, cards/rows, overlays, identity components, and system states are split by public component. Existing `components/ui` exports remain compatible.
- Web Escape-key listeners are isolated behind native/web platform modules.
- Authentication layout, feedback, onboarding UI, and route flows are separated without adding session or backend behavior.
- Event scheduling date/search calculations are pure and tested; the smart selector is separate from schedule orchestration.
- Event discovery, creation, rooms, people, and restriction flows are separated.
- Playlist library, details, editors, and membership flows are separated. Reorder/removal state is owned by a playlist-editor hook.
- System screens are separated into layout, home, player, and feedback/state modules. Development catalogs no longer live in Expo Router files.

## Preserved contracts

- Expo Router paths and redirects.
- Shared UI barrel exports and public prop types.
- Content under `mobile/src/content` and mocks under `mobile/src/mocks`.
- Local prototype interactions including save, photo-ready, invitation, voting, playlist, and setup feedback.
- Existing backend/API/session code was not integrated into the refactored UI.

## Focused coverage added

- Profile preview visibility rules for public, friends-only, and private fields.
- Event scheduling search normalization and date/time transformations.

## Verification status

`git diff --check` passes. Docker, Node.js, and npm are not installed in the current execution environment, so lint, TypeScript, Jest, Expo Doctor, Android export, container health, and visual browser checks must be run on a Docker-enabled host with the commands in `REACT_NATIVE_BEST_PRACTICES.md`.

## Remaining judgment calls

- `header-overflow-menu.tsx`, `form-fields.tsx`, and picker controls remain cohesive component families and were intentionally not split further.
- Development catalogs and shared style modules remain comparatively large because each is a single declarative catalog/style responsibility; splitting them further would add navigation overhead without isolating behavior.
