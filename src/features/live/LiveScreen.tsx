import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Icon, LiveDot, Screen, Section, T } from '@/components/primitives';
import { TopBar } from '@/components/TopBar';
import { dataSource } from '@/data/source';
import type { MarketEvent } from '@/data/types';
import { formatCount, relativeTime } from '@/domain/format';
import { useNow } from '@/state/store';
import { useTheme } from '@/theme';

export default function LiveScreen() {
  const theme = useTheme();
  const all = dataSource.listEvents();
  const live = all.filter((e) => e.status === 'live');
  const upcoming = all.filter((e) => e.status === 'upcoming').sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const settled = all.filter((e) => e.status === 'settled');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar title="Live" />
      <Screen>
        {live.length ? (
          <Section title="Live now">
            {live.map((e) => (
              <LiveCard key={e.id} event={e} />
            ))}
          </Section>
        ) : (
          <T tone="secondary">Nothing live right now. Here’s what’s next.</T>
        )}

        <Section title="Upcoming">
          {upcoming.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </Section>

        {settled.length ? (
          <Section title="Recently settled">
            {settled.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </Section>
        ) : null}
      </Screen>
    </View>
  );
}

function LiveCard({ event: e }: { event: MarketEvent }) {
  const theme = useTheme();
  const latest = e.updates[e.updates.length - 1];
  const beats = e.metrics.filter((m) => m.result === 'beat').length;
  const misses = e.metrics.filter((m) => m.result === 'miss').length;
  return (
    <Card
      onPress={() => router.push(`/event/${e.id}`)}
      accessibilityLabel={`${e.title}, live now`}
      style={{ gap: theme.space.md, borderColor: theme.colors.accent }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <LiveDot />
        <T variant="caption" tone="tertiary">
          {formatCount(e.watchers)} watching
        </T>
      </View>
      <View style={{ gap: 2 }}>
        <T variant="headline">{e.title}</T>
        <T variant="callout" tone="secondary">
          {e.subtitle}
        </T>
      </View>
      {beats + misses > 0 ? (
        <View style={{ flexDirection: 'row', gap: theme.space.lg }}>
          {beats ? (
            <T variant="bodyStrong" tone="up">
              {beats} beat
            </T>
          ) : null}
          {misses ? (
            <T variant="bodyStrong" tone="down">
              {misses} missed
            </T>
          ) : null}
        </View>
      ) : null}
      {latest ? (
        <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.space.md, gap: 2 }}>
          <T variant="caption" tone="tertiary">
            Latest
          </T>
          <T variant="body">{latest.title}</T>
        </View>
      ) : null}
    </Card>
  );
}

function EventRow({ event: e }: { event: MarketEvent }) {
  const theme = useTheme();
  const now = useNow(30_000);
  const result = e.metrics.find((m) => m.result);
  return (
    <Card
      onPress={() => router.push(`/event/${e.id}`)}
      accessibilityLabel={e.title}
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="bodyStrong">{e.title}</T>
        <T variant="caption" tone="tertiary">
          {e.subtitle}
        </T>
      </View>
      {e.status === 'settled' && result ? (
        <T
          variant="bodyStrong"
          tone={result.result === 'beat' ? 'up' : result.result === 'miss' ? 'down' : 'secondary'}
        >
          {result.result === 'beat' ? 'Beat' : result.result === 'miss' ? 'Missed' : 'In line'}
        </T>
      ) : (
        <T tone="secondary">{relativeTime(e.startsAt, now)}</T>
      )}
      <Icon name="chevron-right" size={18} />
    </Card>
  );
}
