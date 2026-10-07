import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Delta, Divider, Icon, Press, T } from '@/components/primitives';
import { dataSource } from '@/data/source';
import { useTheme } from '@/theme';

export default function SearchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = dataSource.listAssets();
    if (!term) return list;
    return list.filter((a) => a.symbol.toLowerCase().includes(term) || a.name.toLowerCase().includes(term));
  }, [q]);

  const events = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return dataSource.listEvents().filter((e) => e.title.toLowerCase().includes(term));
  }, [q]);

  const go = (path: `/company/${string}` | `/event/${string}`) => {
    router.back();
    router.push(path);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingTop: insets.top + theme.space.md }}>
      <View
        style={{
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
          paddingHorizontal: theme.space.lg,
          gap: theme.space.lg,
          flex: 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.sm,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.pill,
              paddingHorizontal: theme.space.lg,
              minHeight: 44,
            }}
          >
            <Icon name="search" size={18} />
            <TextInput
              autoFocus
              value={q}
              onChangeText={setQ}
              placeholder="Companies, crypto, events"
              placeholderTextColor={theme.colors.textTertiary}
              accessibilityLabel="Search"
              autoCapitalize="none"
              autoCorrect={false}
              style={{ flex: 1, color: theme.colors.text, fontSize: 16, paddingVertical: 10 }}
            />
          </View>
          <Press onPress={() => router.back()} accessibilityLabel="Cancel search">
            <T variant="bodyStrong" tone="accent">
              Cancel
            </T>
          </Press>
        </View>

        {events.map((e) => (
          <Press
            key={e.id}
            onPress={() => go(`/event/${e.id}`)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md, paddingVertical: theme.space.sm }}
          >
            <Icon name="radio" size={18} color={theme.colors.accent} />
            <T variant="bodyStrong">{e.title}</T>
          </Press>
        ))}

        <View>
          {results.map((a, i) => {
            const s = dataSource.getSnapshot(a.id);
            return (
              <View key={a.id}>
                {i > 0 ? <Divider /> : null}
                <Press
                  onPress={() => go(`/company/${a.id}`)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.space.md,
                    gap: theme.space.md,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <T variant="bodyStrong">{a.symbol}</T>
                    <T variant="caption" tone="tertiary">
                      {a.name}
                    </T>
                  </View>
                  {s ? <Delta pct={s.changePct} /> : null}
                </Press>
              </View>
            );
          })}
          {results.length === 0 && events.length === 0 ? (
            <T tone="secondary" style={{ paddingVertical: theme.space.lg }}>
              No match. Tape covers a focused set of companies to start.
            </T>
          ) : null}
        </View>
      </View>
    </View>
  );
}
