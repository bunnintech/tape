# Tape build roadmap: Claude Code tickets

Paste **one ticket at a time** into Claude Code from the repo root. `CLAUDE.md` loads automatically and carries the
product guardrails. Each ticket ends with `npm run check` green and a commit.

Prompt template:

```
Ticket T-XX from docs/ROADMAP.md. Read CLAUDE.md, AGENTS.md and the files listed in the ticket first.
Plan before coding. Stay inside the ticket's scope. Finish with `npm run check` passing and one commit.
```

---

## ✅ Sprint 0 + 1: static prototype (DONE)

Blueprint tickets 1–10 are implemented: Expo/TS repo, tokens, tabs + search, fixtures (NVDA, TSLA, PLTR, AAPL, MSFT,
SPY, Nasdaq, S&P 500, BTC, AMD), Home, Company, Live + NVIDIA earnings event, Picks flow, You, demo mode, 27 tests.

### Prototype acceptance criteria (blueprint §20)

| Criterion                             | Status                                          |
| ------------------------------------- | ----------------------------------------------- |
| Home scannable in ~10s, no news wall  | ✅ one-line headline, 3 tiles, 4 movers, events |
| Every tappable element does something | ✅ (verified by click-through)                  |
| 5 picks in < 30s                      | ✅ ~7.5s in automated run (auto-advance 1.3s)   |
| Crowd hidden until pick               | ✅ enforced in `visibleCrowd()` + UI test       |
| Readable on small phone, no tiny text | ✅ min 13px captions, 15–16px body              |
| No brokerage-like order entry         | ✅                                              |
| No inactive placeholder features      | ✅ (no "More", no notifications promised)       |
| Mock data clearly labeled             | ✅ `DEMO DATA` badge on every screen            |
| Small reviewable commits              | ✅ see `git log`                                |
| First-time user explains Tape in 30s  | ⏳ **needs real users**: see T-10.5             |

---

## T-10.5 · Prototype test with 5–8 students (NOT a Claude Code ticket)

Before any backend, the blueprint says the prototype must be visually approved. Run it on phones via Expo Go
(`npx expo start`, scan the QR code) and watch 5–8 target users (market-curious 18–30). Give no coaching.

Record per person: (1) can they say what Tape is after 30s? (2) time to finish five picks, (3) did they tap into a
company or event unprompted? (4) did they look at You after picking? (5) what confused them?

Turn findings into fix tickets **before** Sprint 2. Cheap now, expensive after the schema exists.

---

## Sprint 2: accounts + database (Supabase)

### T-11 · Supabase project + client wiring

