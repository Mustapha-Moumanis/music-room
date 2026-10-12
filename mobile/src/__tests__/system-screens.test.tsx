/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => false);
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, canGoBack: mockCanGoBack, push: mockPush, replace: mockReplace }) }));

import { ErrorRetryScreen, FullPlayerScreen, HomeScreen, NotificationsScreen, OfflineScreen } from '../features/system/system-screens';

beforeEach(() => jest.clearAllMocks());

it('opens Now Playing from the home recommendation', () => {
  render(<HomeScreen />);
  fireEvent.press(screen.getByText('Analog After Dark'));
  expect(mockPush).toHaveBeenCalledWith('/player');
});

it('opens Recently played playlists', () => {
  render(<HomeScreen />);
  fireEvent.press(screen.getByLabelText('Open Late Nights'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/details');
  fireEvent.press(screen.getByLabelText('Open Friends Tape'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/read-only');
});

it('opens account actions from the Home avatar and navigates to profile', () => {
  render(<HomeScreen />);

  fireEvent.press(screen.getByLabelText('Open account menu'));

  expect(screen.getByTestId('header-overflow-menu')).toBeTruthy();
  fireEvent.press(screen.getByText('Profile'));
  expect(mockPush).toHaveBeenCalledWith('/profile');
});

it('updates the full player favorite state', () => {
  render(<FullPlayerScreen />);
  fireEvent.press(screen.getByLabelText('Pause'));
  expect(screen.getByLabelText('Play')).toBeTruthy();
  fireEvent.press(screen.getByText('Favorite'));
  expect(screen.getByText('Favorited')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Next track'));
  expect(screen.getByText('Night Drive')).toBeTruthy();
  fireEvent.press(screen.getByText('Queue'));
  expect(screen.getByText('Up next')).toBeTruthy();
  fireEvent.press(screen.getByText('Playlist'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/details');
});

it('closes a directly opened player to Home and opens header settings', () => {
  render(<FullPlayerScreen />);

  fireEvent.press(screen.getByLabelText('Close player'));
  expect(mockReplace).toHaveBeenCalledWith('/home');
  fireEvent.press(screen.getByLabelText('Open account menu'));
  fireEvent.press(screen.getByText('Settings'));
  expect(mockPush).toHaveBeenCalledWith('/settings');
});

it('opens the destination represented by a notification', () => {
  render(<NotificationsScreen />);

  fireEvent.press(screen.getByText('Nada invited you to Friends Tape'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/collaborate');
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
