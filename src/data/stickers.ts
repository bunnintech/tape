import type { StickerId } from './types';

/** Sticker catalog, in tray order. `label` is the accessible name and the caption printed on the art. */
export const STICKERS: { id: StickerId; label: string }[] = [
  { id: 'bull-lets-go', label: 'Let’s go' },
  { id: 'bear-pain', label: 'Pain' },
  { id: 'to-the-moon', label: 'To the moon' },
  { id: 'diamond-hands', label: 'Diamond hands' },
  { id: 'called-it', label: 'Called it' },
  { id: 'priced-in', label: 'Priced in' },
  { id: 'popcorn', label: 'Watching' },
  { id: 'not-like-this', label: 'Not like this' },
];

export function stickerLabel(id: StickerId): string {
  return STICKERS.find((s) => s.id === id)?.label ?? 'Sticker';
}
