/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, push: mockPush, replace: mockReplace }) }));

import { ErrorRetryScreen, FullPlayerScreen, HomeScreen, OfflineScreen } from '../features/system/system-screens';

beforeEach(() => jest.clearAllMocks());

it('opens playlist radio from the home recommendation', () => {
  render(<HomeScreen />);
  fireEvent.press(screen.getByText('Analog After Dark'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/radio');
});

it('updates the full player favorite state', () => {
  render(<FullPlayerScreen />);
  fireEvent.press(screen.getByText('Favorite'));
  expect(screen.getByText('Favorited')).toBeTruthy();
});

it('shows retry progress for error and offline states', () => {
  const error = render(<ErrorRetryScreen />);
  fireEvent.press(screen.getByText('Retry'));
  expect(screen.getByText('Retrying…')).toBeTruthy();
  error.unmount();

  render(<OfflineScreen />);
  fireEvent.press(screen.getByText('Try again'));
  expect(screen.getByText('Trying again…')).toBeTruthy();
});
