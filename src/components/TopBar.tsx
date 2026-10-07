import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { DemoBadge, Icon, Press, T } from './primitives';

/** Tab-screen header: title on the left, Search as the top-level action. */
export function TopBar({ title, wordmark }: { title: string; wordmark?: boolean }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + theme.space.sm,
        paddingHorizontal: theme.space.lg,
        paddingBottom: theme.space.sm,
        backgroundColor: theme.colors.bg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
        {wordmark ? (
          <T variant="title" style={{ letterSpacing: -1, fontWeight: '800' }} accessibilityRole="header">
            tape
            <T variant="title" tone="accent" style={{ fontWeight: '800' }}>
              .
            </T>
          </T>
        ) : (
          <T variant="title" accessibilityRole="header">
            {title}
          </T>
        )}
        <DemoBadge />
      </View>
      <Press
        onPress={() => router.push('/search')}
        accessibilityLabel="Search"
        hitSlop={12}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surface,
        }}
      >
        <Icon name="search" size={20} color={theme.colors.text} />
      </Press>
    </View>
  );
}
