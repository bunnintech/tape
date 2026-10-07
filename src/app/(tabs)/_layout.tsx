import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dataSource } from '@/data/source';
import { useNow, useStore } from '@/state/store';
import { useTheme } from '@/theme';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const now = useNow(30_000);
  const openDaily = dataSource
    .dailyQuestionIds()
    .filter((id) => !state.picks[id] && Date.parse(dataSource.getQuestion(id)!.locksAt) > now).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.bg,
          borderTopColor: theme.colors.border,
          height: 72 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 10),
        },
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="live"
        options={{ title: 'Live', tabBarIcon: ({ color }) => <Feather name="radio" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="picks"
        options={{
          title: 'Picks',
          tabBarIcon: ({ color }) => <Feather name="target" size={22} color={color} />,
          tabBarBadge: openDaily > 0 ? openDaily : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.colors.accent, color: theme.colors.onAccent, fontSize: 11 },
        }}
      />
      <Tabs.Screen
        name="you"
        options={{ title: 'You', tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} /> }}
      />
    </Tabs>
  );
}
