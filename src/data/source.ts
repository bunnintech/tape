/**
 * Market-data adapter boundary (blueprint §11: "Provider abstraction layer").
 *
 * Screens only ever talk to `MarketDataSource`. Sprint 3 adds a licensed
 * provider adapter that implements this same interface server-side; the mock
 * adapter stays as the offline/demo fallback.
 */

import { env } from '@/config/env';

import {
  assets,
  explanations,
  featuredQuestionByAsset,
  marketHeadline,
  marketStatus,
  movingIds,
  scoreboardIds,
  snapshots,
} from './fixtures/assets';
import { events, seedComments } from './fixtures/events';
import { dailyQuestionIds, questions, settlements } from './fixtures/questions';
import { demoSeries } from './fixtures/series';
import type {
  Asset,
  ChartRange,
  Comment,
  MarketEvent,
  MarketSnapshot,
  MoveExplanation,
  PredictionQuestion,
  PricePoint,
  Settlement,
} from './types';

export interface MarketDataSource {
  readonly isDemo: boolean;
  listAssets(): Asset[];
  getAsset(id: string): Asset | undefined;
  getSnapshot(assetId: string): MarketSnapshot | undefined;
  getSeries(assetId: string, range: ChartRange): PricePoint[];
  getExplanation(assetId: string): MoveExplanation | undefined;
  getHome(): {
    headline: string;
    status: { label: string; detail: string };
    scoreboardIds: string[];
    movingIds: string[];
  };
  listEvents(): MarketEvent[];
  getEvent(id: string): MarketEvent | undefined;
  nextEventFor(assetId: string): MarketEvent | undefined;
  listQuestions(): PredictionQuestion[];
  getQuestion(id: string): PredictionQuestion | undefined;
  dailyQuestionIds(): string[];
  featuredQuestionFor(assetId: string): PredictionQuestion | undefined;
  listSettlements(): Settlement[];
  listComments(eventId: string): Comment[];
}

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));

export function createMockSource(): MarketDataSource {
  const assetMap = byId(assets);
  const eventMap = byId(events);
  const questionMap = byId(questions);
  const snapMap = new Map(snapshots.map((s) => [s.assetId, s]));
  const whyMap = new Map(explanations.map((e) => [e.assetId, e]));

  return {
    isDemo: true,
    listAssets: () => assets,
    getAsset: (id) => assetMap.get(id),
    getSnapshot: (id) => snapMap.get(id),
    getSeries: (id, range) => {
      const s = snapMap.get(id);
      return s ? demoSeries(s, range) : [];
    },
    getExplanation: (id) => whyMap.get(id),
    getHome: () => ({ headline: marketHeadline, status: marketStatus, scoreboardIds, movingIds }),
    listEvents: () => events,
    getEvent: (id) => eventMap.get(id),
    nextEventFor: (assetId) =>
      events
        .filter((e) => e.status !== 'settled' && e.assetIds.includes(assetId))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0],
    listQuestions: () => questions,
    getQuestion: (id) => questionMap.get(id),
    dailyQuestionIds: () => dailyQuestionIds,
    featuredQuestionFor: (assetId) => {
      const id = featuredQuestionByAsset[assetId];
      return id ? questionMap.get(id) : undefined;
    },
    listSettlements: () => settlements,
    listComments: (eventId) => seedComments.filter((c) => c.eventId === eventId),
  };
}

export const dataSource: MarketDataSource = env.dataSource === 'mock' ? createMockSource() : createMockSource();
