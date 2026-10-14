/* eslint-disable import/first -- feature imports intentionally follow hoisted router mocks */
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush, replace: mockReplace }),
}));

import {
  CreateEventVisibilityScreen,
  CreateEventVotingRulesScreen,
  DiscoverEventsScreen,
  InviteFriendsScreen,
  OwnerEventRoomScreen,
  ParticipantEventRoomScreen,
  SuggestTrackScreen,
} from '../features/track-vote/track-vote-screens';

beforeEach(() => {
  jest.clearAllMocks();
});

it('opens event details and exposes event creation directly from discovery', async () => {
  await render(<DiscoverEventsScreen />);

  expect(screen.queryByLabelText('Go back')).toBeNull();
  await fireEvent.press(screen.getByTestId('live-event-card'));
  expect(mockPush).toHaveBeenCalledWith('/events/details');
  await fireEvent.press(screen.getByText('Add event'));
  expect(mockPush).toHaveBeenCalledWith('/events/create');
});

it('selects event visibility and advances the create flow', async () => {
  await render(<CreateEventVisibilityScreen />);

  await fireEvent.press(screen.getByLabelText('Go back'));
  expect(mockReplace).toHaveBeenCalledWith('/events/create');
  await fireEvent.press(screen.getByRole('radio', { name: /^Private/ }));
  expect(screen.getByRole('radio', { name: /^Private/, selected: true })).toBeTruthy();
  await fireEvent.press(screen.getByText('Continue'));
  expect(mockPush).toHaveBeenCalledWith('/events/create/voting-rules');
});

it('keeps event voting licenses mutually exclusive', async () => {
  await render(<CreateEventVotingRulesScreen />);
  await fireEvent.press(screen.getByRole('radio', { name: /^Everyone/ }));
  expect(screen.getByRole('radio', { name: /^Everyone/, selected: true })).toBeTruthy();
});

it('changes a queue vote into the voted state', async () => {
  await render(<ParticipantEventRoomScreen />);

  await fireEvent.press(screen.getByLabelText('Open Better Off Alone in Now Playing'));
  expect(mockPush).toHaveBeenCalledWith('/player');
  await fireEvent.press(screen.getByTestId('queue-night-drive-vote'));
  expect(screen.getByText('Voted')).toBeTruthy();
});

it('confirms the destructive end-event action', async () => {
  await render(<OwnerEventRoomScreen />);
  await fireEvent.press(screen.getByText('End event'));
  expect(screen.getByText('End this event?')).toBeTruthy();
  await fireEvent.press(screen.getAllByText('End event')[1]);
  expect(screen.getByText('Event ended')).toBeTruthy();
});

it('toggles invite selection and submits selected friends', async () => {
  await render(<InviteFriendsScreen />);

  await fireEvent.press(screen.getAllByRole('checkbox')[1]);
  expect(screen.getAllByText('Selected')).toHaveLength(2);
  await fireEvent.press(screen.getByText('Send invitations'));
  expect(mockReplace).toHaveBeenCalledWith('/events/owner');
});

it('selects and submits a suggested track', async () => {
  await render(<SuggestTrackScreen />);

  await fireEvent.press(screen.getByText('Sunset'));
  await fireEvent.press(screen.getByText('Suggest this track'));
  expect(mockReplace).toHaveBeenCalledWith('/events/room');
});
