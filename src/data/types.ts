/**
 * Core data objects (blueprint §11). Field names are chosen to map 1:1 onto the
 * Supabase/Postgres schema in Sprint 2 — keep them stable.
 */

export type AssetKind = 'stock' | 'etf' | 'index' | 'crypto';

export type Category =
  'semiconductors' | 'big-tech' | 'ev-auto' | 'software' | 'crypto' | 'macro' | 'earnings' | 'index';

export type Asset = {
  id: string; // ticker-like symbol, e.g. "NVDA"
  symbol: string; // display symbol
  name: string;
  shortName: string;
  kind: AssetKind;
  categories: Category[];
};

/** Market Snapshot — latest price state for an asset. */
export type MarketSnapshot = {
  assetId: string;
  price: number;
  previousClose: number;
  change: number; // absolute
  changePct: number; // percent, e.g. 1.24 = +1.24%
  asOf: string; // ISO timestamp
};

export type ChartRange = '1D' | '1W' | '1M' | '1Y';

export type PricePoint = { t: number; v: number };

/** Plain-English "why it is moving", always grounded in named sources. */
export type MoveExplanation = {
  assetId: string;
  text: string; // one sentence, plain English
  sources: string[]; // identifiable inputs (blueprint §16)
  confidence: 'high' | 'medium' | 'low';
};

export type EventKind = 'earnings' | 'macro' | 'fed' | 'company';
export type EventStatus = 'upcoming' | 'live' | 'settled';

export type ExpectedVsActual = {
  id: string;
  label: string; // "Revenue"
  plain: string; // plain-English description shown under the label
  expected: string; // formatted display, e.g. "$54.9B"
  actual?: string; // undefined until released
  result?: 'beat' | 'miss' | 'inline';
};

export type EventUpdateKind = 'release' | 'metric' | 'price' | 'remark' | 'status';

/** Event Update — one moment on an event timeline. */
export type EventUpdate = {
  id: string;
  eventId: string;
  at: string; // ISO
  kind: EventUpdateKind;
  title: string;
  body?: string;
  direction?: 'up' | 'down';
  reactions: Record<ReactionKey, number>;
};

export type ReactionKey = 'fire' | 'eyes' | 'up' | 'down';

export type MarketEvent = {
  id: string;
  kind: EventKind;
  status: EventStatus;
  title: string; // "NVIDIA Q3 earnings"
  subtitle: string; // "Fiscal Q3 2027 · after close"
  assetIds: string[];
  category: Category;
  startsAt: string; // ISO
  watchers: number;
  discussionCount: number;
  metrics: ExpectedVsActual[];
  updates: EventUpdate[];
  /** Question ids attached to this event (pre-event + live picks). */
  questionIds: string[];
};

export type QuestionType =
  'direction' | 'relative' | 'threshold' | 'earnings' | 'company-metric' | 'macro' | 'head-to-head' | 'live-event';

/** Prediction Choice */
export type PredictionChoice = {
  id: string;
  label: string; // "Green", "Red", "AMD", "Yes"
  /** Optional semantic hint so "Green/Up" buttons can use market colors. */
  tone?: 'up' | 'down' | 'neutral';
};

/** Prediction Question */
export type PredictionQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  context?: string; // one short line of context
  assetIds: string[];
  category: Category;
  choices: PredictionChoice[];
  locksAt: string; // ISO — no picks accepted after this
  settlesAt: string; // ISO
  /** Deterministic settlement rule, shown to users (blueprint §16). */
  settlementRule: string;
  settlementSource: string;
  /** Crowd split by choice id, as fractions summing to 1. Hidden until the user picks. */
  crowd: Record<string, number>;
  crowdCount: number;
  daily?: boolean;
  eventId?: string;
};

/** User Prediction */
export type UserPrediction = {
  questionId: string;
  choiceId: string;
  pickedAt: string; // ISO
  /** Crowd share of the chosen side at pick time — feeds difficulty scoring. */
  crowdShareAtPick: number;
};

/** Settlement */
export type Settlement = {
  questionId: string;
  winningChoiceId: string;
  settledAt: string;
};

export type SettledPick = {
  questionId: string;
  prompt: string;
  category: Category;
  assetIds: string[];
  correct: boolean;
  crowdShareAtPick: number;
  settledAt: string;
};

/** Expertise Score — per category or per company. */
export type ExpertiseScore = {
  key: string; // category id or asset id
  label: string;
  rating: number;
  percentile: number; // 0–100, higher is better ("Top 3%" = 97)
  picks: number;
};

/** Rating Snapshot */
export type RatingSnapshot = {
  rating: number;
  percentile: number;
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
};

export type UserProfile = {
  id: string;
  displayName: string;
  handle: string;
  joinedAt: string;
};

/** Comment / Reaction */
export type Comment = {
  id: string;
  eventId: string;
  author: string;
  authorBadge?: string; // e.g. "NVDA Top 3%"
  body: string; // empty when the comment is a sticker
  stickerId?: StickerId;
  at: string;
};

/** Original Tape sticker art (see src/components/Sticker.tsx). No real people, logos or third-party memes. */
export type StickerId =
  | 'bull-lets-go'
  | 'bear-pain'
  | 'to-the-moon'
  | 'diamond-hands'
  | 'called-it'
  | 'priced-in'
  | 'popcorn'
  | 'not-like-this';
