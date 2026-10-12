/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, push: mockPush, replace: mockReplace }) }));

import {
  AddTrackScreen,
  DiscoverPlaylistsScreen,
  OwnerPlaylistEditorScreen,
  PlaylistDetailsScreen,
  PlaylistMembersScreen,
} from '../features/playlists/playlist-screens';

beforeEach(() => jest.clearAllMocks());

it('opens a featured playlist from discovery', () => {
  render(<DiscoverPlaylistsScreen />);
  expect(screen.queryByLabelText('Go back')).toBeNull();
  fireEvent.press(screen.getByText('Add playlist'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/create');
  fireEvent.press(screen.getByText('My playlists'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/mine');
  fireEvent.press(screen.getByText('Friends Tape'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/read-only');
});

it('opens playback and the owner editor from playlist details', () => {
  render(<PlaylistDetailsScreen />);
  fireEvent.press(screen.getByLabelText('Go back'));
  expect(mockReplace).toHaveBeenCalledWith('/playlists');
  fireEvent.press(screen.getByText('Play'));
  expect(mockPush).toHaveBeenCalledWith('/player');
  fireEvent.press(screen.getByText('Edit'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/edit');
  fireEvent.press(screen.getByLabelText('Play Better Off Alone'));
  expect(mockPush).toHaveBeenCalledWith('/player');
});

it('supports editor tools, reorder, and remove actions', () => {
  render(<OwnerPlaylistEditorScreen />);
  fireEvent.press(screen.getByText('Add track'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/add-track');
  fireEvent(screen.getByLabelText('Reorder Better Off Alone'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
  fireEvent.press(screen.getByLabelText('Remove Better Off Alone'));
  expect(screen.queryByLabelText('Reorder Better Off Alone')).toBeNull();
});

it('adds a search result and invites a member locally', () => {
  const add = render(<AddTrackScreen />);
  expect(screen.getByText('Already added')).toBeTruthy();
  fireEvent.press(screen.getAllByRole('checkbox')[1]);
  expect(screen.getByText('Added')).toBeTruthy();
  add.unmount();

  render(<PlaylistMembersScreen />);
  fireEvent.press(screen.getByText('Sara Benali'));
  expect(screen.getAllByText('Invited').length).toBeGreaterThanOrEqual(2);
});
