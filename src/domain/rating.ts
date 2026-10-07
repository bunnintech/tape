/**
 * Tape Market Rating.
 *
 * Blueprint §7: show ONE simple number; the backend weighs accuracy, difficulty,
 * sample size and recency. Correct contrarian calls earn more than obvious
 * consensus calls. Ratings are segmented by company and category.
 *
 * Model — "edge over the crowd", bounded so volume alone can't inflate it:
 *
 *   per pick:  edge_i = outcome_i − crowdShareAtPick_i      (outcome ∈ {0,1})
 *     - Correct with 80% of the crowd → +0.20   (easy call, small credit)
 *     - Correct with 25% of the crowd → +0.75   (contrarian & right, big credit)
 *     - Wrong   with 80% of the crowd → −0.80   (missed an easy one)
 *     - Wrong   with 25% of the crowd → −0.25   (bold miss, small penalty)
 *
 *   Accuracy   → outcome term
 *   Difficulty → crowd-share term
 *   Recency    → exponentially weighted mean (half-life RECENCY_HALF_LIFE picks)
 *   Sample size→ mean is shrunk toward 0 by n / (n + PRIOR_PICKS)
 *
 *   rating = 1500 + RATING_SCALE × shrunkEdge
 *
 * Because it's an average (not a running sum), making more picks never raises
 * your rating by itself — only being right more often than the crowd does.
 * Overall, category and company ratings share one scale, so they're comparable.
 */

import type { Category, ExpertiseScore, RatingSnapshot, SettledPick } from '@/data/types';

export const BASE_RATING = 1500;
export const RATING_SCALE = 1000;
export const RECENCY_HALF_LIFE = 40;
export const PRIOR_PICKS = 12;
/** Spread of ratings across the population; tune from real data in Sprint 4. */
export const POPULATION_SD = 60;
export const PROVISIONAL_PICKS = 10;

export function clampShare(share: number): number {
  return Math.min(0.95, Math.max(0.05, share));
}

/** Credit for a single settled pick, in edge units (−0.95 … +0.95). */
export function pickEdge(correct: boolean, crowdShareAtPick: number): number {
  return (correct ? 1 : 0) - clampShare(crowdShareAtPick);
}

export function edgeOverCrowd(picks: SettledPick[]): number {
  const n = picks.length;
  if (n === 0) return 0;
  const ordered = [...picks].sort((a, b) => a.settledAt.localeCompare(b.settledAt));
  let num = 0;
  let den = 0;
  ordered.forEach((p, i) => {
    const w = Math.pow(0.5, (n - 1 - i) / RECENCY_HALF_LIFE);
    num += w * pickEdge(p.correct, p.crowdShareAtPick);
    den += w;
  });
  return (num / den) * (n / (n + PRIOR_PICKS));
}

export function computeRating(picks: SettledPick[]): number {
  return Math.round(BASE_RATING + RATING_SCALE * edgeOverCrowd(picks));
}

/** Standard normal CDF (Abramowitz–Stegun approximation). */
function normCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/**
 * Percentile (0–100, higher is better) vs the population. Sample size is
 * already handled by shrinkage in the rating itself.
 * TODO(Sprint 4): replace with the empirical distribution from rating_snapshots.
 */
export function percentileFor(rating: number): number {
  return normCdf((rating - BASE_RATING) / POPULATION_SD) * 100;
}

/** "Top 3%" style label. Never claims better than Top 1%. */
export function topLabel(percentile: number): string {
  const top = Math.max(1, Math.round(100 - percentile));
  return `Top ${top}%`;
}

export function streaks(picks: SettledPick[]): { current: number; best: number } {
  const ordered = [...picks].sort((a, b) => a.settledAt.localeCompare(b.settledAt));
  let best = 0;
  let run = 0;
  for (const p of ordered) {
    run = p.correct ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { current: run, best };
}

export function ratingSnapshot(picks: SettledPick[]): RatingSnapshot {
  const rating = computeRating(picks);
  const wins = picks.filter((p) => p.correct).length;
  const { current, best } = streaks(picks);
  return {
    rating,
    percentile: percentileFor(rating),
    wins,
    losses: picks.length - wins,
    streak: current,
    bestStreak: best,
  };
}

export const CATEGORY_LABELS: Record<Category, string> = {
  semiconductors: 'Semiconductors',
  'big-tech': 'Big Tech',
  'ev-auto': 'EVs & Autos',
  software: 'Software',
  crypto: 'Crypto',
  macro: 'Macro',
  earnings: 'Earnings',
  index: 'Market direction',
};

function expertise(key: string, label: string, picks: SettledPick[]): ExpertiseScore {
  const rating = computeRating(picks);
  return { key, label, rating, percentile: percentileFor(rating), picks: picks.length };
}

/** Category expertise, best first. Categories with < minPicks are hidden. */
export function categoryExpertise(picks: SettledPick[], minPicks = 5): ExpertiseScore[] {
  const by = new Map<Category, SettledPick[]>();
  for (const p of picks) by.set(p.category, [...(by.get(p.category) ?? []), p]);
  return [...by.entries()]
    .filter(([, list]) => list.length >= minPicks)
    .map(([cat, list]) => expertise(cat, CATEGORY_LABELS[cat], list))
    .sort((a, b) => b.percentile - a.percentile);
}

/** Company expertise, best first. A pick counts toward every asset it names. */
export function companyExpertise(
  picks: SettledPick[],
  labelFor: (assetId: string) => string,
  minPicks = 5,
): ExpertiseScore[] {
  const by = new Map<string, SettledPick[]>();
  for (const p of picks) for (const a of p.assetIds) by.set(a, [...(by.get(a) ?? []), p]);
  return [...by.entries()]
    .filter(([, list]) => list.length >= minPicks)
    .map(([id, list]) => expertise(id, labelFor(id), list))
    .sort((a, b) => b.percentile - a.percentile);
}
