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
  DiscoverEventsScreen,
  InviteFriendsScreen,
  ParticipantEventRoomScreen,
  SuggestTrackScreen,
} from '../features/track-vote/track-vote-screens';

beforeEach(() => {
  jest.clearAllMocks();
});

it('opens event details and exposes event creation from discovery', () => {
  render(<DiscoverEventsScreen />);

  fireEvent.press(screen.getByTestId('live-event-card'));
  expect(mockPush).toHaveBeenCalledWith('/events/details');
  fireEvent.press(screen.getByLabelText('More options'));
  expect(mockPush).toHaveBeenCalledWith('/events/create');
});

it('selects event visibility and advances the create flow', () => {
  render(<CreateEventVisibilityScreen />);

  fireEvent.press(screen.getByText('Private'));
  expect(screen.getByRole('radio', { selected: true })).toHaveTextContent('Private');
  fireEvent.press(screen.getByText('Continue'));
  expect(mockPush).toHaveBeenCalledWith('/events/create/voting-rules');
});

it('changes a queue vote into the voted state', () => {
  render(<ParticipantEventRoomScreen />);

  fireEvent.press(screen.getByTestId('queue-night-drive-vote'));
  expect(screen.getByText('+1 · Voted')).toBeTruthy();
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
