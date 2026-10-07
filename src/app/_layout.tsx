import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider } from '@/state/store';
import { useTheme } from '@/theme';

export default function RootLayout() {
  const theme = useTheme();
  const navTheme = theme.dark ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ThemeProvider
          value={{
            ...navTheme,
            colors: {
              ...navTheme.colors,
              background: theme.colors.bg,
              card: theme.colors.bg,
              text: theme.colors.text,
              border: theme.colors.border,
              primary: theme.colors.accent,
            },
          }}
        >
          <StatusBar style={theme.dark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerStyle: { backgroundColor: theme.colors.bg },
              headerTintColor: theme.colors.text,
              headerBackTitle: 'Back',
              contentStyle: { backgroundColor: theme.colors.bg },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="company/[ticker]" options={{ title: '' }} />
            <Stack.Screen name="event/[id]" options={{ title: '' }} />
            <Stack.Screen name="search" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
