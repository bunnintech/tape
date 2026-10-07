import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import type { PredictionChoice, PredictionQuestion } from '@/data/types';
import { countdown, formatCount, formatShare, relativeTime } from '@/domain/format';
import { crowdRelation, questionState, visibleCrowd } from '@/domain/picks';
import { useNow, useStore } from '@/state/store';
import { useTheme } from '@/theme';

import { Icon, Press, T } from './primitives';

type Props = {
  question: PredictionQuestion;
  size?: 'md' | 'lg';
  onPicked?: (choiceId: string) => void;
  showFooter?: boolean;
};

/**
 * One prediction. Enforces the core rule in the UI: the crowd split is not
 * rendered until the user has picked (or picking is closed).
 */
export function QuestionCard({ question: q, size = 'md', onPicked, showFooter = true }: Props) {
  const theme = useTheme();
  const now = useNow();
  const { state, pick, settlementFor } = useStore();
  const [showRule, setShowRule] = useState(false);

  const myPick = state.picks[q.id];
  const settlement = settlementFor(q.id);
  const status = questionState(q, now, settlement);
  const crowd = visibleCrowd(q, myPick, now, settlement);
  const lg = size === 'lg';

  const choose = (choice: PredictionChoice) => {
    if (myPick || status !== 'open') return;
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    pick(q.id, choice.id);
    onPicked?.(choice.id);
  };

  const lockMs = Date.parse(q.locksAt) - now;
  const lockSoon = lockMs > 0 && lockMs < 15 * 60_000;

  return (
    <View style={{ gap: lg ? theme.space.xl : theme.space.lg }}>
      {/* status line */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <StatusLine status={status} lockSoon={lockSoon} locksAt={q.locksAt} settlesAt={q.settlesAt} now={now} />
        {!crowd ? (
          <T variant="caption" tone="tertiary">
            {formatCount(q.crowdCount)} picks
          </T>
        ) : null}
      </View>

      <View style={{ gap: theme.space.xs }}>
        <T variant={lg ? 'title' : 'headline'}>{q.prompt}</T>
        {q.context ? (
          <T variant="callout" tone="secondary">
            {q.context}
          </T>
        ) : null}
      </View>

      {/* choices */}
      <View style={{ flexDirection: 'row', gap: theme.space.md }}>
        {q.choices.map((c) => (
          <ChoiceButton
            key={c.id}
            choice={c}
            lg={lg}
            selected={myPick?.choiceId === c.id}
            winner={settlement?.winningChoiceId === c.id}
            share={crowd?.[c.id]}
            disabled={!!myPick || status !== 'open'}
            onPress={() => choose(c)}
          />
        ))}
      </View>

      {/* after-pick feedback */}
      <ResultLine
        q={q}
        myChoice={myPick?.choiceId}
        share={myPick?.crowdShareAtPick}
        winning={settlement?.winningChoiceId}
        status={status}
      />

      {showFooter ? (
        <View style={{ gap: theme.space.sm }}>
          <Press
            onPress={() => setShowRule((v) => !v)}
            accessibilityLabel="How this settles"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 }}
          >
            <Icon name={showRule ? 'chevron-down' : 'chevron-right'} size={16} color={theme.colors.textTertiary} />
            <T variant="caption" tone="tertiary">
              How this settles
            </T>
          </Press>
          {showRule ? (
            <View style={{ gap: 2, paddingLeft: 22 }}>
              <T variant="caption" tone="secondary">
                {q.settlementRule}
              </T>
              <T variant="caption" tone="tertiary">
                Source: {q.settlementSource}
              </T>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function StatusLine({
  status,
  lockSoon,
  locksAt,
  settlesAt,
  now,
}: {
  status: string;
  lockSoon: boolean;
  locksAt: string;
  settlesAt: string;
  now: number;
}) {
  const theme = useTheme();
  if (status === 'settled') {
    return (
      <T variant="label" tone="tertiary">
        Settled
      </T>
    );
  }
  if (status === 'locked') {
    return (
      <T variant="label" tone="tertiary">
        Locked · settles {relativeTime(settlesAt, now)}
      </T>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name="clock" size={14} color={lockSoon ? theme.colors.accent : theme.colors.textTertiary} />
      <T variant="label" numeric tone={lockSoon ? 'accent' : 'tertiary'}>
        {lockSoon ? `Closes in ${countdown(locksAt, now)}` : `Locks ${relativeTime(locksAt, now)}`}
      </T>
    </View>
  );
}

function ChoiceButton({
  choice,
  lg,
  selected,
  winner,
  share,
  disabled,
  onPress,
}: {
  choice: PredictionChoice;
  lg: boolean;
  selected: boolean;
  winner: boolean;
  share?: number;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  // Green/Red choices carry market meaning; Yes/No and tickers stay neutral.
  const toneColor =
    choice.tone === 'up' ? theme.colors.up : choice.tone === 'down' ? theme.colors.down : theme.colors.text;
  const revealed = share !== undefined;
  // A faint tint makes Green/Red feel tappable. Dropped once the split is revealed so it can't be mistaken for it.
  const tint =
    revealed || !choice.tone || choice.tone === 'neutral'
      ? theme.colors.surfaceRaised
      : choice.tone === 'up'
        ? theme.colors.upSoft
        : theme.colors.downSoft;

  return (
    <Press
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={`${choice.label}${revealed ? `, ${formatShare(share!)} of picks` : ''}${selected ? ', your pick' : ''}`}
      accessibilityState={{ selected, disabled }}
      style={{
        flex: 1,
        minHeight: lg ? 92 : 64,
        borderRadius: theme.radius.md,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        backgroundColor: tint,
        overflow: 'hidden',
        justifyContent: 'center',
        paddingHorizontal: theme.space.lg,
      }}
    >
      {revealed ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.round(share! * 100)}%`,
            backgroundColor: selected ? theme.colors.accentSoft : theme.colors.border,
            opacity: selected ? 1 : 0.55,
          }}
        />
      ) : null}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: revealed ? 'space-between' : 'center' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {winner ? <Icon name="check" size={16} color={theme.colors.text} /> : null}
          <T variant={lg ? 'headline' : 'bodyStrong'} color={toneColor}>
            {choice.label}
          </T>
        </View>
        {revealed ? (
          <T variant={lg ? 'headline' : 'bodyStrong'} numeric>
            {formatShare(share!)}
          </T>
        ) : null}
      </View>
    </Press>
  );
}

function ResultLine({
  q,
  myChoice,
  share,
  winning,
  status,
}: {
  q: PredictionQuestion;
  myChoice?: string;
  share?: number;
  winning?: string;
  status: string;
}) {
  const theme = useTheme();
  if (winning && myChoice) {
    const right = myChoice === winning;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon
          name={right ? 'check-circle' : 'x-circle'}
          size={18}
          color={right ? theme.colors.up : theme.colors.down}
        />
        <T variant="bodyStrong" tone={right ? 'up' : 'down'}>
          {right ? 'You called it' : 'Missed this one'}
        </T>
      </View>
    );
  }
  if (winning) {
    const label = q.choices.find((c) => c.id === winning)?.label;
    return (
      <T variant="callout" tone="secondary">
        Result: {label}. You didn’t pick this one.
      </T>
    );
  }
  if (myChoice && share !== undefined) {
    return (
      <T variant="callout" tone="secondary">
        {crowdRelation(share).label}
      </T>
    );
  }
  if (status === 'locked') {
    return (
      <T variant="callout" tone="tertiary">
        Picks are closed.
      </T>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name="eye-off" size={14} color={theme.colors.textTertiary} />
      <T variant="caption" tone="tertiary">
        Crowd split shows after you pick
      </T>
    </View>
  );
}
