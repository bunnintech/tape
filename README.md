# tape-mobile

**Tape: markets, live.** Open Tape and understand what matters in markets in 10 seconds, then make a call on what
happens next and build a track record that follows you.

This is the Sprint 0 + 1 prototype: every screen works end-to-end on **demo data**. No backend yet.

## Run it

```bash
npm install
npx expo start          # scan the QR code with Expo Go on your phone
npm run web             # or run in a browser
```

## Scripts

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run check`     | typecheck + lint + tests (run before every commit) |
| `npm test`          | Jest unit + UI tests                               |
| `npm run format`    | Prettier                                           |
| `npm run build:web` | static web export to `dist/`                       |

## Configuration

Copy `.env.example` to `.env`. Only `EXPO_PUBLIC_*` vars reach the app; never put secret keys there.

| Var                       | Default | Meaning                                                                |
| ------------------------- | ------- | ---------------------------------------------------------------------- |
| `EXPO_PUBLIC_DEMO_MODE`   | `true`  | Shows DEMO DATA badges and demo controls (Simulate settlement / Reset) |
| `EXPO_PUBLIC_DATA_SOURCE` | `mock`  | Market-data adapter (only `mock` exists in Sprint 1)                   |

## Walk the core loop (Appendix B)

1. **Home**: read the one-line summary, scoreboard, movers. Tap **NVDA**.
2. **Company**: price, chart (1D/1W/1M/1Y), why, next event (live earnings), community pick.
3. **Live → NVIDIA earnings**: actual vs expected, timeline with reactions, a live pick with a countdown, discussion.
4. **Picks**: five one-tap picks; the crowd split appears only after you choose.
5. **Simulate settlement** (demo) → **You**: rating, record, streak and expertise update.

## Where things live

See `CLAUDE.md` (product + engineering rules), `docs/ROADMAP.md` (next tickets), `docs/DECISIONS.md` (why things are
the way they are).
