import type { ChartRange, MarketSnapshot, PricePoint } from '../types';
import { DEMO_NOW } from './clock';

/** Deterministic PRNG so demo charts are stable between renders/tests. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

const RANGE_SPEC: Record<ChartRange, { points: number; stepMs: number; drift: number; vol: number }> = {
  '1D': { points: 78, stepMs: 5 * 60_000, drift: 0, vol: 0.0016 },
  '1W': { points: 70, stepMs: 60 * 60_000, drift: 0, vol: 0.004 },
  '1M': { points: 22, stepMs: 24 * 60 * 60_000, drift: 0, vol: 0.014 },
  '1Y': { points: 52, stepMs: 7 * 24 * 60 * 60_000, drift: 0, vol: 0.035 },
};

/** DEMO series: a seeded random walk bridged to hit today's real endpoints. */
export function demoSeries(snap: MarketSnapshot, range: ChartRange): PricePoint[] {
  const spec = RANGE_SPEC[range];
  const rand = seeded(hash(snap.assetId + range));
  const end = snap.price;
  // 1D starts at previous close; longer ranges start at a seeded earlier level.
  const start =
    range === '1D'
      ? snap.previousClose
      : end / (1 + (rand() - 0.35) * (range === '1Y' ? 0.9 : range === '1M' ? 0.18 : 0.07));

  const walk: number[] = [0];
  for (let i = 1; i < spec.points; i++) walk.push(walk[i - 1] + (rand() - 0.5) * 2 * spec.vol);
  const last = walk[walk.length - 1];

  return walk.map((w, i) => {
    const f = i / (spec.points - 1);
    // Brownian bridge: remove end drift so the line lands exactly on `end`.
    const bridged = w - f * last;
    const base = start + (end - start) * f;
    return { t: DEMO_NOW - (spec.points - 1 - i) * spec.stepMs, v: base * (1 + bridged) };
  });
}
