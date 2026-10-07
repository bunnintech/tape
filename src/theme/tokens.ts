/**
 * Tape design tokens.
 *
 * Rules (from the product blueprint — do not break):
 * - Green ONLY means up / beat / correct. Red ONLY means down / miss / incorrect.
 * - The brand accent is used for identity, focus, selection and "live" — never
 *   for market direction.
 * - Surfaces are neutral. No gradients, no decorative color.
 */

export const palette = {
  black: '#09090A',
  white: '#FFFFFF',
  // neutral ramp (dark → light)
  n950: '#0E0E10',
  n900: '#151518',
  n850: '#1C1C20',
  n800: '#24242A',
  n700: '#34343C',
  n600: '#4A4A54',
  n500: '#6B6B76',
  n400: '#8E8E99',
  n300: '#B4B4BD',
  n200: '#D9D9DF',
  n150: '#E7E7EC',
  n100: '#F1F1F4',
  n50: '#F8F8FA',
  // semantic market colors
  upDark: '#2FD27A',
  upLight: '#0E9F55',
  downDark: '#FF5A52',
  downLight: '#D9362E',
  // brand accent — electric violet. Never used for up/down.
  accentDark: '#8B7BFF',
  accentLight: '#5B45F0',
} as const;

/**
 * Sticker illustration inks. Art only: never use these for UI chrome or market direction.
 * Deliberately no green or red so a sticker can't be read as up/down or right/wrong.
 */
export const illustration = {
  cut: '#FFFFFF',
  cutShadow: 'rgba(0,0,0,0.18)',
  ink: '#17151F',
  white: '#FFFFFF',
  bull: '#9A5B34',
  bullDark: '#6E3E22',
  horn: '#F4E6C8',
  snout: '#E8B49A',
  bear: '#5E4433',
  bearLight: '#B98E6A',
  tear: '#5BB8F2',
  hull: '#F2F1F7',
  violet: '#7B66FF',
  flame: '#FF9F1C',
  flameCore: '#FFD84D',
  moon: '#FFE48A',
  diamond: '#8EE7F7',
  diamondDeep: '#33BFDC',
  diamondLight: '#D6F8FF',
  gold: '#F2B92B',
  bottle: '#2E3A6B',
  cork: '#C8976A',
  paper: '#FFF8E8',
  popcorn: '#FFF2C6',
  popcornEdge: '#F2C14E',
  face: '#FFCC33',
  faceDark: '#F0AE0C',
} as const;

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  up: string;
  upSoft: string;
  down: string;
  downSoft: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  flat: string;
};

export const darkColors: ThemeColors = {
  bg: palette.black,
  surface: palette.n900,
  surfaceRaised: palette.n850,
  border: palette.n800,
  text: '#F4F4F6',
  textSecondary: palette.n300,
  textTertiary: palette.n500,
  up: palette.upDark,
  upSoft: 'rgba(47,210,122,0.14)',
  down: palette.downDark,
  downSoft: 'rgba(255,90,82,0.14)',
  accent: palette.accentDark,
  accentSoft: 'rgba(139,123,255,0.16)',
  onAccent: palette.black,
  flat: palette.n400,
};

export const lightColors: ThemeColors = {
  bg: palette.white,
  surface: palette.n50,
  surfaceRaised: palette.white,
  border: palette.n150,
  text: palette.n950,
  textSecondary: palette.n600,
  textTertiary: palette.n400,
  up: palette.upLight,
  upSoft: 'rgba(14,159,85,0.10)',
  down: palette.downLight,
  downSoft: 'rgba(217,54,46,0.10)',
  accent: palette.accentLight,
  accentSoft: 'rgba(91,69,240,0.10)',
  onAccent: palette.white,
  flat: palette.n500,
};

/** 4-pt spacing scale. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/**
 * Type scale. Minimum body size is 15 — the blueprint forbids "tiny finance text".
 * `numeric` variants use tabular figures so prices don't jitter.
 */
export const type = {
  display: { fontSize: 44, lineHeight: 48, fontWeight: '700', letterSpacing: -1.2 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.6 },
  headline: { fontSize: 20, lineHeight: 26, fontWeight: '600', letterSpacing: -0.3 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400', letterSpacing: -0.1 },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600', letterSpacing: -0.1 },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: 0 },
  label: { fontSize: 13, lineHeight: 16, fontWeight: '600', letterSpacing: 0.6 },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: 0 },
} as const;

export type TypeVariant = keyof typeof type;

export type Theme = {
  dark: boolean;
  colors: ThemeColors;
  space: typeof space;
  radius: typeof radius;
  type: typeof type;
};
