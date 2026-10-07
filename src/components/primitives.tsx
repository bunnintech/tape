import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { env } from '@/config/env';
import { formatPct } from '@/domain/format';
import { directionColor, directionOf, makeStyles, useTheme, type TypeVariant } from '@/theme';

/* ─── Text ──────────────────────────────────────────────────────────────── */

type Tone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'up' | 'down';

export function T({
  variant = 'body',
  tone = 'primary',
  numeric,
  color,
  style,
  ...rest
}: TextProps & { variant?: TypeVariant; tone?: Tone; numeric?: boolean; color?: string }) {
  const theme = useTheme();
  const toneColor: Record<Tone, string> = {
    primary: theme.colors.text,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    accent: theme.colors.accent,
    up: theme.colors.up,
    down: theme.colors.down,
  };
  const base: TextStyle = {
    ...(theme.type[variant] as TextStyle),
    color: color ?? toneColor[tone],
    ...(variant === 'label' ? { textTransform: 'uppercase' } : null),
    ...(numeric ? { fontVariant: ['tabular-nums'] } : null),
  };
  return <Text {...rest} style={[base, style]} />;
}

/* ─── Layout ────────────────────────────────────────────────────────────── */

export function Screen({
  children,
  scroll = true,
  padTop = false,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  padTop?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const style: ViewStyle = {
    paddingHorizontal: theme.space.lg,
    paddingTop: padTop ? insets.top + theme.space.md : theme.space.sm,
    paddingBottom: theme.space.xxxl,
    gap: theme.space.xxl,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  };
  if (!scroll) {
    return <View style={[{ flex: 1, backgroundColor: theme.colors.bg }, style, contentStyle]}>{children}</View>;
  }
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      contentContainerStyle={[style, contentStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <T variant="label" tone="tertiary" accessibilityRole="header">
          {title}
        </T>
        {action}
      </View>
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const s = useCardStyles();
  if (onPress) {
    return (
      <Press onPress={onPress} style={[s.card, style]} accessibilityLabel={accessibilityLabel}>
        {children}
      </Press>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

const useCardStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: t.space.lg,
  },
}));

export function Divider() {
  const theme = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.colors.border }} />;
}

/** Pressable with a subtle press state. */
export function Press({
  style,
  children,
  ...rest
}: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [style, pressed && { opacity: 0.6, transform: [{ scale: 0.985 }] }]}
    >
      {children}
    </Pressable>
  );
}

export function Icon(props: ComponentProps<typeof Feather>) {
  const theme = useTheme();
  return <Feather color={theme.colors.textSecondary} size={20} {...props} />;
}

/* ─── Market primitives ─────────────────────────────────────────────────── */

/** Percent move. Green/red only — the one place market color comes from. */
export function Delta({ pct, variant = 'bodyStrong', pill }: { pct: number; variant?: TypeVariant; pill?: boolean }) {
  const theme = useTheme();
  const dir = directionOf(pct);
  const color = directionColor(theme, dir);
  const text = (
    <T variant={variant} numeric color={color}>
      {formatPct(pct)}
    </T>
  );
  if (!pill) return text;
  return (
    <View
      style={{
        backgroundColor:
          dir === 'up' ? theme.colors.upSoft : dir === 'down' ? theme.colors.downSoft : theme.colors.surfaceRaised,
        paddingHorizontal: theme.space.sm,
        paddingVertical: theme.space.xxs + 1,
        borderRadius: theme.radius.sm,
      }}
    >
      {text}
    </View>
  );
}

/** Brand-accent "LIVE" marker. Red is reserved for "down", so live is never red. */
export function LiveDot({ label = 'LIVE' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.accent }} />
      <T variant="label" tone="accent">
        {label}
      </T>
    </View>
  );
}

export function DemoBadge() {
  const theme = useTheme();
  if (!env.demoMode) return null;
  return (
    <View
      accessibilityLabel="Demo data"
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
        borderRadius: theme.radius.sm,
        paddingHorizontal: 6,
        paddingVertical: 2,
      }}
    >
      <T variant="label" tone="tertiary" style={{ fontSize: 11, letterSpacing: 0.8 }}>
        Demo data
      </T>
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Press
      onPress={onPress}
      accessibilityState={{ selected: !!active }}
      style={{
        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.sm,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? theme.colors.text : 'transparent',
      }}
    >
      <T variant="bodyStrong" color={active ? theme.colors.bg : theme.colors.textSecondary} style={{ fontSize: 14 }}>
        {label}
      </T>
    </Press>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  disabled,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary';
  icon?: ComponentProps<typeof Feather>['name'];
  disabled?: boolean;
}) {
  const theme = useTheme();
  const primary = kind === 'primary';
  return (
    <Press
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled }}
      style={{
        flexDirection: 'row',
        gap: theme.space.sm,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        paddingHorizontal: theme.space.xl,
        borderRadius: theme.radius.pill,
        backgroundColor: primary ? theme.colors.accent : theme.colors.surfaceRaised,
        borderWidth: primary ? 0 : 1,
        borderColor: theme.colors.border,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {icon ? <Icon name={icon} size={18} color={primary ? theme.colors.onAccent : theme.colors.text} /> : null}
      <T variant="bodyStrong" color={primary ? theme.colors.onAccent : theme.colors.text}>
        {label}
      </T>
    </Press>
  );
}
