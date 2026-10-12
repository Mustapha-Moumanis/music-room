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

it('opens event details and exposes event creation directly from discovery', () => {
  render(<DiscoverEventsScreen />);

  expect(screen.queryByLabelText('Go back')).toBeNull();
  fireEvent.press(screen.getByTestId('live-event-card'));
  expect(mockPush).toHaveBeenCalledWith('/events/details');
  fireEvent.press(screen.getByText('Add event'));
  expect(mockPush).toHaveBeenCalledWith('/events/create');
});

it('selects event visibility and advances the create flow', () => {
  render(<CreateEventVisibilityScreen />);

  fireEvent.press(screen.getByLabelText('Go back'));
  expect(mockReplace).toHaveBeenCalledWith('/events/create');
  fireEvent.press(screen.getByText('Private'));
  expect(screen.getByRole('radio', { selected: true })).toHaveTextContent('Private');
  fireEvent.press(screen.getByText('Continue'));
  expect(mockPush).toHaveBeenCalledWith('/events/create/voting-rules');
});

it('keeps event voting licenses mutually exclusive', () => {
  render(<CreateEventVotingRulesScreen />);
  fireEvent.press(screen.getByText('Everyone'));
  expect(screen.getByRole('radio', { selected: true })).toHaveTextContent('Everyone');
});

it('changes a queue vote into the voted state', () => {
  render(<ParticipantEventRoomScreen />);

  fireEvent.press(screen.getByLabelText('Open Better Off Alone in Now Playing'));
  expect(mockPush).toHaveBeenCalledWith('/player');
  fireEvent.press(screen.getByTestId('queue-night-drive-vote'));
  expect(screen.getByText('Voted')).toBeTruthy();
});

it('confirms the destructive end-event action', () => {
  render(<OwnerEventRoomScreen />);
  fireEvent.press(screen.getByText('End event'));
  expect(screen.getByText('End this event?')).toBeTruthy();
  fireEvent.press(screen.getAllByText('End event')[1]);
  expect(screen.getByText('Event ended')).toBeTruthy();
});

it('toggles invite selection and submits selected friends', () => {
  render(<InviteFriendsScreen />);

  fireEvent.press(screen.getAllByRole('checkbox')[1]);
  expect(screen.getAllByText('Selected')).toHaveLength(2);
  fireEvent.press(screen.getByText('Send invitations'));
  expect(mockReplace).toHaveBeenCalledWith('/events/owner');
});

it('selects and submits a suggested track', () => {
  render(<SuggestTrackScreen />);

  fireEvent.press(screen.getByText('Sunset'));
  fireEvent.press(screen.getByText('Suggest this track'));
  expect(mockReplace).toHaveBeenCalledWith('/events/room');
});
