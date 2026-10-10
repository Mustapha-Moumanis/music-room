# Music Room — React Native UI Coding Rules

These rules govern the React Native UI implementation after completion of the Foundations milestone.

## Design authority and foundations

1. **Figma is the visual source of truth.** Use the live Figma file for dimensions, spacing, typography, colors, radii, component variants, hierarchy, and responsive behavior. Do not invent a new visual direction while coding. If implementation and Figma disagree visually, Figma wins unless there is a genuine native-platform limitation.

2. **The existing Foundations system is frozen.** Do not casually modify `palette`, `colors`, `spacing`, `radius`, `typography`, `shadows`, `grid`, `layout`, or icon metrics while implementing screens. If something appears wrong, verify it against Figma first instead of patching the screen locally.

3. **Never hardcode design values when a token exists.** Avoid:

   ```ts
   backgroundColor: '#F04E23',
   padding: 16,
   borderRadius: 12,
   fontSize: 14,
   ```

   Prefer:

   ```ts
   backgroundColor: colors.action.primary,
   padding: spacing[16],
   borderRadius: radius.medium,
   ...typography.buttonLabel,
   ```

4. **Do not create screen-specific versions of generic UI.** Components should represent the design system, not individual screens. Use `<Button variant="primary" />`, not `<LoginButton />` or `<CreateAccountButton />`, unless a component genuinely contains feature-specific behavior or structure.

5. **Figma variants become component props.** If Figma has `Primary / Secondary / Ghost / Danger`, the React Native component should expose a controlled API matching those variants. The same applies to size, state, selected state, visibility, role, and similar properties.

6. **Build reusable components before consuming them in production screens.** The sequence is:

   ```text
   Foundation → primitive component → /dev/components preview → visual approval → production screen
   ```

   Do not build a rough Button inside Login and extract it later.

7. **Keep `/dev/foundations` and `/dev/components` isolated from application logic.** They must not use authentication state, API requests, stores, Socket.IO, profile data, or backend-dependent behavior. They exist only to validate the design system.

8. **Do not add backend architecture during the UI phase.** Existing authentication, API, TanStack Query, Zustand, storage, and related infrastructure may remain, but new mockup screens must not depend on them until the backend milestone begins. Use local static mock data where content is required.

9. **Do not remove or rewrite existing operational code just because the new UI system is cleaner.** Legacy authentication, query, storage, routing, and unrelated behavior stay untouched unless the current milestone explicitly includes migration.

## Layout and composition

10. **Use React Native layout, not Figma coordinates.** Figma Auto Layout should translate primarily to Flexbox:

    ```ts
    flexDirection
    gap
    padding
    alignItems
    justifyContent
    flex
    width: '100%'
    ```

    Do not reproduce ordinary layouts with `position: 'absolute'` and manually copied X/Y coordinates. Absolute positioning is reserved for true overlays, labels, artwork stamps, decorative paper notes, badges, and similar freeform elements.

11. **390px is the reference, not a fixed device width.** The UI must remain usable at least at `320`, `360`, `375`, `390`, and `430`. Avoid calculations based on `const width = 390`. Use available width, flex layout, padding, `maxWidth`, and responsive composition.

12. **Preserve the Figma hierarchy.** If Figma visually represents:

    ```text
    Screen
     └─ Section
         ├─ Header
         └─ Content
    ```

    the JSX should approximately reflect the same semantic structure. Do not create one giant `View` with dozens of unrelated children.

13. **Use `AppText` for application typography.** Do not scatter raw `<Text>` styles throughout new code. Typography must come from approved variants:

    ```tsx
    <AppText variant="h3" />
    <AppText variant="bodySmall" color="text.secondary" />
    ```

    Callers may control layout-related styles but must not override tokenized font family, weight, size, tracking, or line height.

14. **Use `AppIcon` and Hugeicons for approved icons.** Do not replace Hugeicons with emojis, random SVGs, Unicode symbols, Lucide, Material Icons, or another icon family. Keep glyph size separate from the minimum `44×44` interactive touch target.

15. **Native accessibility is part of the component API.** Interactive controls need meaningful accessibility roles and labels. Decorative icons should not be exposed to screen readers. Icon-only interactive controls must have an accessible label even when Figma contains no visible text.

16. **Use semantic component states, not manual colors.** Button should determine how `disabled`, `pressed`, `primary`, and other states look. Screens must not restyle those states manually.

17. **Keep styling colocated and understandable.** Use `StyleSheet.create` for stable component styles. Small components may keep styles in the same file; larger components may have a `.styles.ts` file. Do not split every component into many files merely for architectural appearance.

18. **Avoid unnecessary abstraction.** Do not create components such as `GenericContainer`, `UniversalWrapper`, `FlexibleComponent`, or `SmartCard` without a concrete design-system purpose. Reuse should emerge from repeated Figma patterns, not guesses about future requirements.

## Component APIs and data boundaries

19. **Use TypeScript strictly.** Component props should use explicit unions:

    ```ts
    type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
    ```

    Avoid `any`, unexplained type assertions, broad `string` values for known variants, and duplicated domain types.

