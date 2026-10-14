# React Native Refactor Execution Prompt

Read `docs/AGENTS.md`, `docs/REACT_NATIVE_BEST_PRACTICES.md`, and `docs/REACT_NATIVE_AUDIT.md` before changing mobile code.

Refactor feature by feature. Preserve the existing UI, routes, accessibility contracts, mock JSON, and prototype interactions. Keep routes thin, screens compositional, state in focused hooks, pure rules in model modules, and feature-independent primitives in shared UI. Do not integrate the repository backend during interface refactors.

Run the Docker verification commands documented in `docs/REACT_NATIVE_BEST_PRACTICES.md` after each coherent phase.
