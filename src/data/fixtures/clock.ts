/**
 * Demo clock. All fixture times are relative to app start so countdowns, lock
 * times and "Later" labels stay coherent whenever the demo is opened.
 *
 * Scenario: it's ~4:40 PM ET on a weekday. The regular session just closed,
 * NVIDIA earnings are live after hours, tomorrow's daily picks are open.
 */
export const DEMO_NOW = Date.now();

const MIN = 60_000;
const HOUR = 60 * MIN;

export const at = {
  minutes: (n: number) => new Date(DEMO_NOW + n * MIN).toISOString(),
  hours: (n: number) => new Date(DEMO_NOW + n * HOUR).toISOString(),
  days: (n: number) => new Date(DEMO_NOW + n * 24 * HOUR).toISOString(),
};