20. **Keep component APIs small.** Prefer:

    ```tsx
    <Button variant="primary" size="default" disabled>
      Continue
    </Button>
    ```

    Do not expose internal design values such as background colors, radii, font sizes, or padding as public props.

21. **Do not export Figma UI as raster images.** Buttons, cards, text fields, icons, navigation, player controls, badges, and similar elements must be native UI. Only actual imagery such as artwork, photography, cassette/vinyl imagery, textures, and static illustrations should come from image assets.

22. **Do not use temporary Figma-hosted asset URLs in production code.** Export or add approved assets to the repository. Use `expo-image` for image rendering.

23. **Mock data must be separate from components.** Do not embed fake application content inside reusable UI. Pass content through props and keep mock content under `src/mocks/`.

24. **Components should not know about the backend yet.** A card receives data through props. It must not call APIs, Query hooks, Zustand stores, or Socket.IO directly during the UI milestone.

25. **Screens compose components; screens should not redesign them.** A production screen should primarily arrange existing primitives. If a screen requires extensive custom Button styling, the component system has probably been bypassed.

## Native behavior and styling discipline

26. **Preserve native interaction behavior.** Use `Pressable` for interactions and implement pressed and disabled states where Figma defines them. Do not imitate web hover behavior on touch devices.

27. **Minimum interactive target is `44×44`.** A 20px icon does not imply a 20px button. Keep the visual glyph small while providing a proper native touch area.

28. **Safe areas belong to screen-level infrastructure.** Do not manually add arbitrary top spacing to every screen for the status bar. `AppScreen` and the navigation shell should manage it consistently.

29. **Screen-level spacing should come from composition, not magic margins.** Avoid exceptional values such as `marginTop: 37` or `marginBottom: 19` unless Figma genuinely requires them. Prefer the established spacing scale.

30. **Use `gap` for sibling spacing where appropriate.** Do not create repeated `marginBottom` values across every child when the Figma structure clearly represents Auto Layout item spacing.

31. **Avoid deeply nested unnecessary Views.** Use enough hierarchy to match layout and semantics, but do not translate every organizational Figma frame into a React Native `View` if it has no layout purpose.

32. **Use shadows only where Figma uses elevation.** Do not add generic card shadows. Use the existing `subtle` and `floating` tokens and preserve the predominantly flat Music Room visual language.

33. **Do not introduce gradients, glassmorphism, new rounded cards, or effects absent from Figma.** Implementation is not another design phase.

34. **Keep platform-specific code exceptional.** Prefer one shared component. Branch with `Platform.select` or platform-specific files only when iOS and Android genuinely need different implementation behavior.

35. **Do not optimize prematurely.** For static UI work, clean components and correct visuals matter more than adding memoization everywhere. Introduce `memo`, callbacks, and specialized list optimization when profiling or real data makes them useful.

36. **Use the correct primitive for real lists when that milestone arrives.** Track, user, event, playlist, and notification lists should use virtualized list components instead of rendering large `.map()` collections inside a `ScrollView`.

## Milestone discipline and verification

37. **One component milestone at a time.** Finish and visually validate Buttons before moving to fields when reviewing incrementally. Do not implement the complete Components page in one uncontrolled pass and discover systemic errors afterward.

38. **Do not silently reinterpret Figma.** If an implementation decision is ambiguous, inspect the actual Figma component and its variants instead of guessing from another screen.

39. **Visual verification is required before declaring a milestone complete.** Compare the implementation with Figma at the requested widths. Check fonts, line heights, text wrapping, spacing, dimensions, radii, borders, icons, alignment, and state behavior.

40. **Fix the source, not every symptom.** If all buttons are two pixels too tall, fix the Button or token implementation. Do not patch every screen individually.

41. **New dependencies require a reason.** Do not install a library merely because it makes one static UI element easier. Prefer built-in React Native and Expo capabilities until a genuine requirement appears.

42. **No backend scope creep.** During the current UI implementation:

    ```text
    No API wiring
    No Socket.IO wiring
    No authentication redesign
    No server state architecture
    No location behavior
    No notification behavior
    No audio architecture
    ```

    unless the milestone explicitly changes.

43. **Production screens begin only after reusable primitives are approved.** The sequence remains:

    ```text
    Foundations ✅
    → Core UI primitives
    → /dev/components visual validation
    → Mobile Auth
    → Profile & Friends
    → Track Vote
    → Playlist Editor
    → Settings & System
    ```

44. **Do not modify approved earlier work without a reason.** While implementing a new milestone, do not clean up Foundations or previously approved components as a side effect. Avoid changes outside the current scope.

45. **Leave the codebase better structured, not more clever.** Someone opening `Button.tsx`, `AppText.tsx`, or an Auth screen should understand it quickly. Favor predictable React Native code over sophisticated abstractions.

## Central rule

> **Figma defines appearance. Theme tokens define values. Components define reusable behavior and variants. Screens only compose those components.**

For the current phase:

> **Do not start coding the Auth mockups until the reusable components they depend on have been implemented, compared against Figma, and approved.**
