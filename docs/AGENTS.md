# Codex Rules — Music Room Mobile (React Native / Expo / TypeScript)

These instructions apply to **all work in the mobile application**, including refactoring and future features. Read and follow them before editing files. Project-specific requirements, the actual repository, and supported backend contracts take precedence over examples in this file.

## Mission
Build a maintainable, native-feeling app. **Do not pile entire screens, state management, API calls, dropdown mechanics, form validation and unrelated components into one file.** Prefer clear responsibilities and simple composition. Do not optimize only for the fewest files, nor split code into dozens of unnecessary files.

## 1. Inspect before editing
- Identify the real Expo SDK, React Native, TypeScript versions, route layout, package manager, design system, API client, auth/session flow, tests and existing conventions.
- Reuse existing dependencies and patterns when sound; do not invent backend endpoints, models, or screens.
- For an existing feature, inspect its dependent components and tests before reorganizing it.
- Preserve product requirements, UX, design tokens, navigation contracts and working behavior. Correct broken or fake behavior transparently rather than simulating success.

## 2. Separation of concerns — required
- **Expo Router route files:** route exports, route params, and minimal route setup. Keep business logic out of route files.
- **Screen:** compose sections; connect hooks/data to presentational components; handle navigation. Do not implement every form field or modal inside the screen.
- **Feature components:** render a cohesive UI section, accept typed props, emit callbacks. Avoid directly importing the network layer in reusable UI.
- **Custom hooks:** extract cohesive reusable/stateful feature behavior or complex lifecycle logic; don't make a hook just to move three lines.
- **API/data layer:** HTTP/Socket integration, request/response adaptation and errors go in existing services/adapters/hooks, not inline in JSX.
- **Model / utilities:** domain types, validation and pure transformations separated from rendering when substantial or used elsewhere.
- **Theme/shared UI:** use existing tokens and primitives; share components across features only when genuinely shared.

## 3. Feature-first placement
Follow the *existing* source root and naming style. Prefer this shape where appropriate; do not rebuild the repository to match it literally:

```text
mobile/src/
  app/                         # Expo Router route entry points, layouts
  features/
    profile-friends/
      screens/                 # Screens compose the feature
      components/              # Profile-specific UI
      hooks/                   # Complex feature state or lifecycle
      api/ or services/        # Only if not already centralized
      model/                   # Domain types / validation, when needed
      __tests__/
  components/ui/               # Truly shared primitives
  lib/                         # Shared integration and helpers
  theme/                       # Shared design tokens
```

- Prefer one substantial component or hook per file. Tiny, private, tightly coupled helpers can remain near their owner.
- Keep feature-private code inside its feature; avoid broad `utils` and global abstractions.
- Use consistent file naming already adopted by the repository.
- No circular imports; avoid deep relative imports if an established alias exists.

## 4. Component size and splitting
Split when a file has **multiple responsibilities**, repeated blocks, independent UI sections, complex stateful behavior, or is hard to test. File length alone is a signal to inspect, not a hard threshold.

For example, a profile editor screen should normally compose items like `ProfilePhotoSection`, `ProfileInformationFields`, `MusicPreferencesSection`, `VisibilityPicker` and `ProfilePreview` **if they are real cohesive sections**. Keep privacy rules and draft form updates in cohesive logic, not in the preview JSX. Do not build a universal form-builder abstraction solely because several fields look alike.

## 5. State, forms and data
- Keep ephemeral UI state local. Derive values rather than duplicating state; do not store calculations that can be computed cheaply.
- Use the project's existing form/validation approach, or plain controlled inputs for simple forms. Introduce form libraries only when complexity warrants it and the repo does not already have an approach.
- Model validation, dirty/submitting/success/failure states clearly. A save action must perform a real defined operation before reporting success.
- No fake uploads, backend tests, auth, subscriptions, or social actions. If unavailable, give honest accessible feedback and document the missing contract.
- Backend/API contract is authoritative for privacy and permissions. If editor fields disagree with the backend contract, flag the product decision; do not invent mappings or silently change the product.
- Never trust TypeScript casts as runtime validation of network responses.
- Avoid duplicating server state across multiple local state stores; reuse the repository's existing API/session/cache strategy.

