import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { Alert } from 'react-native';

import FriendsScreen from '../../app/(app)/friends';
import PeopleScreen from '../../app/(app)/people';
import ProfileScreen, { parseTags } from '../../app/(app)/profile';
import UserProfileScreen from '../../app/(app)/users/[id]';
import { ApiError } from '../api/errors';
import { acceptFriendRequest, listFriendRequests, listFriends, removeFriend, sendFriendRequest } from '../api/friends';
import { getGenres, getMyProfile, getUserProfile, searchUsers, updateMyProfile, type MyProfile } from '../api/users';
import { useSessionStore } from '../stores/session.store';

const mockPush = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('../api/users', () => ({
  ...jest.requireActual('../api/users'),
  getMyProfile: jest.fn(),
  updateMyProfile: jest.fn(),
  getGenres: jest.fn(),
  searchUsers: jest.fn(),
  getUserProfile: jest.fn(),
}));
jest.mock('../api/friends', () => ({
  ...jest.requireActual('../api/friends'),
  listFriends: jest.fn(),
  listFriendRequests: jest.fn(),
  sendFriendRequest: jest.fn(),
  acceptFriendRequest: jest.fn(),
  declineFriendRequest: jest.fn(),
  cancelFriendRequest: jest.fn(),
  removeFriend: jest.fn(),
}));

const myProfile: MyProfile = {
  id: 'me',
  email: 'ana@example.com',
  public: { displayName: 'Ana', bio: null, avatarUrl: null },
  friends: { realName: 'Ana Lopez', city: null },
  private: { birthDate: null, phone: null },
  music: { genres: ['house'], tags: ['vinyl'], visibility: 'PUBLIC' },
};

function Wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } })}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  jest.mocked(getMyProfile).mockResolvedValue(myProfile);
  jest.mocked(getGenres).mockResolvedValue(['house', 'jazz', 'rock']);
  jest.mocked(listFriends).mockResolvedValue([]);
  jest.mocked(listFriendRequests).mockResolvedValue({ incoming: [], outgoing: [] });
  useSessionStore.setState({
    status: 'signedIn',
    user: { id: 'me', email: 'ana@example.com', displayName: 'Ana', emailVerified: true, hasPassword: true, providers: ['LOCAL'] },
  });
});

