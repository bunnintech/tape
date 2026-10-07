import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import EventScreen from '@/features/event/EventScreen';
import HomeScreen from '@/features/home/HomeScreen';
import PicksScreen from '@/features/picks/PicksScreen';
import YouScreen from '@/features/you/YouScreen';
import { StoreProvider } from '@/state/store';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  Stack: { Screen: () => null },
}));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

async function wrap(ui: ReactElement) {
  return await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <StoreProvider>{ui}</StoreProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('Home', () => {
  it('shows scoreboard, movers with a why, and later events — no feed', async () => {
    await wrap(<HomeScreen />);
    expect(screen.getByText('S&P 500')).toBeTruthy();
    expect(screen.getByText('Nasdaq')).toBeTruthy();
    expect(screen.getAllByText('Bitcoin').length).toBeGreaterThan(0);
    expect(screen.getByText('Moving')).toBeTruthy();
    expect(screen.getByText(/Army software contract/)).toBeTruthy();
    expect(screen.getByText('Later')).toBeTruthy();
    expect(screen.getByText('NVIDIA earnings')).toBeTruthy();
  });
});

describe('Picks', () => {
  it('hides the crowd split until the user picks, then reveals it', async () => {
    await wrap(<PicksScreen />);
    expect(screen.getByText('Will NVDA finish green tomorrow?')).toBeTruthy();
    expect(screen.queryByText('74%')).toBeNull();
    expect(screen.getByText('Crowd split shows after you pick')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Green'));

    expect(screen.getByText('74%')).toBeTruthy();
    expect(screen.getByText('26%')).toBeTruthy();
  });

  it('completes all five picks and shows a summary', async () => {
    await wrap(<PicksScreen />);
    const answers = ['Green', 'No', 'AMD', 'Yes', 'No'];
    for (const label of answers) {
      await fireEvent.press(screen.getByLabelText(label));
      await act(async () => {
        jest.advanceTimersByTime(1400);
      });
    }
    expect(screen.getByText('5 picks locked in')).toBeTruthy();
    expect(screen.getByText(/contrarian/)).toBeTruthy();
  });
});

describe('You', () => {
  it('shows rating, record, streak and expertise', async () => {
    await wrap(<YouScreen />);
    expect(screen.getByText('Market Rating')).toBeTruthy();
    expect(screen.getByText('Record')).toBeTruthy();
    expect(screen.getByText('Streak')).toBeTruthy();
    expect(screen.getByText('Best at')).toBeTruthy();
    expect(screen.getByText('Company expertise')).toBeTruthy();
  });
});

describe('Event discussion stickers', () => {
  it('sends a sticker from the tray into the discussion', async () => {
    await wrap(<EventScreen eventId="ev-nvda-q3" />);
    expect(screen.queryByLabelText('Send Pain sticker')).toBeNull();
    expect(screen.queryByLabelText('Pain sticker')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Stickers'));
    await fireEvent.press(screen.getByLabelText('Send Pain sticker'));

    expect(screen.getByLabelText('Pain sticker')).toBeTruthy();
    expect(screen.getByText('You')).toBeTruthy();
    // Tray closes after sending.
    expect(screen.queryByLabelText('Send Pain sticker')).toBeNull();
  });
});