## 6. React and TypeScript
- Strong, explicit types for public props, domain concepts and API boundaries. Avoid `any`, broad casts, non-null assertions and unsafe dynamic keys without justification.
- Prefer small functions and early returns; eliminate redundant state, duplication, stale closures and unnecessary effects.
- `useEffect` is for synchronizing with external systems, not for ordinary derived computations.
- Use `useMemo`/`useCallback` when they solve a real identity/performance issue; don't wrap everything automatically.
- Provide stable keys for mapped lists. Do not perform side effects during render.
- Do not add Context, global state or generic frameworks without a concrete cross-component need.

## 7. Native UX and platform correctness
- Use React Native/Expo APIs and platform conventions. Guard web-only APIs behind `.web.ts(x)` platform modules when required; do not scatter `document`/`window` inside native components.
- Account for safe areas, keyboard behavior, small devices, Android back behavior, touch targets, screen readers and focus/accessible names.
- Avoid manual screen-coordinate popovers if an existing native-appropriate picker/menu can fulfill the UX correctly.
- Prefer `StyleSheet` and established theme tokens; avoid arbitrary magic numbers where design tokens exist. Do not change the approved visual design without a requirement.
- Use `FlatList`/`SectionList` for lengthy scrolling collections instead of mapping a large list in a `ScrollView`.

## 8. Async and API reliability
- Separate API requests from view code; use existing client/auth/session adapters.
- Handle loading, empty, errors, retry and cancellation/stale updates where relevant.
- Never swallow errors or show success without confirmed success.
- Keep secrets out of source files, logs and client-visible configuration.
- Clean up event listeners, Socket.IO subscriptions and timers on unmount; avoid duplicated subscriptions.

## 9. Refactoring behavior
- Refactor **existing code**, not only audit it. Move responsibilities to appropriate feature files, update imports, tests and types, and remove dead code.
- Work feature by feature with small coherent commits/changes; preserve UI/UX and user-facing behavior unless it is incorrect.
- Do not introduce new dependencies unless justified in the summary and approved by the user when significant.
- Do not rename/move every file merely for aesthetics. Keep diffs focused.
- When blocking contracts or external services are unavailable, refactor everything safely possible and list the exact blocked behavior separately.
- Leave unrelated user changes untouched; never wipe untracked work.

## 10. Tests and completion
- For affected features, update/create focused tests for user behavior and business rules, including failures—not only snapshot tests.
- Run available lint, TypeScript checks, tests and Expo checks using **the repository's package manager and documented commands**. Do not claim tests passed if not run; report environment blockers.
- Review diffs for unused imports, duplication, misleading messages, platform incompatibilities and accessibility regressions.
- At the end of each task report: (1) files changed and architectural improvements, (2) behavior preserved/fixed, (3) verification performed/results, (4) remaining blockers or tradeoffs.

## Definition of done for every new screen/feature
- [ ] Route is thin; screen is composed of coherent pieces.
- [ ] View, stateful logic and data I/O have clear boundaries.
- [ ] Existing UI primitives/theme tokens are reused.
- [ ] Data comes from the intended source; no pretend success states.
- [ ] Types, validation and error handling match the real contract.
- [ ] Native platform behavior, accessibility and layouts are considered.
- [ ] Focused tests are added/updated, checks run when available.
- [ ] No avoidable duplicate code, dead code or unexplained dependencies.

**Priority:** correctness and maintainability > consistency and clarity > minimal abstraction > premature optimization. Follow the project's actual documented subject and scope: do not add features beyond requirements to justify a refactor.
