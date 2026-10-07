import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Divider, Icon, Press, Screen, Section, T } from '@/components/primitives';
import { QuestionCard } from '@/components/QuestionCard';
import { TopBar } from '@/components/TopBar';
import { env } from '@/config/env';
import { dataSource } from '@/data/source';
import { countdown, formatShare } from '@/domain/format';
import { useNow, useStore } from '@/state/store';
import { useTheme } from '@/theme';

const ADVANCE_MS = 1300;

/**
 * Five daily one-tap picks, one at a time. Consensus is revealed only after
 * each pick, then the next card arrives automatically (target: 5 picks < 30s).
 */
export default function PicksScreen() {
  const theme = useTheme();
  const { state } = useStore();
  const ids = dataSource.dailyQuestionIds();
  const firstOpen = ids.findIndex((id) => !state.picks[id]);
  const [index, setIndex] = useState(firstOpen === -1 ? ids.length : firstOpen);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const advance = () => {
    if (timer.current) clearTimeout(timer.current);
    const next = ids.findIndex((id, i) => i > index && !state.picks[id]);
    setIndex(next === -1 ? ids.length : next);
  };

  const onPicked = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIndex((i) => {
        const next = ids.findIndex((id, j) => j > i && !state.picks[id]);
        return next === -1 ? ids.length : next;
      });
    }, ADVANCE_MS);
  };

  const done = index >= ids.length;
  const q = done ? null : dataSource.getQuestion(ids[index])!;
  const answered = ids.filter((id) => state.picks[id]).length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar title="Picks" />
      <Screen contentStyle={{ flexGrow: 1 }}>
        <View style={{ gap: theme.space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T variant="bodyStrong">Tomorrow’s five</T>
            <T variant="callout" tone="secondary" numeric>
              {answered}/{ids.length}
            </T>
          </View>
          <Progress ids={ids} index={index} />
        </View>

        {q ? (
          // Sit the question in the optical middle of the screen instead of leaving a blank lower half.
          <View style={{ flex: 1, justifyContent: 'center', gap: theme.space.xxl, paddingBottom: theme.space.xxxl }}>
            <Card style={{ padding: theme.space.xl }}>
              <QuestionCard key={q.id} question={q} size="lg" onPicked={onPicked} />
            </Card>
            {state.picks[q.id] ? (
              <Button
                label={index === ids.length - 1 ? 'See summary' : 'Next pick'}
                icon="arrow-right"
                kind="secondary"
                onPress={advance}
              />
            ) : (
              <Press
                onPress={advance}
                style={{ alignSelf: 'center', padding: theme.space.sm }}
                accessibilityLabel="Skip this pick"
              >
                <T variant="callout" tone="tertiary">
                  Skip for now
                </T>
              </Press>
            )}
          </View>
        ) : (
          <Summary ids={ids} onRevisit={(i) => setIndex(i)} />
        )}
      </Screen>
    </View>
  );
}

function Progress({ ids, index }: { ids: string[]; index: number }) {
  const theme = useTheme();
  const { state } = useStore();
  return (
    <View
      style={{ flexDirection: 'row', gap: 6 }}
      accessibilityLabel={`Question ${Math.min(index + 1, ids.length)} of ${ids.length}`}
    >
      {ids.map((id, i) => (
        <View
          key={id}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: state.picks[id]
              ? theme.colors.accent
              : i === index
                ? theme.colors.textSecondary
                : theme.colors.border,
          }}
        />
      ))}
    </View>
  );
}

function Summary({ ids, onRevisit }: { ids: string[]; onRevisit: (i: number) => void }) {
  const theme = useTheme();
  const now = useNow();
  const { state, settleDemo, settlementFor } = useStore();
  const answered = ids.filter((id) => state.picks[id]);
  const skipped = ids.findIndex((id) => !state.picks[id]);
  const contrarian = answered.filter((id) => state.picks[id].crowdShareAtPick < 0.4).length;
  const settled = answered.filter((id) => settlementFor(id));
  const wins = settled.filter((id) => settlementFor(id)!.winningChoiceId === state.picks[id].choiceId).length;
  const firstSettle = ids.map((id) => dataSource.getQuestion(id)!.settlesAt).sort()[0];
  const liveQ = dataSource
    .listQuestions()
    .find((q) => q.type === 'live-event' && Date.parse(q.locksAt) > now && !state.picks[q.id]);

  return (
    <View style={{ gap: theme.space.xxl }}>
      <View style={{ gap: theme.space.sm }}>
        <T variant="title">
          {settled.length ? `${wins} of ${settled.length} right` : `${answered.length} picks locked in`}
        </T>
        <T tone="secondary">
          {settled.length
            ? 'Your rating and streak have been updated.'
            : contrarian
              ? `${contrarian} contrarian ${contrarian === 1 ? 'call' : 'calls'} — those count for more if you’re right.`
              : 'You’re with the crowd today. Safe — but contrarian calls earn more.'}
        </T>
        {!settled.length ? (
          <T variant="callout" tone="tertiary" numeric>
            First results in {countdown(firstSettle, now)}
          </T>
        ) : null}
      </View>

      <Card style={{ paddingVertical: theme.space.xs }}>
        {ids.map((id, i) => {
          const q = dataSource.getQuestion(id)!;
          const p = state.picks[id];
          const s = settlementFor(id);
          const right = s && p ? s.winningChoiceId === p.choiceId : undefined;
          return (
            <View key={id}>
              {i > 0 ? <Divider /> : null}
              <Press
                disabled={!!p}
                onPress={() => onRevisit(i)}
                style={{
                  paddingVertical: theme.space.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.space.md,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="callout">{q.prompt}</T>
                  <T variant="caption" tone="tertiary">
                    {p
                      ? `You: ${q.choices.find((c) => c.id === p.choiceId)?.label} · ${formatShare(p.crowdShareAtPick)} agreed`
                      : 'Skipped — tap to pick'}
                  </T>
                </View>
                {right === undefined ? null : (
                  <Icon
                    name={right ? 'check-circle' : 'x-circle'}
                    size={20}
                    color={right ? theme.colors.up : theme.colors.down}
                  />
                )}
              </Press>
            </View>
          );
        })}
      </Card>

      {skipped !== -1 ? <Button label="Finish your picks" onPress={() => onRevisit(skipped)} /> : null}

      {liveQ ? (
        <Section title="Live pick open">
          <Card style={{ borderColor: theme.colors.accent }}>
            <QuestionCard question={liveQ} />
          </Card>
        </Section>
      ) : null}

      {env.demoMode && answered.length > 0 && settled.length < answered.length ? (
        <View
          style={{
            gap: theme.space.sm,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            padding: theme.space.lg,
          }}
        >
          <T variant="label" tone="tertiary">
            Demo only
          </T>
          <T variant="callout" tone="secondary">
            Skip ahead to tomorrow’s close and settle these picks with sample outcomes.
          </T>
          <Button
            label="Simulate settlement"
            kind="secondary"
            icon="fast-forward"
            onPress={() => {
              settleDemo();
              router.push('/you');
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
