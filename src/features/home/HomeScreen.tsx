import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Delta, Divider, Icon, LiveDot, Press, Screen, Section, T } from '@/components/primitives';
import { TopBar } from '@/components/TopBar';
import { dataSource } from '@/data/source';
import { formatPrice, relativeTime } from '@/domain/format';
import { useNow } from '@/state/store';
import { useTheme } from '@/theme';

/**
 * Home answers one question: "what matters right now?"
 * Scoreboard → Moving (with one-line why) → Later. Nothing else (blueprint §6).
 */
export default function HomeScreen() {
  const theme = useTheme();
  const home = dataSource.getHome();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar title="Home" wordmark />
      <Screen>
        <View style={{ gap: theme.space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.textTertiary }} />
            <T variant="caption" tone="tertiary">
              {home.status.label} · {home.status.detail}
            </T>
          </View>
          <T variant="headline" accessibilityRole="summary">
            {home.headline}
          </T>
        </View>

        <Scoreboard ids={home.scoreboardIds} />

        <Section title="Moving">
          <Card style={{ paddingVertical: theme.space.xs }}>
            {home.movingIds.map((id, i) => (
              <View key={id}>
                {i > 0 ? <Divider /> : null}
                <MoverRow assetId={id} />
              </View>
            ))}
          </Card>
        </Section>

        <Later />
      </Screen>
    </View>
  );
}

function Scoreboard({ ids }: { ids: string[] }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: theme.space.sm }} accessibilityLabel="Market scoreboard">
      {ids.map((id) => {
        const a = dataSource.getAsset(id)!;
        const s = dataSource.getSnapshot(id)!;
        return (
          <Press
            key={id}
            onPress={() => router.push(`/company/${id}`)}
            accessibilityLabel={`${a.shortName}, ${s.changePct.toFixed(2)} percent`}
            style={{
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingVertical: theme.space.lg,
              paddingHorizontal: theme.space.md,
              gap: theme.space.xs,
            }}
          >
            <T variant="caption" tone="secondary" numberOfLines={1}>
              {a.shortName}
            </T>
            <Delta pct={s.changePct} variant="headline" />
            <T variant="caption" tone="tertiary" numeric numberOfLines={1}>
              {formatPrice(s.price, { compact: true })}
            </T>
          </Press>
        );
      })}
    </View>
  );
}

function MoverRow({ assetId }: { assetId: string }) {
  const theme = useTheme();
  const a = dataSource.getAsset(assetId)!;
  const s = dataSource.getSnapshot(assetId)!;
  const why = dataSource.getExplanation(assetId);
  return (
    <Press
      onPress={() => router.push(`/company/${assetId}`)}
      accessibilityLabel={`${a.shortName}. ${why?.text ?? ''}`}
      style={{ paddingVertical: theme.space.md, gap: theme.space.xs }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.space.sm }}>
          <T variant="bodyStrong">{a.symbol}</T>
          <T variant="callout" tone="tertiary">
            {a.shortName}
          </T>
        </View>
        <Delta pct={s.changePct} pill />
      </View>
      {why ? (
        <T variant="callout" tone="secondary" numberOfLines={2}>
          {why.text}
        </T>
      ) : null}
    </Press>
  );
}

function Later() {
  const theme = useTheme();
  const now = useNow(30_000);
  const events = dataSource
    .listEvents()
    .filter((e) => e.status !== 'settled')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <Section title="Later">
      <Card style={{ paddingVertical: theme.space.xs }}>
        {events.map((e, i) => (
          <View key={e.id}>
            {i > 0 ? <Divider /> : null}
            <Press
              onPress={() => router.push(`/event/${e.id}`)}
              accessibilityLabel={`${e.title}, ${e.status === 'live' ? 'live now' : relativeTime(e.startsAt, now)}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: theme.space.md,
                gap: theme.space.md,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="bodyStrong">{e.title}</T>
                <T variant="caption" tone="tertiary">
                  {e.subtitle}
                </T>
              </View>
              {e.status === 'live' ? (
                <LiveDot />
              ) : (
                <T variant="callout" tone="secondary">
                  {relativeTime(e.startsAt, now)}
                </T>
              )}
              <Icon name="chevron-right" size={18} color={theme.colors.textTertiary} />
            </Press>
          </View>
        ))}
      </Card>
    </Section>
  );
}
