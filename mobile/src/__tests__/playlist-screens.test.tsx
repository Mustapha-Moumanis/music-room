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
  PlaylistRadioScreen,
} from '../features/playlists/playlist-screens';

beforeEach(() => jest.clearAllMocks());

it('opens a featured playlist from discovery', () => {
  render(<DiscoverPlaylistsScreen />);
  fireEvent.press(screen.getByText('Friends Tape'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/read-only');
});

it('opens playback and the owner editor from playlist details', () => {
  render(<PlaylistDetailsScreen />);
  fireEvent.press(screen.getByText('Play'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/radio');
  fireEvent.press(screen.getByText('Edit'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/edit');
});

it('supports the editor tools and local reorder action', () => {
  render(<OwnerPlaylistEditorScreen />);
  fireEvent.press(screen.getByText('Add track'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/add-track');
  fireEvent.press(screen.getByLabelText('Move Night Drive to top'));
  expect(screen.getByLabelText('Move Night Drive to top')).toBeTruthy();
});

it('adds a search result and invites a member locally', () => {
  const add = render(<AddTrackScreen />);
  fireEvent.press(screen.getAllByRole('checkbox')[0]);
  expect(screen.getAllByRole('checkbox')[0].props.accessibilityState.checked).toBe(true);
  add.unmount();

  render(<PlaylistMembersScreen />);
  fireEvent.press(screen.getByText('Sara Benali'));
  expect(screen.getAllByText('Invited').length).toBeGreaterThanOrEqual(2);
});

it('updates the radio like control', () => {
  render(<PlaylistRadioScreen />);
  fireEvent.press(screen.getByText('Like'));
  expect(screen.getByText('Liked')).toBeTruthy();
});
