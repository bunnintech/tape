import type { SettledPick } from '@/data/types';
import {
  BASE_RATING,
  categoryExpertise,
  computeRating,
  pickEdge,
  ratingSnapshot,
  streaks,
  topLabel,
} from '@/domain/rating';

let seq = 0;
function pick(correct: boolean, crowdShareAtPick: number, extra: Partial<SettledPick> = {}): SettledPick {
  seq += 1;
  return {
    questionId: `q${seq}`,
    prompt: 'test',
    category: 'semiconductors',
    assetIds: ['NVDA'],
    correct,
    crowdShareAtPick,
    settledAt: new Date(Date.UTC(2026, 0, 1) + seq * 60_000).toISOString(),
    ...extra,
  };
}

describe('pickEdge — difficulty matters', () => {
  it('rewards a correct contrarian call more than a correct consensus call', () => {
    expect(pickEdge(true, 0.25)).toBeGreaterThan(pickEdge(true, 0.8));
  });
  it('penalizes missing an easy call more than missing a bold one', () => {
    expect(pickEdge(false, 0.8)).toBeLessThan(pickEdge(false, 0.25));
  });
  it('clamps extreme crowd shares so no pick is worth 0 or 1', () => {
    expect(pickEdge(true, 1)).toBeCloseTo(0.05);
    expect(pickEdge(false, 0)).toBeCloseTo(-0.05);
  });
});

describe('computeRating', () => {
  it('starts at the base rating with no picks', () => {
    expect(computeRating([])).toBe(BASE_RATING);
  });

  it('only rises when you beat the crowd, not when you match it', () => {
    // Always right exactly as often as the crowd expects → ~zero edge.
    const calibrated = Array.from({ length: 100 }, (_, i) => pick(i % 2 === 0, 0.5));
    expect(Math.abs(computeRating(calibrated) - BASE_RATING)).toBeLessThan(15);
  });

  it('does not inflate with volume alone (reputation over activity)', () => {
    const block = () => Array.from({ length: 40 }, (_, i) => pick(i % 5 < 3, 0.5)); // 60% vs 50% crowd
    const forty = computeRating(block());
    const twoHundred = computeRating([...block(), ...block(), ...block(), ...block(), ...block()]);
    // More picks increases confidence (less shrinkage) but must not run away.
    expect(twoHundred - forty).toBeLessThan(30);
    expect(twoHundred).toBeGreaterThan(BASE_RATING);
  });

  it('shrinks small samples: 3-for-3 is not elite', () => {
    const lucky = [pick(true, 0.5), pick(true, 0.5), pick(true, 0.5)];
    const proven = Array.from({ length: 60 }, (_, i) => pick(i % 10 < 7, 0.5));
    expect(computeRating(lucky)).toBeLessThan(computeRating(proven));
  });

  it('weights recent results more than old ones', () => {
    const goodThenBad = [
      ...Array.from({ length: 40 }, () => pick(true, 0.5)),
      ...Array.from({ length: 40 }, () => pick(false, 0.5)),
    ];
    const badThenGood = [
      ...Array.from({ length: 40 }, () => pick(false, 0.5)),
      ...Array.from({ length: 40 }, () => pick(true, 0.5)),
    ];
    expect(computeRating(badThenGood)).toBeGreaterThan(computeRating(goodThenBad));
  });
});

describe('streaks & snapshot', () => {
  it('tracks current and best streak in settlement order', () => {
    const list = [pick(true, 0.5), pick(true, 0.5), pick(true, 0.5), pick(false, 0.5), pick(true, 0.5)];
    expect(streaks(list)).toEqual({ current: 1, best: 3 });
  });

  it('computes W–L', () => {
    const snap = ratingSnapshot([pick(true, 0.5), pick(false, 0.5), pick(true, 0.5)]);
    expect(snap.wins).toBe(2);
    expect(snap.losses).toBe(1);
  });
});

describe('expertise', () => {
  it('segments by category and hides thin categories', () => {
    const list = [
      ...Array.from({ length: 8 }, () => pick(true, 0.5, { category: 'semiconductors' })),
      ...Array.from({ length: 3 }, () => pick(true, 0.5, { category: 'macro' })),
    ];
    const cats = categoryExpertise(list);
    expect(cats.map((c) => c.key)).toEqual(['semiconductors']);
  });

  it('never claims better than Top 1%', () => {
    expect(topLabel(99.99)).toBe('Top 1%');
    expect(topLabel(97)).toBe('Top 3%');
  });
});
