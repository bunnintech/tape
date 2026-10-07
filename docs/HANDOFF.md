# Handoff: where things stand

Read this first in a new session, after `CLAUDE.md`.

## Status (Oct 7, 2026)

- Sprint 0 + 1 complete: blueprint tickets 1–10. Every screen works on demo data. `npm run check` is green (27 tests).
- Repo: `github.com/bunnintech/tape`, branch `main`.
- Next step per the blueprint: **T-10.5**, test the prototype with 5–8 students, then a **design dial-in** pass.
  Backend work (Sprint 2, T-11+) waits until the prototype is visually approved.

## Current focus: design dial-in

Run the app live while editing:

```bash
npx expo start        # scan QR with Expo Go; changes hot-reload on the phone
```

Rules for this phase:

- Visual/feel changes only. No new features, no backend.
- Change global look through `src/theme/tokens.ts` first, components second, individual screens last.
- Keep the semantic color rules (green/red = direction only; LIVE = accent).
- Commit each accepted round of tweaks: `style(home): ...`, `style(picks): ...`.

## Decisions already made (see docs/DECISIONS.md)

- Rating = bounded "edge over the crowd" (not running Elo): volume can't inflate it.
- Demo scenario is ~4:40 PM ET: NVIDIA earnings live after hours; daily picks are for tomorrow, lock at 9:30 AM open.
- LIVE uses the brand accent, never red.
- Crowd split is read only through `visibleCrowd()`.

## Known gaps / things to watch

- Demo profile pick history is generated (`src/data/fixtures/profile.ts`). Overall vs category percentiles use a
  placeholder normal curve, so they can look inconsistent until Sprint 4 uses real distributions.
- State is in-memory: reloading the app resets picks/follows/comments (expected until Sprint 2).
- Icons: import per-family (`@expo/vector-icons/Feather`), not the barrel export, to keep the bundle small.

## Web preview

A single-file web build is published as a private Claude artifact ("Tape Prototype"). To rebuild it:
`npm run build:web`, then inline `dist/` (JS + asset data URIs) into one HTML file and rewrite the path to `/` before
boot so Expo Router starts at Home. Ask Claude to "rebuild and republish the Tape web preview."
