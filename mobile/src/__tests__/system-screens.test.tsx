/* eslint-disable import/first -- feature imports intentionally follow hoisted router mocks */
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => false);
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, canGoBack: mockCanGoBack, push: mockPush, replace: mockReplace }) }));

import { ErrorRetryScreen, FullPlayerScreen, HomeScreen, NotificationsScreen, OfflineScreen } from '../features/system/system-screens';

beforeEach(() => jest.clearAllMocks());

it('opens Now Playing from the home recommendation', async () => {
  await render(<HomeScreen />);
  await fireEvent.press(screen.getByText('Analog After Dark'));
  expect(mockPush).toHaveBeenCalledWith('/player');
});

it('opens Recently played playlists', async () => {
  await render(<HomeScreen />);
  await fireEvent.press(screen.getByLabelText('Open Late Nights'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/details');
  await fireEvent.press(screen.getByLabelText('Open Friends Tape'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/read-only');
});

it('opens account actions from the Home avatar and navigates to profile', async () => {
  await render(<HomeScreen />);

  await fireEvent.press(screen.getByLabelText('Open account menu'));

  expect(screen.getByTestId('header-overflow-menu')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('header-overflow-profile'));
  expect(mockPush).toHaveBeenCalledWith('/profile');
});

it('updates the full player favorite state', async () => {
  await render(<FullPlayerScreen />);
  await fireEvent.press(screen.getByLabelText('Pause'));
  expect(screen.getByLabelText('Play')).toBeTruthy();
  await fireEvent.press(screen.getByText('Favorite'));
  expect(screen.getByText('Favorited')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Next track'));
  expect(screen.getByText('Night Drive')).toBeTruthy();
  await fireEvent.press(screen.getByText('Queue'));
  expect(screen.getByText('Up next')).toBeTruthy();
  await fireEvent.press(screen.getByText('Playlist'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/details');
});

it('closes a directly opened player to Home and opens header settings', async () => {
  await render(<FullPlayerScreen />);

  await fireEvent.press(screen.getByLabelText('Close player'));
  expect(mockReplace).toHaveBeenCalledWith('/home');
  await fireEvent.press(screen.getByLabelText('Open account menu'));
  await fireEvent.press(screen.getByTestId('header-overflow-settings'));
  expect(mockPush).toHaveBeenCalledWith('/settings');
});

it('opens the destination represented by a notification', async () => {
  await render(<NotificationsScreen />);

  await fireEvent.press(screen.getByText('Nada invited you to Friends Tape'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/collaborate');
});

it('shows retry progress for error and offline states', async () => {
  const error = await render(<ErrorRetryScreen />);
  await fireEvent.press(screen.getByText('Retry'));
  expect(screen.getByText('Retrying…')).toBeTruthy();
  await error.unmount();

  await render(<OfflineScreen />);
  await fireEvent.press(screen.getByText('Try again'));
  expect(screen.getByText('Trying again…')).toBeTruthy();
});
