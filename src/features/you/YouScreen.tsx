import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Divider, Icon, Press, Screen, Section, T } from '@/components/primitives';
import { TopBar } from '@/components/TopBar';
import { env } from '@/config/env';
import { demoUser } from '@/data/fixtures/profile';
import { dataSource } from '@/data/source';
import type { ExpertiseScore } from '@/data/types';
import { relativeTime } from '@/domain/format';
import { categoryExpertise, companyExpertise, PROVISIONAL_PICKS, ratingSnapshot, topLabel } from '@/domain/rating';
import { selectSettledPicks, useNow, useStore } from '@/state/store';
import { useTheme } from '@/theme';

export default function YouScreen() {
  const theme = useTheme();
  const now = useNow(60_000);
  const { state, settleDemo, reset } = useStore();
  const settled = selectSettledPicks(state);
  const snap = ratingSnapshot(settled);
  const categories = categoryExpertise(settled).slice(0, 4);
  const companies = companyExpertise(settled, (id) => dataSource.getAsset(id)?.symbol ?? id).slice(0, 4);
  const recent = [...settled].sort((a, b) => b.settledAt.localeCompare(a.settledAt)).slice(0, 5);
  const pending = Object.keys(state.picks).filter((id) => !state.settlements.some((s) => s.questionId === id)).length;
  const provisional = settled.length < PROVISIONAL_PICKS;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar title="You" />
      <Screen>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <T variant="headline" tone="accent">
              {demoUser.displayName[0]}
            </T>
          </View>
          <View>
            <T variant="bodyStrong">{demoUser.displayName}</T>
            <T variant="caption" tone="tertiary">
              @{demoUser.handle} · {state.follows.length} following
            </T>
          </View>
        </View>

        {/* the one number */}
        <Card style={{ gap: theme.space.lg, padding: theme.space.xl }}>
          <View style={{ gap: theme.space.xs }}>
            <T variant="label" tone="tertiary">
              Market Rating
            </T>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.space.md }}>
              <T variant="display" numeric accessibilityLabel={`Market rating ${snap.rating}`}>
                {snap.rating}
              </T>
              <T variant="headline" tone="accent">
                {provisional ? 'Provisional' : topLabel(snap.percentile)}
              </T>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Stat label="Record" value={`${snap.wins}–${snap.losses}`} />
            <Stat label="Streak" value={`${snap.streak}`} suffix={snap.streak === 1 ? 'win' : 'wins'} />
            <Stat label="Best" value={`${snap.bestStreak}`} />
          </View>
          {pending ? (
            <Press onPress={() => router.push('/picks')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="clock" size={14} color={theme.colors.textTertiary} />
              <T variant="caption" tone="tertiary">
                {pending} {pending === 1 ? 'pick' : 'picks'} waiting to settle
              </T>
            </Press>
          ) : null}
        </Card>

        <Section title="Best at">
          <Card style={{ paddingVertical: theme.space.xs }}>
            {categories.map((e, i) => (
              <View key={e.key}>
                {i > 0 ? <Divider /> : null}
                <ExpertiseRow e={e} />
              </View>
            ))}
          </Card>
        </Section>

        <Section title="Company expertise">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
            {companies.map((e) => (
              <Press
                key={e.key}
                onPress={() => router.push(`/company/${e.key}`)}
                style={{
                  flexBasis: '45%',
                  flexGrow: 1,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.space.md,
                  paddingVertical: theme.space.sm,
                  gap: 2,
                }}
              >
                <T variant="bodyStrong">{e.label}</T>
                <T variant="caption" tone={e.percentile >= 90 ? 'accent' : 'secondary'}>
                  {topLabel(e.percentile)} · {e.picks} picks
                </T>
              </Press>
            ))}
          </View>
        </Section>

        <Section title="Recent calls">
          <Card style={{ paddingVertical: theme.space.xs }}>
            {recent.map((p, i) => (
              <View key={p.questionId}>
                {i > 0 ? <Divider /> : null}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.space.md,
                    paddingVertical: theme.space.md,
                  }}
                >
                  <Icon
                    name={p.correct ? 'check-circle' : 'x-circle'}
                    size={20}
                    color={p.correct ? theme.colors.up : theme.colors.down}
                  />
                  <View style={{ flex: 1 }}>
                    <T variant="callout">{p.prompt}</T>
                    <T variant="caption" tone="tertiary">
                      {relativeTime(p.settledAt, now)}
                      {p.correct && p.crowdShareAtPick < 0.4 ? ' · contrarian win' : ''}
                    </T>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </Section>

        <T variant="caption" tone="tertiary">
          Your rating rewards being right, especially when the crowd isn’t. It’s a game score, not investment
          performance.
        </T>

        {env.demoMode ? (
          <View
            style={{
              gap: theme.space.md,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              padding: theme.space.lg,
            }}
          >
            <T variant="label" tone="tertiary">
              Demo controls
            </T>
            <T variant="callout" tone="secondary">
              Settle open picks with sample outcomes, or reset the prototype to a fresh state.
            </T>
            <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap' }}>
              <Button
                label="Simulate settlement"
                kind="secondary"
                icon="fast-forward"
                onPress={settleDemo}
                disabled={!pending}
              />
              <Button label="Reset demo" kind="secondary" icon="rotate-ccw" onPress={reset} />
            </View>
          </View>
        ) : null}
      </Screen>
    </View>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <T variant="caption" tone="tertiary">
        {label}
      </T>
      <T variant="headline" numeric>
        {value}
        {suffix ? (
          <T variant="callout" tone="tertiary">
            {' '}
            {suffix}
          </T>
        ) : null}
      </T>
    </View>
  );
}

function ExpertiseRow({ e }: { e: ExpertiseScore }) {
  const theme = useTheme();
  const fill = Math.max(4, Math.min(100, e.percentile));
  return (
    <View style={{ paddingVertical: theme.space.md, gap: theme.space.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <T variant="bodyStrong">{e.label}</T>
        <T variant="callout" tone={e.percentile >= 90 ? 'accent' : 'secondary'}>
          {topLabel(e.percentile)}
        </T>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.border, overflow: 'hidden' }}>
        <View style={{ width: `${fill}%`, height: '100%', backgroundColor: theme.colors.accent, borderRadius: 3 }} />
      </View>
    </View>
  );
}
