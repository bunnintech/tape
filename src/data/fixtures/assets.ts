import type { Asset, MarketSnapshot, MoveExplanation } from '../types';
import { at } from './clock';

/** DEMO DATA — prices are illustrative, not real quotes. */

export const assets: Asset[] = [
  { id: 'SPX', symbol: 'S&P 500', name: 'S&P 500', shortName: 'S&P 500', kind: 'index', categories: ['index'] },
  {
    id: 'IXIC',
    symbol: 'Nasdaq',
    name: 'Nasdaq Composite',
    shortName: 'Nasdaq',
    kind: 'index',
    categories: ['index', 'big-tech'],
  },
  { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', shortName: 'Bitcoin', kind: 'crypto', categories: ['crypto'] },
  {
    id: 'NVDA',
    symbol: 'NVDA',
    name: 'NVIDIA',
    shortName: 'NVIDIA',
    kind: 'stock',
    categories: ['semiconductors', 'big-tech'],
  },
  {
    id: 'AMD',
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    shortName: 'AMD',
    kind: 'stock',
    categories: ['semiconductors'],
  },
  { id: 'TSLA', symbol: 'TSLA', name: 'Tesla', shortName: 'Tesla', kind: 'stock', categories: ['ev-auto', 'big-tech'] },
  { id: 'PLTR', symbol: 'PLTR', name: 'Palantir', shortName: 'Palantir', kind: 'stock', categories: ['software'] },
  { id: 'AAPL', symbol: 'AAPL', name: 'Apple', shortName: 'Apple', kind: 'stock', categories: ['big-tech'] },
  {
    id: 'MSFT',
    symbol: 'MSFT',
    name: 'Microsoft',
    shortName: 'Microsoft',
    kind: 'stock',
    categories: ['big-tech', 'software'],
  },
  { id: 'SPY', symbol: 'SPY', name: 'SPDR S&P 500 ETF', shortName: 'SPY', kind: 'etf', categories: ['index'] },
];

function snap(assetId: string, price: number, changePct: number): MarketSnapshot {
  const previousClose = price / (1 + changePct / 100);
  return {
    assetId,
    price,
    previousClose,
    change: price - previousClose,
    changePct,
    asOf: at.minutes(-40),
  };
}

export const snapshots: MarketSnapshot[] = [
  snap('SPX', 6712.38, 0.84),
  snap('IXIC', 23140.52, 1.21),
  snap('BTC', 118420, -0.62),
  snap('NVDA', 212.4, 3.12),
  snap('AMD', 168.35, 2.18),
  snap('TSLA', 438.2, -2.41),
  snap('PLTR', 186.75, 4.63),
  snap('AAPL', 254.1, 0.38),
  snap('MSFT', 521.3, 0.92),
  snap('SPY', 669.85, 0.83),
];

export const explanations: MoveExplanation[] = [
  {
    assetId: 'NVDA',
    text: 'Rose into earnings, then added another 4% after hours as revenue beat expectations.',
    sources: ['NVIDIA earnings release', 'Consensus estimates', 'After-hours price data'],
    confidence: 'high',
  },
  {
    assetId: 'PLTR',
    text: 'Jumped after announcing a new multi-year U.S. Army software contract this morning.',
    sources: ['Palantir press release'],
    confidence: 'high',
  },
  {
    assetId: 'TSLA',
    text: 'Fell after quarterly deliveries came in below what analysts expected.',
    sources: ['Tesla delivery report', 'Consensus estimates'],
    confidence: 'high',
  },
  {
    assetId: 'BTC',
    text: 'Traders appear to be taking profits after last week’s run to a record high.',
    sources: ['Exchange price & volume data'],
    confidence: 'medium',
  },
  {
    assetId: 'AMD',
    text: 'Moved up with other chip makers ahead of NVIDIA’s results.',
    sources: ['Sector price data'],
    confidence: 'medium',
  },
  {
    assetId: 'AAPL',
    text: 'Little changed — no major company news today.',
    sources: ['Price data', 'Company news feed'],
    confidence: 'high',
  },
  {
    assetId: 'MSFT',
    text: 'Edged up with the broader tech rally.',
    sources: ['Sector price data'],
    confidence: 'medium',
  },
  {
    assetId: 'SPX',
    text: 'Up for a third day, led by chip makers and software.',
    sources: ['Index constituent data'],
    confidence: 'high',
  },
  {
    assetId: 'IXIC',
    text: 'Outpaced the S&P 500 as chip stocks rallied into NVIDIA earnings.',
    sources: ['Index constituent data'],
    confidence: 'high',
  },
  {
    assetId: 'SPY',
    text: 'Tracks the S&P 500, which rose for a third day.',
    sources: ['Index constituent data'],
    confidence: 'high',
  },
];

/** Home → "Today in one line". Plain English, no jargon. */
export const marketHeadline = 'Stocks rose, led by chip makers. NVIDIA’s earnings are live now. Bitcoin slipped.';

export const marketStatus = { label: 'After hours', detail: 'Prices as of the 4:00 PM ET close' };

export const scoreboardIds = ['SPX', 'IXIC', 'BTC'];
export const movingIds = ['NVDA', 'PLTR', 'TSLA', 'BTC'];

/** The one community prediction surfaced on each Company page. */
export const featuredQuestionByAsset: Record<string, string> = {
  NVDA: 'q-nvda-green',
  AMD: 'q-amd-vs-nvda',
  PLTR: 'q-pltr-vs-nasdaq',
  BTC: 'q-btc-120k',
  TSLA: 'q-tsla-margin',
  AAPL: 'q-aapl-green',
  MSFT: 'q-msft-green',
  SPX: 'q-spx-green',
  SPY: 'q-spx-green',
  IXIC: 'q-pltr-vs-nasdaq',
};
