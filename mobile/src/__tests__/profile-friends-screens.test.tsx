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
  FriendProfileScreen,
  FriendsListScreen,
  FriendRequestsScreen,
  MyProfileScreen,
  StrangerProfileScreen,
  UserSearchScreen,
} from '../features/profile-friends/profile-friends-screens';
import { EditProfileScreen } from '../features/profile-friends/profile-editor-screen';
import { SettingsScreen, SubscriptionScreen } from '../features/profile-friends/profile-settings-screens';

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders the profile composition and opens the unified profile editor', () => {
  render(<MyProfileScreen />);

  expect(screen.getByTestId('my-profile-screen')).toBeTruthy();
  expect(screen.queryByLabelText('Go back')).toBeNull();
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

it('opens a friend profile from the friends list', () => {
  render(<FriendsListScreen />);

  fireEvent.press(screen.getByLabelText("Open Nada Amrani's profile"));
  expect(mockPush).toHaveBeenCalledWith('/friends/friend-profile');
});

it('never renders restricted fields or lock placeholders on a stranger profile', () => {
  render(<StrangerProfileScreen />);

  expect(screen.queryByText('Private information')).toBeNull();
  expect(screen.queryByText('Shared with friends')).toBeNull();
  expect(screen.queryByText('Hidden')).toBeNull();
  expect(screen.getByText('On repeat')).toBeTruthy();
  expect(screen.getByLabelText('Play Let It Happen by Tame Impala')).toBeTruthy();
});

it('removes friends-only fields when the viewer is no longer a friend', () => {
  render(<FriendProfileScreen />);

  expect(screen.getByText('Shared with friends')).toBeTruthy();
  expect(screen.getByText('@nada.music')).toBeTruthy();
  expect(screen.queryByText('Private information')).toBeNull();

  fireEvent.press(screen.getByText('Friends'));
  expect(screen.queryByText('Shared with friends')).toBeNull();
  expect(screen.queryByText('@nada.music')).toBeNull();
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

  fireEvent.press(screen.getByLabelText('Open account menu'));
  expect(screen.getByTestId('header-overflow-menu')).toBeTruthy();
  expect(screen.getByText('Profile')).toBeTruthy();
  expect(screen.getByText('Subscription')).toBeTruthy();
  expect(screen.getByText('Sign out')).toBeTruthy();
  expect(screen.queryByText('Community')).toBeNull();
  expect(screen.queryByText('Help center')).toBeNull();
  fireEvent.press(screen.getByText('Settings'));
  expect(mockPush).toHaveBeenCalledWith('/settings');
});

it('opens subscription details from the account menu', () => {
  render(<MyProfileScreen />);

  fireEvent.press(screen.getByLabelText('Open account menu'));
  fireEvent.press(screen.getByText('Subscription'));
  expect(mockPush).toHaveBeenCalledWith('/subscription');
});

it('allows users to register interest in Music Room Pro', () => {
  render(<SubscriptionScreen />);
  fireEvent.press(screen.getByText('Notify me when Pro launches'));
  expect(screen.getByText("You're on the list")).toBeTruthy();
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

  const locationSelect = screen.getByLabelText('Change Location visibility, currently Friends');
  fireEvent.press(locationSelect);
  expect(screen.getByTestId('profile-visibility-dropdown')).toBeTruthy();
  expect(locationSelect.props.accessibilityState.expanded).toBe(true);
  fireEvent.press(screen.getByTestId('profile-visibility-dropdown-option-private'));
  expect(screen.getByLabelText('Change Location visibility, currently Private')).toBeTruthy();
  expect(screen.queryByTestId('profile-visibility-dropdown')).toBeNull();

  fireEvent.press(screen.getByText('Friend'));
  expect(screen.getByText('Viewing as Friend · Only visible fields are shown.')).toBeTruthy();
});

it('reveals upload on the profile photo and handles the photo action directly', () => {
  render(<EditProfileScreen />);

  const photoUpload = screen.getByTestId('profile-photo-upload');
  expect(screen.queryByText('Change photo')).toBeNull();
  fireEvent(photoUpload, 'hoverIn');
  expect(screen.getByText('Upload')).toBeTruthy();
  fireEvent.press(photoUpload);
  expect(screen.getByText('Photo ready')).toBeTruthy();
});

it('dismisses the visibility dropdown without changing the selected value', () => {
  render(<EditProfileScreen />);

  fireEvent.press(screen.getByLabelText('Change Location visibility, currently Friends'));
  fireEvent.press(screen.getByTestId('profile-visibility-dropdown-backdrop'));

  expect(screen.queryByTestId('profile-visibility-dropdown')).toBeNull();
  expect(screen.getByLabelText('Change Location visibility, currently Friends')).toBeTruthy();
});

it('keeps only the most recently opened visibility select expanded', () => {
  render(<EditProfileScreen />);

  const location = screen.getByLabelText('Change Location visibility, currently Friends');
  const displayName = screen.getByLabelText('Change Display name visibility, currently Public');
  fireEvent.press(location);
  fireEvent.press(displayName);

  expect(location.props.accessibilityState.expanded).toBe(false);
  expect(displayName.props.accessibilityState.expanded).toBe(true);
  expect(screen.getAllByTestId('profile-visibility-dropdown')).toHaveLength(1);
});
