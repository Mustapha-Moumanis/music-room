# React Native Structure and Refactoring Rules

`docs/AGENTS.md` is the authoritative rule set for mobile work. This document is the short implementation checklist for contributors.

## Module responsibilities

- `mobile/app`: Expo Router entry points only. A route should export a screen or perform a small redirect/layout decision.
- `mobile/src/features/<feature>/screens`: route-level composition and navigation.
- `mobile/src/features/<feature>/components`: cohesive, feature-private visual sections.
- `mobile/src/features/<feature>/hooks`: stateful behavior with a clear feature responsibility.
- `mobile/src/features/<feature>/model`: pure types, validation, calculations, and data transformations.
- `mobile/src/components/ui`: feature-independent primitives. Keep compatibility barrels stable when splitting an established component family.
- `mobile/src/content` and `mobile/src/mocks`: prototype data. UI modules must not silently replace these with invented API contracts.

## When to split a file

Split when a module mixes route composition, reusable UI, state transitions, platform APIs, or pure domain calculations. Do not split a small private helper merely to reduce line count. A large style module or development catalog can remain together when it has one clear responsibility.

## Screen checklist

1. Keep the route thin and put the screen in its owning feature.
2. Compose named sections instead of embedding every field, modal, and row in the screen.
3. Keep transient interaction state local; move multi-step state transitions into a focused hook.
4. Put calculations and validation in pure model modules with focused tests.
5. Put web-only globals behind `.web.ts` or `.web.tsx` modules.
6. Preserve test IDs, accessibility labels, routes, design tokens, and JSON fixture contracts during refactors.
7. Do not add a dependency or global state abstraction for ordinary component composition.

## Verification

The mobile container is the authoritative automated environment:

```sh
docker compose build mobile
docker compose run --rm --no-deps mobile npm run lint
docker compose run --rm --no-deps mobile npm run typecheck
docker compose run --rm --no-deps mobile npm test
docker compose run --rm --no-deps mobile npx expo export --platform android --output-dir /tmp/music-room-android-export
```

Use `docker compose up -d --build mobile` for the web preview. Verify the principal flows at 320, 360, 375, 390, and 430 pixel widths. Do not start backend or PostgreSQL for interface-only work.
