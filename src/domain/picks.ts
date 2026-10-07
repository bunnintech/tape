/**
 * Pick rules (blueprint §4, §7, §16):
 * - The crowd split is hidden until the user has picked.
 * - No picks after the lock time.
 * - Settlement is deterministic: a single winning choice from a named source.
 */

import type { PredictionQuestion, Settlement, SettledPick, UserPrediction } from '@/data/types';

export type QuestionState = 'open' | 'locked' | 'settled';

export function questionState(q: PredictionQuestion, now: number, settlement?: Settlement): QuestionState {
  if (settlement) return 'settled';
  if (now >= Date.parse(q.locksAt)) return 'locked';
  return 'open';
}

export function canPick(q: PredictionQuestion, now: number, existing?: UserPrediction, settlement?: Settlement) {
  return !existing && questionState(q, now, settlement) === 'open';
}

/**
 * The only way UI code should read crowd numbers. Returns null until the user
 * has a pick on this question, or the question is settled/locked (consensus is
 * public once picking is closed).
 */
export function visibleCrowd(
  q: PredictionQuestion,
  pick: UserPrediction | undefined,
  now: number,
  settlement?: Settlement,
): Record<string, number> | null {
  if (pick) return q.crowd;
  if (questionState(q, now, settlement) !== 'open') return q.crowd;
  return null;
}

export function makePick(q: PredictionQuestion, choiceId: string, now: number): UserPrediction {
  if (!q.choices.some((c) => c.id === choiceId)) {
    throw new Error(`Unknown choice "${choiceId}" for question ${q.id}`);
  }
  if (now >= Date.parse(q.locksAt)) {
    throw new Error(`Question ${q.id} is locked`);
  }
  return {
    questionId: q.id,
    choiceId,
    pickedAt: new Date(now).toISOString(),
    crowdShareAtPick: q.crowd[choiceId] ?? 0.5,
  };
}

export function settlePick(q: PredictionQuestion, pick: UserPrediction, s: Settlement): SettledPick {
  if (s.questionId !== q.id || pick.questionId !== q.id) {
    throw new Error('Settlement does not match question/pick');
  }
  return {
    questionId: q.id,
    prompt: q.prompt,
    category: q.category,
    assetIds: q.assetIds,
    correct: pick.choiceId === s.winningChoiceId,
    crowdShareAtPick: pick.crowdShareAtPick,
    settledAt: s.settledAt,
  };
}

/** How the user's pick relates to the crowd — shown right after picking. */
export function crowdRelation(share: number): { label: string; tone: 'contrarian' | 'consensus' | 'split' } {
  if (share < 0.4) return { label: 'Contrarian call — worth more if you’re right', tone: 'contrarian' };
  if (share > 0.6) return { label: 'You’re with the crowd', tone: 'consensus' };
  return { label: 'The crowd is split', tone: 'split' };
}
