/* eslint-disable import/first -- feature imports intentionally follow hoisted router mocks */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

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

it('opens a featured playlist from discovery', async () => {
  await render(<DiscoverPlaylistsScreen />);
  expect(screen.queryByLabelText('Go back')).toBeNull();
  await fireEvent.press(screen.getByText('Add playlist'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/create');
  await fireEvent.press(screen.getByText('My playlists'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/mine');
  await fireEvent.press(screen.getByText('Friends Tape'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/read-only');
});

it('opens playback and the owner editor from playlist details', async () => {
  await render(<PlaylistDetailsScreen />);
  await fireEvent.press(screen.getByLabelText('Go back'));
  expect(mockReplace).toHaveBeenCalledWith('/playlists');
  await fireEvent.press(screen.getByText('Play'));
  expect(mockPush).toHaveBeenCalledWith('/player');
  await fireEvent.press(screen.getByText('Edit'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/edit');
  await fireEvent.press(screen.getByLabelText('Play Better Off Alone'));
  expect(mockPush).toHaveBeenCalledWith('/player');
});

it('supports editor tools, reorder, and remove actions', async () => {
  await render(<OwnerPlaylistEditorScreen />);
  await fireEvent.press(screen.getByText('Add track'));
  expect(mockPush).toHaveBeenCalledWith('/playlists/add-track');
  await fireEvent(screen.getByLabelText('Reorder Better Off Alone'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
  await fireEvent.press(screen.getByLabelText('Remove Better Off Alone'));
  await waitFor(() => {
    expect(screen.queryByLabelText('Reorder Better Off Alone')).toBeNull();
  });
});

it('adds a search result and invites a member locally', async () => {
  const add = await render(<AddTrackScreen />);
  expect(screen.getByText('Already added')).toBeTruthy();
  await fireEvent.press(screen.getAllByRole('checkbox')[1]);
  expect(screen.getByText('Added')).toBeTruthy();
  await add.unmount();

  await render(<PlaylistMembersScreen />);
  await fireEvent.press(screen.getByText('Sara Benali'));
  expect(screen.getAllByText('Invited').length).toBeGreaterThanOrEqual(2);
});
