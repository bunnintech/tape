# Decision log

Product-affecting implementation decisions. Newest first. Each one says what was decided, why, and what would reverse it.

## D-004 · Rating is "edge over the crowd", not a running Elo

**Decided:** `rating = 1500 + 1000 × shrunk, recency-weighted mean of (outcome − crowdShareAtPick)`.

**Why:** The first implementation ran Elo against the crowd. Because the crowd never updates like a real opponent, any
user even slightly better than the crowd climbed without bound just by making more picks. Overall rating ran ahead of
every category rating (Top 4% overall vs Top 16% best category). That contradicts blueprint principle "reputation over
popularity / volume". The mean-based model is bounded, keeps overall / category / company on one comparable scale, and
still rewards contrarian correct calls more than consensus ones.

**Open:** `POPULATION_SD` and the normal-curve percentile are placeholders. In Sprint 4, replace them with the empirical
distribution from `rating_snapshots`, computed separately for categories and companies (their spread differs).

## D-003 · Demo scenario is "after the close"

**Decided:** The prototype is set at ~4:40 PM ET: NVIDIA earnings are live after hours and daily picks are for
**tomorrow's** session, locking at the 9:30 AM open.

**Why:** Earnings land after the close, so a "live earnings" demo can't coexist with "will X finish green today?". Picks
locking at the open (made the evening/morning before) is also a good product default. It gives a clean lock time and an
evening habit slot.

## D-002 · LIVE uses the brand accent, never red

**Why:** Red is reserved for down/miss/incorrect (blueprint §4). A red live dot on an up-move event page reads as bad news.

## D-001 · Crowd numbers only through `visibleCrowd()`

**Why:** "Prediction before consensus" is the core signal-quality rule. Centralizing access makes it testable
(`picks.test.ts`, `screens.test.tsx`) and keeps a future screen from leaking the split by accident.
