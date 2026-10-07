import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { Button, Card, DemoBadge, Divider, Icon, LiveDot, Press, Screen, Section, T } from '@/components/primitives';
import { QuestionCard } from '@/components/QuestionCard';
import { Sticker } from '@/components/Sticker';
import { dataSource } from '@/data/source';
import { STICKERS } from '@/data/stickers';
import type { EventUpdate, ExpectedVsActual, ReactionKey, StickerId } from '@/data/types';
import { clockTime, formatCount, relativeTime } from '@/domain/format';
import { useNow, useStore } from '@/state/store';
import { useTheme } from '@/theme';

const REACTIONS: { key: ReactionKey; glyph: string; label: string }[] = [
  { key: 'fire', glyph: '🔥', label: 'Big moment' },
  { key: 'eyes', glyph: '👀', label: 'Watching' },
  { key: 'up', glyph: '📈', label: 'Bullish' },
  { key: 'down', glyph: '📉', label: 'Bearish' },
];

export default function EventScreen({ eventId }: { eventId: string }) {
  const theme = useTheme();
  const now = useNow(30_000);
  const event = dataSource.getEvent(eventId);

  if (!event) {
    return (
      <Screen>
        <T variant="headline">Event not found.</T>
      </Screen>
    );
  }

  const questions = event.questionIds.map((id) => dataSource.getQuestion(id)!).filter(Boolean);
  const openQs = questions.filter((q) => Date.parse(q.locksAt) > now);
  const closedQs = questions.filter((q) => Date.parse(q.locksAt) <= now);

  return (
    <>
      <Stack.Screen options={{ title: '', headerRight: () => <DemoBadge /> }} />
      <Screen>
        {/* header */}
        <View style={{ gap: theme.space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
            {event.status === 'live' ? (
              <LiveDot />
            ) : (
              <T variant="label" tone="tertiary">
                {event.status === 'upcoming' ? `Starts ${relativeTime(event.startsAt, now)}` : 'Settled'}
              </T>
            )}
            <T variant="caption" tone="tertiary">
              {formatCount(event.watchers)} {event.status === 'live' ? 'watching' : 'following'}
            </T>
          </View>
          <T variant="title">{event.title}</T>
          <T tone="secondary">{event.subtitle}</T>
          <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap' }}>
            {event.assetIds.map((id) => (
              <Press
                key={id}
                onPress={() => router.push(`/company/${id}`)}
                style={{
                  paddingHorizontal: theme.space.md,
                  paddingVertical: 6,
                  borderRadius: theme.radius.pill,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <T variant="callout">{dataSource.getAsset(id)?.symbol ?? id}</T>
              </Press>
            ))}
          </View>
        </View>

        {/* live pick first — it's time-sensitive */}
        {openQs.map((q) => (
          <Card key={q.id} style={{ borderColor: theme.colors.accent }}>
            <QuestionCard question={q} />
          </Card>
        ))}

        <Section title={event.status === 'upcoming' ? 'What’s expected' : 'Actual vs expected'}>
          <Card style={{ paddingVertical: theme.space.xs }}>
            {event.metrics.map((m, i) => (
              <View key={m.id}>
                {i > 0 ? <Divider /> : null}
                <MetricRow m={m} />
              </View>
            ))}
          </Card>
        </Section>

        {event.updates.length ? (
          <Section title="Timeline">
            <View>
              {event.updates.map((u, i) => (
                <TimelineItem key={u.id} u={u} last={i === event.updates.length - 1} />
              ))}
            </View>
          </Section>
        ) : null}

        {closedQs.length ? (
          <Section title="Community calls">
            {closedQs.map((q) => (
              <Card key={q.id}>
                <QuestionCard question={q} />
              </Card>
            ))}
          </Section>
        ) : null}

        <Discussion eventId={event.id} count={event.discussionCount} />
      </Screen>
    </>
  );
}

function MetricRow({ m }: { m: ExpectedVsActual }) {
  const theme = useTheme();
  const tone = m.result === 'beat' ? 'up' : m.result === 'miss' ? 'down' : 'primary';
  return (
    <View style={{ paddingVertical: theme.space.md, gap: theme.space.sm }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.space.md }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="bodyStrong">{m.label}</T>
          <T variant="caption" tone="tertiary">
            {m.plain}
          </T>
        </View>
        {m.result ? (
          <T variant="label" tone={tone === 'primary' ? 'secondary' : tone}>
            {m.result === 'beat' ? 'Beat' : m.result === 'miss' ? 'Miss' : 'In line'}
          </T>
        ) : (
          <T variant="label" tone="tertiary">
            Pending
          </T>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: theme.space.xxl }}>
        <View>
          <T variant="caption" tone="tertiary">
            Actual
          </T>
          <T variant="headline" numeric tone={m.actual ? tone : 'tertiary'}>
            {m.actual ?? '—'}
          </T>
        </View>
        <View>
          <T variant="caption" tone="tertiary">
            Expected
          </T>
          <T variant="headline" numeric tone="secondary">
            {m.expected}
          </T>
        </View>
      </View>
    </View>
  );
}

function TimelineItem({ u, last }: { u: EventUpdate; last: boolean }) {
  const theme = useTheme();
  const { state, toggleReaction } = useStore();
  const mine = state.myReactions[u.id] ?? [];
  const dot =
    u.direction === 'up' ? theme.colors.up : u.direction === 'down' ? theme.colors.down : theme.colors.textTertiary;

  return (
    <View style={{ flexDirection: 'row', gap: theme.space.md }}>
      <View style={{ alignItems: 'center', width: 12 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot, marginTop: 6 }} />
        {!last ? <View style={{ flex: 1, width: 2, backgroundColor: theme.colors.border, marginTop: 4 }} /> : null}
      </View>
      <View style={{ flex: 1, gap: theme.space.xs, paddingBottom: theme.space.xl }}>
        <T variant="caption" tone="tertiary" numeric>
          {clockTime(u.at)}
        </T>
        <T variant="bodyStrong">{u.title}</T>
        {u.body ? (
          <T variant="callout" tone="secondary">
            {u.body}
          </T>
        ) : null}
        <View style={{ flexDirection: 'row', gap: theme.space.sm, marginTop: theme.space.xs, flexWrap: 'wrap' }}>
          {REACTIONS.map((r) => {
            const on = mine.includes(r.key);
            const count = u.reactions[r.key] + (on ? 1 : 0);
            return (
              <Press
                key={r.key}
                onPress={() => toggleReaction(u.id, r.key)}
                accessibilityLabel={`${r.label}, ${count}`}
                accessibilityState={{ selected: on }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: theme.radius.pill,
                  borderWidth: 1,
                  borderColor: on ? theme.colors.accent : theme.colors.border,
                  backgroundColor: on ? theme.colors.accentSoft : 'transparent',
                }}
              >
                <T variant="caption">{r.glyph}</T>
                <T variant="caption" numeric tone="secondary">
                  {formatCount(count)}
                </T>
              </Press>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function Discussion({ eventId, count }: { eventId: string; count: number }) {
  const theme = useTheme();
  const now = useNow(30_000);
  const { state, addComment } = useStore();
  const [draft, setDraft] = useState('');
  const [trayOpen, setTrayOpen] = useState(false);
  const comments = [...dataSource.listComments(eventId), ...state.myComments.filter((c) => c.eventId === eventId)];

  const submit = () => {
    if (!draft.trim()) return;
    addComment(eventId, draft);
    setDraft('');
  };

  const sendSticker = (id: StickerId) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    addComment(eventId, '', id);
    setTrayOpen(false);
  };

  return (
    <Section
      title={`Discussion · ${formatCount(count + state.myComments.filter((c) => c.eventId === eventId).length)}`}
    >
      <View style={{ gap: theme.space.lg }}>
        {comments.map((c) => (
          <View key={c.id} style={{ gap: 2 }}>
            <View style={{ flexDirection: 'row', gap: theme.space.sm, alignItems: 'center' }}>
              <T variant="bodyStrong" style={{ fontSize: 15 }}>
                {c.author === 'you' ? 'You' : `@${c.author}`}
              </T>
              {c.authorBadge ? (
                <T variant="caption" tone="accent">
                  {c.authorBadge}
                </T>
              ) : null}
              <T variant="caption" tone="tertiary">
                {relativeTime(c.at, now)}
              </T>
            </View>
            {c.stickerId ? <Sticker id={c.stickerId} size={104} /> : <T variant="callout">{c.body}</T>}
          </View>
        ))}
        {trayOpen ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: theme.space.sm,
              padding: theme.space.md,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            {STICKERS.map((st) => (
              <Press
                key={st.id}
                onPress={() => sendSticker(st.id)}
                accessibilityLabel={`Send ${st.label} sticker`}
                style={{ width: '25%', alignItems: 'center' }}
              >
                <Sticker id={st.id} size={72} />
              </Press>
            ))}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: theme.space.sm, alignItems: 'center' }}>
          <Press
            onPress={() => setTrayOpen((o) => !o)}
            accessibilityLabel={trayOpen ? 'Close stickers' : 'Stickers'}
            accessibilityState={{ expanded: trayOpen }}
            style={{
              width: 44,
              height: 44,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: trayOpen ? theme.colors.accent : theme.colors.border,
              backgroundColor: trayOpen ? theme.colors.accentSoft : 'transparent',
            }}
          >
            <Icon
              name={trayOpen ? 'x' : 'smile'}
              size={20}
              color={trayOpen ? theme.colors.accent : theme.colors.textSecondary}
            />
          </Press>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
            placeholder="Add to the conversation"
            placeholderTextColor={theme.colors.textTertiary}
            accessibilityLabel="Write a comment"
            maxLength={280}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 44,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.space.lg,
              color: theme.colors.text,
              fontSize: 16,
            }}
          />
          <Button label="Post" onPress={submit} disabled={!draft.trim()} />
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Icon name="award" size={14} color={theme.colors.textTertiary} />
          <T variant="caption" tone="tertiary">
            Badges show earned accuracy, not follower count.
          </T>
        </View>
      </View>
    </Section>
  );
}
