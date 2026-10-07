/**
 * Local app state for the Sprint 1 prototype. Everything here is in-memory;
 * Sprint 2 replaces persistence with Supabase while keeping these actions as
 * the client-side API.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';

import { DEMO_NOW } from '@/data/fixtures/clock';
import { demoHistory } from '@/data/fixtures/profile';
import { demoOutcomes } from '@/data/fixtures/questions';
import { dataSource } from '@/data/source';
import type { Comment, ReactionKey, SettledPick, Settlement, StickerId, UserPrediction } from '@/data/types';
import { makePick, settlePick } from '@/domain/picks';

type State = {
  picks: Record<string, UserPrediction>;
  settlements: Settlement[];
  follows: string[];
  myReactions: Record<string, ReactionKey[]>;
  myComments: Comment[];
};

type Action =
  | { type: 'pick'; pick: UserPrediction }
  | { type: 'settleDemo'; now: number }
  | { type: 'reset' }
  | { type: 'toggleFollow'; assetId: string }
  | { type: 'toggleReaction'; updateId: string; key: ReactionKey }
  | { type: 'comment'; comment: Comment };

/** The demo user already made these event picks before today. */
const seededPicks: Record<string, UserPrediction> = {
  'q-nvda-rev-beat': {
    questionId: 'q-nvda-rev-beat',
    choiceId: 'yes',
    pickedAt: new Date(DEMO_NOW - 3 * 3_600_000).toISOString(),
    crowdShareAtPick: 0.83,
  },
  'q-tsla-deliveries': {
    questionId: 'q-tsla-deliveries',
    choiceId: 'no',
    pickedAt: new Date(DEMO_NOW - 6 * 86_400_000).toISOString(),
    crowdShareAtPick: 0.48,
  },
};

export function initialState(): State {
  return {
    picks: { ...seededPicks },
    settlements: [...dataSource.listSettlements()],
    follows: ['NVDA', 'AMD', 'TSLA'],
    myReactions: {},
    myComments: [],
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'pick':
      if (state.picks[action.pick.questionId]) return state; // picks are final
      return { ...state, picks: { ...state.picks, [action.pick.questionId]: action.pick } };
    case 'settleDemo': {
      const settled = new Set(state.settlements.map((s) => s.questionId));
      const added: Settlement[] = Object.keys(state.picks)
        .filter((qid) => !settled.has(qid) && demoOutcomes[qid])
        .map((qid) => ({
          questionId: qid,
          winningChoiceId: demoOutcomes[qid],
          settledAt: new Date(action.now).toISOString(),
        }));
      return added.length ? { ...state, settlements: [...state.settlements, ...added] } : state;
    }
    case 'reset':
      return initialState();
    case 'toggleFollow': {
      const has = state.follows.includes(action.assetId);
      return {
        ...state,
        follows: has ? state.follows.filter((a) => a !== action.assetId) : [...state.follows, action.assetId],
      };
    }
    case 'toggleReaction': {
      const mine = state.myReactions[action.updateId] ?? [];
      const next = mine.includes(action.key) ? mine.filter((k) => k !== action.key) : [...mine, action.key];
      return { ...state, myReactions: { ...state.myReactions, [action.updateId]: next } };
    }
    case 'comment':
      return { ...state, myComments: [...state.myComments, action.comment] };
    default:
      return state;
  }
}

/** History + anything the user has picked that is now settled. */
export function selectSettledPicks(state: State): SettledPick[] {
  const live: SettledPick[] = [];
  for (const s of state.settlements) {
    const pick = state.picks[s.questionId];
    const q = dataSource.getQuestion(s.questionId);
    if (pick && q) live.push(settlePick(q, pick, s));
  }
  return [...demoHistory, ...live];
}

type Store = {
  state: State;
  pick: (questionId: string, choiceId: string) => void;
  settleDemo: () => void;
  reset: () => void;
  toggleFollow: (assetId: string) => void;
  toggleReaction: (updateId: string, key: ReactionKey) => void;
  /** Post text, or a sticker (body is then ignored). */
  addComment: (eventId: string, body: string, stickerId?: StickerId) => void;
  settlementFor: (questionId: string) => Settlement | undefined;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children, initial }: { children: ReactNode; initial?: State }) {
  const [state, dispatch] = useReducer(reducer, initial ?? initialState());

  const pick = useCallback((questionId: string, choiceId: string) => {
    const q = dataSource.getQuestion(questionId);
    if (!q) return;
    try {
      dispatch({ type: 'pick', pick: makePick(q, choiceId, Date.now()) });
    } catch {
      // locked or invalid — UI already prevents this; ignore.
    }
  }, []);

  const store = useMemo<Store>(
    () => ({
      state,
      pick,
      settleDemo: () => dispatch({ type: 'settleDemo', now: Date.now() }),
      reset: () => dispatch({ type: 'reset' }),
      toggleFollow: (assetId) => dispatch({ type: 'toggleFollow', assetId }),
      toggleReaction: (updateId, key) => dispatch({ type: 'toggleReaction', updateId, key }),
      addComment: (eventId, body, stickerId) => {
        if (!stickerId && !body.trim()) return;
        dispatch({
          type: 'comment',
          comment: {
            id: `me-${Date.now()}`,
            eventId,
            author: 'you',
            body: stickerId ? '' : body.trim(),
            ...(stickerId ? { stickerId } : {}),
            at: new Date().toISOString(),
          },
        });
      },
      settlementFor: (qid) => state.settlements.find((s) => s.questionId === qid),
    }),
    [state, pick],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/** Ticking clock for countdowns and lock checks. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
