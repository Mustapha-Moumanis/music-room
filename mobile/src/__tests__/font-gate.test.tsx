/* eslint-disable import/first -- component import intentionally follows hoisted font mocks */
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

const mockUseFonts = jest.fn();
jest.mock('@expo-google-fonts/sora', () => ({
  Sora_400Regular: 400,
  Sora_600SemiBold: 600,
  Sora_700Bold: 700,
  Sora_800ExtraBold: 800,
  useFonts: () => mockUseFonts(),
}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => undefined),
  hideAsync: jest.fn(async () => undefined),
}));

import { AppFontGate } from '../components/app-font-gate';

const splashScreenMock = jest.requireMock('expo-splash-screen') as {
  preventAutoHideAsync: jest.Mock<Promise<undefined>, []>;
  hideAsync: jest.Mock<Promise<undefined>, []>;
};
const { preventAutoHideAsync: mockPreventAutoHideAsync, hideAsync: mockHideAsync } = splashScreenMock;

beforeEach(() => {
  mockUseFonts.mockReset();
  mockHideAsync.mockClear();
});

it('holds the splash and children while fonts are pending, then hides and renders after success', async () => {
  expect(mockPreventAutoHideAsync).toHaveBeenCalledTimes(1);
  mockUseFonts.mockReturnValue([false, null]);
  const result = await render(<AppFontGate><Text>Ready</Text></AppFontGate>);
  expect(screen.queryByText('Ready')).toBeNull();
  expect(mockHideAsync).not.toHaveBeenCalled();

  mockUseFonts.mockReturnValue([true, null]);
  await result.rerender(<AppFontGate><Text>Ready</Text></AppFontGate>);
  expect(screen.getByText('Ready')).toBeTruthy();
  expect(mockHideAsync).toHaveBeenCalledTimes(1);
});

it('does not leave the splash stuck when font loading fails', async () => {
  mockUseFonts.mockReturnValue([false, new Error('font failure')]);
  await render(<AppFontGate><Text>Fallback</Text></AppFontGate>);
  expect(screen.getByText('Fallback')).toBeTruthy();
  expect(mockHideAsync).toHaveBeenCalledTimes(1);
});
