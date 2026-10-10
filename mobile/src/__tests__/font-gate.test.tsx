import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

const mockUseFonts = jest.fn();
const mockPreventAutoHideAsync = jest.fn(async () => undefined);
const mockHideAsync = jest.fn(async () => undefined);

jest.mock('@expo-google-fonts/sora', () => ({
  Sora_400Regular: 400,
  Sora_600SemiBold: 600,
  Sora_700Bold: 700,
  Sora_800ExtraBold: 800,
  useFonts: () => mockUseFonts(),
}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: () => mockPreventAutoHideAsync(),
  hideAsync: () => mockHideAsync(),
}));

import { AppFontGate } from '../components/app-font-gate';

beforeEach(() => {
  mockUseFonts.mockReset();
  mockHideAsync.mockClear();
});

it('holds the splash and children while fonts are pending, then hides and renders after success', () => {
  expect(mockPreventAutoHideAsync).toHaveBeenCalledTimes(1);
  mockUseFonts.mockReturnValue([false, null]);
  const result = render(<AppFontGate><Text>Ready</Text></AppFontGate>);
  expect(screen.queryByText('Ready')).toBeNull();
  expect(mockHideAsync).not.toHaveBeenCalled();

  mockUseFonts.mockReturnValue([true, null]);
  result.rerender(<AppFontGate><Text>Ready</Text></AppFontGate>);
  expect(screen.getByText('Ready')).toBeTruthy();
  expect(mockHideAsync).toHaveBeenCalledTimes(1);
});

it('does not leave the splash stuck when font loading fails', () => {
  mockUseFonts.mockReturnValue([false, new Error('font failure')]);
  render(<AppFontGate><Text>Fallback</Text></AppFontGate>);
  expect(screen.getByText('Fallback')).toBeTruthy();
  expect(mockHideAsync).toHaveBeenCalledTimes(1);
});
