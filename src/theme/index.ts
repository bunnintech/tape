import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { darkColors, lightColors, radius, space, type, type Theme } from './tokens';

export * from './tokens';

export const darkTheme: Theme = { dark: true, colors: darkColors, space, radius, type };
export const lightTheme: Theme = { dark: false, colors: lightColors, space, radius, type };

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'light' ? lightTheme : darkTheme;
}

/** Build a themed StyleSheet once per theme change. */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (t: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}

export type Direction = 'up' | 'down' | 'flat';

export function directionOf(change: number): Direction {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'flat';
}

export function directionColor(theme: Theme, dir: Direction): string {
  if (dir === 'up') return theme.colors.up;
  if (dir === 'down') return theme.colors.down;
  return theme.colors.flat;
}
