/**
 * Environment config. Only EXPO_PUBLIC_* values reach the client bundle —
 * never put secrets (LLM keys, market-data keys) here. Those live server-side.
 */
export const env = {
  /** Shows DEMO DATA labels and demo controls. Defaults ON until real data ships. */
  demoMode: (process.env.EXPO_PUBLIC_DEMO_MODE ?? 'true') !== 'false',
  /** Which market-data adapter to use. Only "mock" exists in Sprint 1. */
  dataSource: (process.env.EXPO_PUBLIC_DATA_SOURCE ?? 'mock') as 'mock',
};
