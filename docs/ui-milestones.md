# Music Room UI Milestones

This file is the permanent progress tracker for the React Native UI. Figma defines appearance, theme tokens define values, reusable components define behavior, and screens compose approved components.
Design source: [Music Room](https://www.figma.com/design/okfUEw3iulsfAzenNA2ZtO/Music-Room)

## Status definitions

- **Complete** — implementation, tests, responsive checks, and visual approval are finished.
- **In progress** — implementation or verification is actively underway.
- **Awaiting approval** — implementation and automated checks are ready; visual approval is still required.
- **Planned** — work has not started.
- **Blocked** — progress cannot continue until a named dependency or decision is resolved.

No milestone becomes **Complete** before visual approval.

## Tracker

| # | Milestone | Figma node(s) | Implementation | Tests | Responsive verification | Visual approval | Overall status |
|---:|---|---|---|---|---|---|---|
| 1 | Foundations | `21:40` | Complete | Complete | Complete | Approved | **Complete** |
| 2 | Button | `23:73` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 3 | Form fields — Text Field, Password Field, Search Field | `23:94`, `23:120`, `23:136` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 4 | Selectors and pickers — Select, Date/Time Picker, Location Picker | `23:157`, `23:170`, `23:183` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 5 | Identity and status — Avatar, Visibility Badge, License Badge, Music Preference Chip | `23:190`, `23:197`, `23:206`, `23:213` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 6 | Voting — Vote Button | `23:222` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 7 | Cards and rows — User Card, Event Card, Playlist Card, Track Row, Friend Request Row | `27:129`, `27:154`, `27:167`, `27:194`, `27:214` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 8 | Navigation and playback — Mini Player, Bottom Navigation, Web Sidebar, Top Bar, Web Player | `27:231`, `27:312`, `27:428`, `304:1075`, `27:442`, `27:429`, `312:5110`, `117:838` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 9 | Overlays and feedback — Modal, Bottom Sheet, Toast | `28:277`, `28:305`, `28:318` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 10 | System states — Empty State, Error State, Skeleton Loader | `28:333`, `28:341`, `28:351` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 11 | Components-page final approval | Components page `22:1075`, core frame `23:223` | Complete | Added; container execution pending | Source/layout review complete; device captures pending | Approved | **In progress** |
| 12 | Mobile Auth | `31:68`, `31:97`, `31:135`, `31:170`, `31:192`, `31:211`, `31:233`, `31:258`, `31:286`, `31:313`, `49:136`, `49:183` | Complete | Added; container execution pending | Source/layout review complete; 320–430px device captures pending | Pending | **Awaiting approval** |
| 13 | Profile and Friends | Inspect target screen nodes at milestone start | Not started | Not started | Not started | Not started | **Planned** |
| 14 | Track Vote | Inspect target screen nodes at milestone start | Not started | Not started | Not started | Not started | **Planned** |
| 15 | Playlist Editor | Inspect target screen nodes at milestone start | Not started | Not started | Not started | Not started | **Planned** |
| 16 | Settings and System | Inspect target screen nodes at milestone start | Not started | Not started | Not started | Not started | **Planned** |

## Current approval gate

The Components page received final visual approval. Mobile Auth now implements all twelve Figma frames as production Expo Router screens with local-only navigation and interaction state.

Start at `/welcome`, then review `/register`, `/login`, `/check-mail`, `/verification-result`, `/forgot-password`, `/reset-password`, `/google-sign-in`, `/backend-url`, `/backend-result`, `/music-preferences`, and `/profile-setup` at widths `320`, `360`, `375`, `390`, and `430`. Verify artwork crop, vertical scrolling on short screens, keyboard-safe field access, pressed feedback, focus borders, chip selection, and readable wrapping. Do not begin Profile and Friends until Mobile Auth receives visual approval.
