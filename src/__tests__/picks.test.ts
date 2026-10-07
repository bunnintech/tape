import { questions } from '@/data/fixtures/questions';
import type { PredictionQuestion } from '@/data/types';
import { crowdRelation, makePick, questionState, settlePick, visibleCrowd } from '@/domain/picks';
import { initialState, reducer } from '@/state/store';

const base: PredictionQuestion = {
  id: 'q-test',
  type: 'direction',
  prompt: 'Will NVDA finish green?',
  assetIds: ['NVDA'],
  category: 'semiconductors',
  choices: [
    { id: 'green', label: 'Green' },
    { id: 'red', label: 'Red' },
  ],
  locksAt: '2026-10-08T13:30:00.000Z',
  settlesAt: '2026-10-08T20:00:00.000Z',
  settlementRule: 'Close vs prior close',
  settlementSource: 'Exchange close',
  crowd: { green: 0.7, red: 0.3 },
  crowdCount: 100,
};
const before = Date.parse('2026-10-08T12:00:00.000Z');
const after = Date.parse('2026-10-08T14:00:00.000Z');

describe('consensus is hidden until the user picks', () => {
  it('returns null crowd for an open question with no pick', () => {
    expect(visibleCrowd(base, undefined, before)).toBeNull();
  });
  it('reveals crowd after a pick', () => {
    const p = makePick(base, 'red', before);
    expect(visibleCrowd(base, p, before)).toEqual(base.crowd);
  });
  it('reveals crowd once picking is closed', () => {
    expect(visibleCrowd(base, undefined, after)).toEqual(base.crowd);
  });
});

describe('lock rules', () => {
  it('is open before lock and locked after', () => {
    expect(questionState(base, before)).toBe('open');
    expect(questionState(base, after)).toBe('locked');
  });
  it('refuses picks after lock', () => {
    expect(() => makePick(base, 'green', after)).toThrow(/locked/);
  });
  it('refuses unknown choices', () => {
    expect(() => makePick(base, 'blue', before)).toThrow(/Unknown choice/);
  });
});

describe('settlement', () => {
  it('records crowd share at pick time and scores deterministically', () => {
    const p = makePick(base, 'red', before);
    expect(p.crowdShareAtPick).toBe(0.3);
    const s = settlePick(base, p, { questionId: 'q-test', winningChoiceId: 'red', settledAt: base.settlesAt });
    expect(s.correct).toBe(true);
  });
  it('labels contrarian picks', () => {
    expect(crowdRelation(0.3).tone).toBe('contrarian');
    expect(crowdRelation(0.75).tone).toBe('consensus');
  });
});

describe('store reducer', () => {
  it('treats picks as final', () => {
    const q = questions.find((x) => x.id === 'q-nvda-green')!;
    const now = Date.parse(q.locksAt) - 60_000;
    let s = reducer(initialState(), { type: 'pick', pick: makePick(q, 'green', now) });
    s = reducer(s, { type: 'pick', pick: makePick(q, 'red', now) });
    expect(s.picks['q-nvda-green'].choiceId).toBe('green');
  });
});

describe('fixture integrity', () => {
  it('every question has a settlement rule, source, and a crowd split summing to 1', () => {
    for (const q of questions) {
      expect(q.settlementRule.length).toBeGreaterThan(10);
      expect(q.settlementSource.length).toBeGreaterThan(3);
      const sum = Object.values(q.crowd).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
      for (const c of q.choices) expect(q.crowd[c.id]).toBeDefined();
    }
  });
  it('has exactly five daily picks', () => {
    expect(questions.filter((q) => q.daily)).toHaveLength(5);
  });
});
