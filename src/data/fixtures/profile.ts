import type { Category, SettledPick, UserProfile } from '../types';
import { DEMO_NOW } from './clock';
import { seeded } from './series';

/** DEMO DATA — a believable pick history so the You tab has something to show. */

export const demoUser: UserProfile = {
  id: 'demo-user',
  displayName: 'Alex Rivera',
  handle: 'alexr',
  joinedAt: new Date(DEMO_NOW - 74 * 86_400_000).toISOString(),
};

type Template = { prompt: string; category: Category; assetIds: string[]; skill: number };

/** `skill` = probability of being right; the demo user is strongest on chips. */
const templates: Template[] = [
  { prompt: 'Will NVDA finish green?', category: 'semiconductors', assetIds: ['NVDA'], skill: 0.74 },
  { prompt: 'NVDA or AMD — who does better?', category: 'semiconductors', assetIds: ['NVDA', 'AMD'], skill: 0.7 },
  { prompt: 'Will AMD finish green?', category: 'semiconductors', assetIds: ['AMD'], skill: 0.66 },
  { prompt: 'Will TSLA beat the Nasdaq?', category: 'ev-auto', assetIds: ['TSLA'], skill: 0.52 },
  { prompt: 'Will AAPL finish green?', category: 'big-tech', assetIds: ['AAPL'], skill: 0.6 },
  { prompt: 'Will MSFT finish green?', category: 'big-tech', assetIds: ['MSFT'], skill: 0.6 },
  { prompt: 'Will PLTR beat the Nasdaq?', category: 'software', assetIds: ['PLTR'], skill: 0.58 },
  { prompt: 'Will Bitcoin close the week higher?', category: 'crypto', assetIds: ['BTC'], skill: 0.48 },
  { prompt: 'Will CPI come in cooler than expected?', category: 'macro', assetIds: ['SPX'], skill: 0.55 },
  { prompt: 'Will revenue beat estimates?', category: 'earnings', assetIds: ['NVDA'], skill: 0.72 },
];

export function generateHistory(count = 79, seed = 7): SettledPick[] {
  const rand = seeded(seed);
  const out: SettledPick[] = [];
  for (let i = 0; i < count; i++) {
    const t = templates[Math.floor(rand() * templates.length)];
    const crowdShareAtPick = 0.25 + rand() * 0.55;
    out.push({
      questionId: `hist-${i}`,
      prompt: t.prompt,
      category: t.category,
      assetIds: t.assetIds,
      correct: rand() < t.skill,
      crowdShareAtPick,
      settledAt: new Date(DEMO_NOW - (count - i) * 0.9 * 86_400_000).toISOString(),
    });
  }
  return out;
}

export const demoHistory = generateHistory();
