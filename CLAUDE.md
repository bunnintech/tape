# PROJECT: TAPE

Tape is a mobile consumer financial-markets app. Its purpose is to make markets radically simple, live, and interactive.

## Product promise

A user should open Tape and understand what matters in markets in about 10 seconds. Then they can make simple
predictions about what happens next and build a permanent accuracy-based reputation.

## Tape is NOT

- a brokerage
- an advanced charting terminal
- a finance Twitter clone
- a real-money prediction market
- an AI stock-picking service

## Core MVP

1. **Home**: market scoreboard, important movers, plain-English "why", upcoming events.
2. **Company**: price/move, simple chart, why moving, next event, one prediction, live discussion entry.
3. **Live**: structured earnings/macro event pages with expected vs actual metrics and chronological updates.
4. **Picks**: five daily one-tap predictions; reveal crowd consensus only after selection.
5. **You**: overall rating, W-L, streak, category expertise, company expertise.

Navigation: bottom tabs Home / Live / Picks / You. Search is a top-level icon in every tab header.

## Design rules

- Mobile-first, extremely clean, fast, readable. Lots of whitespace, strong typography.
- **Green only** means positive / up / beat / correct. **Red only** means negative / down / miss / incorrect.
- One restrained brand accent (electric violet), used for identity, selection, focus and LIVE. Never for direction.
  "LIVE" is never red.
- No dense finance dashboards, no candlesticks, no news-card wall on Home.
- Plain English first; advanced detail behind deliberate taps.
- Minimum body text 15px. Numbers use tabular figures.
- Fun interactions, calm information surfaces.
- No placeholder feature may look active if it doesn't work. Don't render it until it works.
- All demo data is labeled with `<DemoBadge />` while `EXPO_PUBLIC_DEMO_MODE` is on.

## Prediction rules

- User picks before crowd consensus is shown. UI must read crowd numbers only via `visibleCrowd()`.
- Binary and head-to-head questions first.
- Every question has `locksAt`, `settlesAt`, a deterministic `settlementRule`, and a named `settlementSource`.
- Picks are final once made.
- Rating = recency-weighted, sample-size-shrunk **edge over the crowd** (see `src/domain/rating.ts`). The UI shows one
  number. Making more picks must never raise a rating by itself.
- Company and category expertise are computed separately on the same scale.
- No real-money wagering. Ticks/cards are out of scope until retention is proven.

## MVP out of scope

Brokerage, custody, portfolio transfer, options trading, real-money prediction markets, personalized investment advice,
complex card economies, creator subscriptions, advanced technical analysis, thousands of assets.

## Engineering

- Expo SDK 57 + React Native + TypeScript (strict) + Expo Router. **Read `AGENTS.md`**: Expo changes every SDK, so
  check versioned docs before touching Expo APIs and use `npx expo install` to add packages.
- Layout:
  - `src/app/`: routes only (thin files that render a feature screen)
  - `src/features/<screen>/`: screen components
  - `src/components/`: shared UI (`primitives.tsx`, `QuestionCard`, `LineChart`, `TopBar`)
  - `src/theme/`: design tokens + `useTheme()` / `makeStyles()`. Never hard-code colors in components.
  - `src/data/types.ts`: core data objects (blueprint §11). Field names map 1:1 to the future Postgres schema.
  - `src/data/source.ts`: `MarketDataSource` adapter interface. Screens never import fixtures directly.
  - `src/domain/`: pure logic (picks, rating, formatting). Everything here must be unit-tested.
  - `src/state/store.tsx`: client state + actions.
- Server-side only: LLM calls, market-data keys, settlement jobs. Never expose secrets via `EXPO_PUBLIC_*`.
- Tests: Jest + `@testing-library/react-native` v14 (render/fireEvent are **async**, so always `await` them).

## Workflow (every ticket)

1. Work on exactly one ticket from `docs/ROADMAP.md`. Do not add features that are not in the active ticket.
2. If the ticket conflicts with the product rules above, **stop and flag the conflict** before building.
3. Before saying a ticket is done, run `npm run check` (typecheck + lint + tests) and `npm run format`.
4. Add/adjust tests for any change to `src/domain/` or to pick/rating/settlement behavior.
5. Commit in small, reviewable increments with messages like `feat(picks): ...`, `fix(rating): ...`.
6. Log any product-affecting decision in `docs/DECISIONS.md`.
