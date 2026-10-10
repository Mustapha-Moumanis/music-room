/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush, replace: mockReplace }),
}));

import {
  FriendRequestsScreen,
  MyProfileScreen,
  UserSearchScreen,
} from '../features/profile-friends/profile-friends-screens';
import { EditProfileScreen } from '../features/profile-friends/profile-editor-screen';
import { SettingsScreen } from '../features/profile-friends/profile-settings-screens';

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders the profile composition and opens the unified profile editor', () => {
  render(<MyProfileScreen />);

  expect(screen.getByTestId('my-profile-screen')).toBeTruthy();
  expect(screen.getByText('Souad Hilal')).toBeTruthy();
  fireEvent.press(screen.getByText('Edit profile'));
  expect(mockPush).toHaveBeenCalledWith('/profile/edit');
});

it('keeps user search local and changes an add action to the friend state', () => {
  render(<UserSearchScreen />);

  expect(screen.getByText('Find someone on Music Room')).toBeTruthy();
  fireEvent.press(screen.getAllByText('Add friend')[0]);
  expect(screen.getByText('Friend')).toBeTruthy();
});

it('moves accepted requests into the recently accepted section', () => {
  render(<FriendRequestsScreen />);

  fireEvent.press(screen.getByLabelText("Accept Yassine El Mansouri's friend request"));
  expect(screen.queryByLabelText("Accept Yassine El Mansouri's friend request")).toBeNull();
  expect(screen.getByText('Yassine El Mansouri')).toBeTruthy();
  expect(screen.getAllByText('Now friends').length).toBeGreaterThanOrEqual(2);
});

it('opens settings from the profile menu', () => {
  render(<MyProfileScreen />);

  fireEvent.press(screen.getByLabelText('More options'));
  expect(mockPush).toHaveBeenCalledWith('/settings');
});

it('navigates through account settings and toggles playback preferences locally', () => {
  render(<SettingsScreen />);

  fireEvent.press(screen.getByLabelText('Linked accounts'));
  expect(mockPush).toHaveBeenCalledWith('/settings/linked-accounts');

  const autoplay = screen.getByTestId('autoplay-setting');
  expect(autoplay.props.accessibilityState.checked).toBe(true);
  fireEvent.press(autoplay);
  expect(screen.getByTestId('autoplay-setting').props.accessibilityState.checked).toBe(false);
});

it('edits per-field visibility and switches the live profile preview', () => {
  render(<EditProfileScreen />);

  fireEvent.press(screen.getByLabelText('Change Location visibility, currently Friends'));
  fireEvent.press(screen.getByTestId('profile-visibility-sheet-option-private'));
  expect(screen.getByLabelText('Change Location visibility, currently Private')).toBeTruthy();

  fireEvent.press(screen.getByText('Friend'));
  expect(screen.getByText('Viewing as Friend · Hidden fields respect each visibility choice.')).toBeTruthy();
});
