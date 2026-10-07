const MINUS = '−'; // typographic minus reads better than a hyphen in prices

export function formatPrice(v: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact && v >= 10_000) {
    return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatMoney(v: number, opts: { compact?: boolean } = {}): string {
  return `$${formatPrice(v, opts)}`;
}

export function formatPct(v: number): string {
  const sign = v > 0 ? '+' : v < 0 ? MINUS : '';
  return `${sign}${Math.abs(v).toFixed(2)}%`;
}

export function formatChange(v: number): string {
  const sign = v > 0 ? '+' : v < 0 ? MINUS : '';
  return `${sign}${formatPrice(Math.abs(v))}`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export function formatShare(share: number): string {
  return `${Math.round(share * 100)}%`;
}

/** "in 4 min", "in 3 hr", "Tomorrow", "Thu", "5 days ago" */
export function relativeTime(iso: string, now: number): string {
  const diff = Date.parse(iso) - now;
  const abs = Math.abs(diff);
  const min = Math.round(abs / 60_000);
  const hr = Math.round(abs / 3_600_000);
  const day = Math.round(abs / 86_400_000);
  const future = diff > 0;
  if (min < 1) return future ? 'now' : 'just now';
  if (min < 60) return future ? `in ${min} min` : `${min} min ago`;
  if (hr < 24) return future ? `in ${hr} hr` : `${hr} hr ago`;
  if (day === 1) return future ? 'Tomorrow' : 'Yesterday';
  return future ? `in ${day} days` : `${day} days ago`;
}

/** Countdown "3:42" or "1 hr 12 min" */
export function countdown(iso: string, now: number): string {
  const ms = Math.max(0, Date.parse(iso) - now);
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 3600) {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${h} hr ${m} min`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