describe('my profile', () => {
  it('edits every group and saves them in one request', async () => {
    jest.mocked(updateMyProfile).mockImplementation(async (body) => ({
      ...myProfile,
      public: { ...myProfile.public, displayName: body.public?.displayName ?? 'Ana' },
    }));
    await render(<ProfileScreen />, { wrapper: Wrapper });

    expect(await screen.findByDisplayValue('Ana Lopez')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Display name'), '  DJ Ana ');
    await fireEvent.changeText(screen.getByLabelText('City'), 'Casablanca');
    await fireEvent.changeText(screen.getByLabelText('Birth date'), '1999-04-21');
    await fireEvent.press(await screen.findByRole('checkbox', { name: 'jazz' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Only me' }));
    await fireEvent.changeText(screen.getByLabelText('Tags'), 'Vinyl, road trip, vinyl');
    await fireEvent.press(screen.getByRole('button', { name: 'Save profile' }));

    expect(await screen.findByText('Profile saved.')).toBeTruthy();
    expect(updateMyProfile).toHaveBeenCalledWith({
      public: { displayName: 'DJ Ana', bio: '', avatarUrl: '' },
      friends: { realName: 'Ana Lopez', city: 'Casablanca' },
      private: { birthDate: '1999-04-21', phone: '' },
      music: { genres: ['house', 'jazz'], tags: ['vinyl', 'road trip'], visibility: 'PRIVATE' },
    });
    expect(useSessionStore.getState().user?.displayName).toBe('DJ Ana');
  });

  it('catches a malformed birth date before calling the server', async () => {
    await render(<ProfileScreen />, { wrapper: Wrapper });
    await fireEvent.changeText(await screen.findByLabelText('Birth date'), '21/04/1999');
    await fireEvent.press(screen.getByRole('button', { name: 'Save profile' }));

    expect(await screen.findByText('Write your birth date as YYYY-MM-DD.')).toBeTruthy();
    expect(updateMyProfile).not.toHaveBeenCalled();
  });

  it('shows the server validation messages', async () => {
    jest.mocked(updateMyProfile).mockRejectedValue(
      new ApiError('HTTP', 'Reached server but the request returned 400', 400, undefined, ['public.avatarUrl must be a URL address']),
    );
    await render(<ProfileScreen />, { wrapper: Wrapper });
    await fireEvent.changeText(await screen.findByLabelText('Avatar URL'), 'not a url');
    await fireEvent.press(screen.getByRole('button', { name: 'Save profile' }));

    expect(await screen.findByText('Please fix: public.avatarUrl must be a URL address')).toBeTruthy();
  });

  it('normalises tags like the backend does', () => {
    expect(parseTags(' Road Trip, 90s,, road trip ,')).toEqual(['road trip', '90s']);
  });
});

describe('people search', () => {
  it('searches once the name has two letters and sends a friend request', async () => {
    jest.mocked(searchUsers).mockResolvedValue([{ id: 'ben', displayName: 'Ben', avatarUrl: null, relationship: 'NONE' }]);
    jest.mocked(sendFriendRequest).mockResolvedValue({ userId: 'ben', relationship: 'REQUEST_SENT' });
    await render(<PeopleScreen />, { wrapper: Wrapper });

    await fireEvent.changeText(screen.getByLabelText('Search by name'), 'b');
    expect(screen.getByText('Type a display name to find someone to add.')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Search by name'), 'be ');
    expect(await screen.findByText('Ben')).toBeTruthy();
    expect(searchUsers).toHaveBeenCalledWith('be');

    await fireEvent.press(screen.getByRole('button', { name: 'Add friend' }));
    await waitFor(() => expect(sendFriendRequest).toHaveBeenCalledWith('ben'));

    await fireEvent.press(screen.getByRole('link', { name: "Open Ben's profile" }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(app)/users/[id]', params: { id: 'ben' } });
  });
});

describe('another user profile', () => {
  it('tells a stranger what is hidden instead of showing it', async () => {
    mockParams = { id: 'ben' };
    jest.mocked(getUserProfile).mockResolvedValue({
      id: 'ben', relationship: 'NONE', public: { displayName: 'Ben', bio: 'Drummer', avatarUrl: null },
    });
    await render(<UserProfileScreen />, { wrapper: Wrapper });

    expect(await screen.findByText('Drummer')).toBeTruthy();
    expect(screen.getByText(/Only Ben.s friends can see their real name and city/)).toBeTruthy();
    expect(screen.getByText('Ben keeps their music preferences hidden.')).toBeTruthy();
    expect(screen.queryByText('Real name')).toBeNull();
    expect(screen.getByRole('button', { name: 'Add friend' })).toBeTruthy();
  });

  it('shows a friend their friends-only info and asks before removing them', async () => {
    mockParams = { id: 'ben' };
    jest.mocked(getUserProfile).mockResolvedValue({
      id: 'ben', relationship: 'FRIENDS',
      public: { displayName: 'Ben', bio: null, avatarUrl: null },
      friends: { realName: 'Ben Ali', city: null },
      music: { genres: ['jazz'], tags: ['live'], visibility: 'FRIENDS' },
    });
    jest.mocked(removeFriend).mockResolvedValue(undefined);
    const alert = jest.spyOn(Alert, 'alert');
    await render(<UserProfileScreen />, { wrapper: Wrapper });

    expect(await screen.findByText('Ben Ali')).toBeTruthy();
    expect(screen.getByText('Not shared')).toBeTruthy();
    expect(screen.getByText('jazz')).toBeTruthy();
    expect(screen.getByText('#live')).toBeTruthy();
    expect(screen.queryByText('Private')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Remove friend' }));
    expect(removeFriend).not.toHaveBeenCalled();
    const buttons = alert.mock.calls[0][2] ?? [];
    await act(async () => { buttons.find((button) => button.text === 'Remove')?.onPress?.(); });
    await waitFor(() => expect(removeFriend).toHaveBeenCalledWith('ben'));
  });

  it('reports an account that no longer exists', async () => {
    mockParams = { id: 'gone' };
    jest.mocked(getUserProfile).mockRejectedValue(new ApiError('USER_NOT_FOUND', 'not found', 404));
    await render(<UserProfileScreen />, { wrapper: Wrapper });
    expect(await screen.findByText('This account is no longer available.')).toBeTruthy();
  });
});

describe('friends', () => {
  it('lists requests and friends, and accepts a request', async () => {
    jest.mocked(listFriendRequests).mockResolvedValue({
      incoming: [{ user: { id: 'cara', displayName: 'Cara', avatarUrl: null }, createdAt: '2026-10-07T10:00:00.000Z' }],
      outgoing: [{ user: { id: 'dan', displayName: 'Dan', avatarUrl: null }, createdAt: '2026-10-07T10:00:00.000Z' }],
    });
    jest.mocked(listFriends).mockResolvedValue([{ id: 'ben', displayName: 'Ben', avatarUrl: null, since: '2026-10-01T10:00:00.000Z' }]);
    jest.mocked(acceptFriendRequest).mockResolvedValue({ userId: 'cara', relationship: 'FRIENDS' });
    await render(<FriendsScreen />, { wrapper: Wrapper });

    expect(await screen.findByText('Requests (1)')).toBeTruthy();
    expect(screen.getByText('Cara')).toBeTruthy();
    expect(screen.getByText('Dan')).toBeTruthy();
    expect(await screen.findByText('Ben')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel request' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Accept' }));
    await waitFor(() => expect(acceptFriendRequest).toHaveBeenCalledWith('cara'));
    await waitFor(() => expect(listFriendRequests).toHaveBeenCalledTimes(2));
  });
});
