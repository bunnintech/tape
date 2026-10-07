import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { LineChart } from '@/components/LineChart';
import {
  Button,
  Card,
  Chip,
  Delta,
  DemoBadge,
  Icon,
  LiveDot,
  Press,
  Screen,
  Section,
  T,
} from '@/components/primitives';
import { QuestionCard } from '@/components/QuestionCard';
import { dataSource } from '@/data/source';
import type { ChartRange } from '@/data/types';
import { formatChange, formatCount, formatMoney, formatPct, formatPrice, relativeTime } from '@/domain/format';
import { useNow, useStore } from '@/state/store';
import { directionColor, directionOf, useTheme } from '@/theme';

const RANGES: ChartRange[] = ['1D', '1W', '1M', '1Y'];

export default function CompanyScreen({ assetId }: { assetId: string }) {
  const theme = useTheme();
  const now = useNow(30_000);
  const { state, toggleFollow } = useStore();
  const [range, setRange] = useState<ChartRange>('1D');

  const asset = dataSource.getAsset(assetId);
  const snap = dataSource.getSnapshot(assetId);
  if (!asset || !snap) {
    return (
      <Screen>
        <T variant="headline">We don’t cover {assetId} yet.</T>
        <T tone="secondary">Tape starts with a focused set of companies so each one is excellent.</T>
      </Screen>
    );
  }

  const why = dataSource.getExplanation(assetId);
  const next = dataSource.nextEventFor(assetId);
  const question = dataSource.featuredQuestionFor(assetId);
  const series = dataSource.getSeries(assetId, range);
  const rangeChange = series.length ? ((series[series.length - 1].v - series[0].v) / series[0].v) * 100 : 0;
  const following = state.follows.includes(assetId);
  const isMoney = asset.kind !== 'index';

  return (
    <>
      <Stack.Screen options={{ title: asset.symbol, headerRight: () => <DemoBadge /> }} />
      <Screen>
        {/* price block */}
        <View style={{ gap: theme.space.xs }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.space.md }}
          >
            <T variant="headline" tone="secondary" style={{ flexShrink: 1 }} numberOfLines={1}>
              {asset.name}
            </T>
            <Button
              label={following ? 'Following' : 'Follow'}
              kind={following ? 'secondary' : 'primary'}
              icon={following ? 'check' : 'plus'}
              onPress={() => toggleFollow(assetId)}
            />
          </View>
          <T variant="display" numeric>
            {isMoney ? formatMoney(snap.price) : formatPrice(snap.price)}
          </T>
          <View style={{ flexDirection: 'row', gap: theme.space.sm, alignItems: 'center' }}>
            <T variant="bodyStrong" numeric color={directionColor(theme, directionOf(snap.change))}>
              {formatChange(snap.change)} ({formatPct(snap.changePct)})
            </T>
            <T variant="callout" tone="tertiary">
              today
            </T>
          </View>
        </View>

        {/* chart */}
        <View style={{ gap: theme.space.md }}>
          <LineChart points={series} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: theme.space.xs }}>
              {RANGES.map((r) => (
                <Chip key={r} label={r} active={r === range} onPress={() => setRange(r)} />
              ))}
            </View>
            <Delta pct={rangeChange} variant="callout" />
          </View>
        </View>

        {/* why */}
        {why ? (
          <Section title={why.confidence === 'high' ? 'Why it’s moving' : 'Likely why'}>
            <Card style={{ gap: theme.space.sm }}>
              <T variant="body">{why.text}</T>
              <T variant="caption" tone="tertiary">
                Based on: {why.sources.join(' · ')}
              </T>
            </Card>
          </Section>
        ) : null}

        {/* next event */}
        {next ? (
          <Section title="Next">
            <Card
              onPress={() => router.push(`/event/${next.id}`)}
              accessibilityLabel={`Open ${next.title}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="bodyStrong">{next.title}</T>
                <T variant="caption" tone="tertiary">
                  {next.subtitle}
                </T>
              </View>
              {next.status === 'live' ? <LiveDot /> : <T tone="secondary">{relativeTime(next.startsAt, now)}</T>}
              <Icon name="chevron-right" size={18} color={theme.colors.textTertiary} />
            </Card>
          </Section>
        ) : null}

        {/* one community prediction */}
        {question ? (
          <Section title="Community pick">
            <Card>
              <QuestionCard question={question} />
            </Card>
          </Section>
        ) : null}

        {/* discussion entry — only when there's a structured event to attach to */}
        {next ? (
          <Press
            onPress={() => router.push(`/event/${next.id}`)}
            accessibilityLabel={`Discussion: ${next.discussionCount} comments`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm, paddingVertical: theme.space.sm }}
          >
            <Icon name="message-circle" size={18} />
            <T tone="secondary">
              {formatCount(next.discussionCount)} talking about {next.title}
            </T>
            <View style={{ flex: 1 }} />
            <T variant="bodyStrong" tone="accent">
              Join
            </T>
          </Press>
        ) : null}

        <T variant="caption" tone="tertiary">
          Information only — not investment advice.
        </T>
      </Screen>
    </>
  );
}
