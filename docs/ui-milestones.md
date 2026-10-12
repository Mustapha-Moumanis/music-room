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
| 12 | Mobile Auth | `31:68`, `31:97`, `31:135`, `31:170`, `31:192`, `31:211`, `31:233`, `31:258`, `31:286`, `31:313`, `49:136`, `49:183` | Complete | Added; container execution pending | Source/layout review complete; 320–430px device captures pending | Approved | **In progress** |
| 13 | Profile, Friends, and Profile Settings | `70:53`, `70:198`, `71:279`, `71:418`, `71:500`, `71:595`, `71:688`, `71:799`, `34:78`, `34:145` | Complete | Added; container execution pending | Source/layout review complete; 320–430px device captures pending | Pending | **Awaiting approval** |
| 14 | Track Vote | `55:61`, `55:168`, `55:266`, `55:300`, `55:339`, `55:379`, `56:298`, `56:413`, `56:529`, `56:577`, `57:550`, `57:583`, `57:616`, `57:649`, `57:682` | Complete | Added; container execution pending | Source/layout review complete; 320–430px device captures pending | Pending | **Awaiting approval** |
| 15 | Playlist Editor | `63:39`, `63:144`, `63:230`, `63:277`, `63:387`, `64:452`, `64:599`, `64:708`, `64:767`, `64:835` | Complete | Added; container execution pending | Source/layout review complete; 320–430px device captures pending | Pending | **Awaiting approval** |
| 16 | Remaining System screens | `34:25`, `34:195`, `34:251`, `34:298`, `34:355`, `34:400`, `34:451`, `34:492` | Complete | Added; container execution pending | Source/layout review complete; 320–430px device captures pending | Pending | **Awaiting approval** |

## Current approval gate

Mobile Auth received visual approval. Profile and Settings implements ten current frames, Track Vote implements fifteen, Playlist Editor implements ten, and the remaining System milestone implements eight screens as production Expo Router screens with local prototype interactions.

Review the final System milestone from `/home`, then `/system/mini-player`, `/player`, `/notifications`, `/system/empty`, `/system/loading`, `/system/error`, and `/system/offline` at widths `320`, `360`, `375`, `390`, and `430`. Verify player controls, notification read state, retry feedback, offline actions, scrolling on short screens, pressed feedback, every bottom-navigation destination, and readable wrapping. Milestones 13–16 are implemented and remain at **Awaiting approval** until visual review is complete.

The latest review pass also refined Milestones 14–16: playlist actions now use the standard `/player`, editors expose working reorder/remove controls and row-level presence, read-only playlists imply permissions through available actions, Add Track distinguishes available/added/existing states, event rooms show ranked vote totals with compact voting, owner event termination requires confirmation, and mini-player track presses open Now Playing. These refinements still require visual approval at the widths above.