- Add `@supabase/supabase-js` (+ `expo-secure-store` for session storage via `npx expo install`).
- `src/lib/supabase.ts` client from `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (anon key is public by
  design. Security comes from RLS).
- `supabase/` folder with CLI config and migrations; `npm run db:reset` script for local dev.
- **Done when:** app boots with and without env vars (without → stays in demo mode).

### T-12 · Schema v1 + RLS

Migrations for the blueprint's core objects, mirroring `src/data/types.ts`:
`profiles, assets, market_snapshots, events, event_updates, prediction_questions, prediction_choices,
user_predictions, settlements, rating_snapshots, expertise_scores, comments, reactions, follows`.

- `user_predictions`: unique `(user_id, question_id)`; insert allowed only when `now() < locks_at` (enforce in a
  Postgres function or trigger, **not** only in the client); no updates/deletes. Store `crowd_share_at_pick`.
- Crowd split: a SQL function `crowd_split(question_id)` that returns data **only** if the caller has a pick or the
  question is locked. Clients must not be able to select raw counts on open questions.
- RLS: users read/write only their own predictions/follows; comments readable by all, writable by owner.
- **Done when:** SQL tests (pgTAP or a script) prove: no pick after lock, no second pick, no crowd split before picking.

### T-13 · Auth + onboarding

- Email magic link or Sign in with Apple (required on iOS if any other social login is offered).
- Onboarding = pick ≥3 assets to follow (this _is_ the activation metric) → straight into Picks.
- Handle + display name; profile visibility toggle (blueprint §16: private by default is fine).

### T-14 · Swap store persistence to Supabase

- Keep `useStore()` actions identical; implement them against Supabase with optimistic updates.
- `MarketDataSource` gains a `SupabaseSource` for questions/events/comments; the mock source stays as fallback.
- **Done when:** picks/follows/comments survive app restart and reinstall; existing tests still pass.

---

## Sprint 3: real market data

### T-15 · Market-data adapter (server-side)

- Choose a **licensed** provider whose terms allow display in a consumer app. Confirm redistribution/display rights in
  writing before beta (blueprint §16). Delayed (15-min) data is usually much cheaper than real-time and fine for MVP.
- Supabase Edge Function `ingest-prices` (cron every 1–5 min in market hours) writes `market_snapshots`. Provider key lives
  only in function secrets.
- Client reads snapshots from Postgres, **never** from the provider directly.
- **Done when:** 25–50 assets update; stale data (> 20 min) shows an "as of" time instead of pretending to be live.

### T-16 · Charts from stored history

- `price_points` table (or provider aggregates) for 1D/1W/1M/1Y; `LineChart` unchanged.

### T-17 · Event calendar ingestion

- Earnings dates + consensus estimates for covered assets; macro calendar (CPI, FOMC).
- Each event auto-generates its pre-event question(s) with settlement rule + source.

### T-18 · "Why it's moving" service

- Edge Function: inputs = price move + headlines/press releases from a licensed news source → LLM writes ONE plain
  sentence, must cite which inputs it used, returns `confidence`. If no input explains the move, return
  "No clear news. Moving with [sector/market]" rather than inventing a cause (blueprint §16).
- Human review queue for the first weeks (simple admin table flag).

---

## Sprint 4: prediction engine

### T-19 · Daily question generator

- Cron at ~6 PM ET builds tomorrow's five from templates (direction, relative, head-to-head, threshold, macro) over
  followed/high-interest assets. Variety rules: max 2 per category, at least 1 head-to-head.

### T-20 · Settlement job

- Runs after official close data lands; writes `settlements` from the named source only. Idempotent (re-running changes
  nothing). Handles trading halts / missing data by voiding (no rating impact) instead of guessing.
- **Tests first:** void path, idempotency, tie handling for head-to-head.

### T-21 · Ratings + expertise

- Port `src/domain/rating.ts` to a SQL function or Edge Function; snapshot nightly into `rating_snapshots`.
- Replace normal-curve percentiles with empirical percentiles per scope (overall / category / company) (see DECISIONS D-004).
- Add the anti-gaming check: picks on questions with < N crowd picks don't count until N is reached.

### T-22 · Leaderboards

- Overall + per-category + per-company, min-picks threshold, weekly + all-time. Campus leaderboard if user sets a school.

---

## Sprint 5: live events + social

### T-23 · Realtime event timelines (Supabase Realtime on `event_updates`)

### T-24 · Reactions + comments persisted, rate-limited (e.g. 1 comment / 10s). Includes sticker comments (`sticker_id`, see D-005)

### T-25 · Moderation: report button, auto-hide at N reports, banned-terms list, admin queue. Rules cover spam,

impersonation, pump-and-dump, abuse (blueprint §16)

### T-26 · Push notifications (Expo Notifications): event starts for followed assets, picks settled, picks lock in 1h

---

## Sprint 6: closed beta hardening

### T-27 · PostHog: activation, pick completion, D1/D7/D30, event opens, rating views (blueprint §15 metrics)

### T-28 · Sentry (or equivalent) crash/error logging

### T-29 · Privacy policy, terms, "not investment advice" copy, data-source attribution screen

### T-30 · Invite codes + EAS build → TestFlight / internal Android track for 50–100 students

### T-31 · Trademark/App Store/domain/handle clearance for "Tape" (blueprint §17) before any public branding
