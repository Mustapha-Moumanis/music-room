/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

jest.mock('@hugeicons/react-native', () => {
  const { View } = require('react-native');
  return { HugeiconsIcon: (props: object) => <View testID="hugeicons-glyph" {...props} /> };
});

import {
  EventCard,
  FriendRequestRow,
  PlaylistCard,
  TrackRow,
  UserCard,
  type EventCardState,
  type PlaylistCardMode,
  type TrackRowMode,
} from '../components/ui';
import { colors, layout, radius, spacing, typography } from '../theme';

it('matches both User Card relationships and forwards the add-friend action', () => {
  const onActionPress = jest.fn();
  const onPress = jest.fn();
  const stranger = render(<UserCard
    initials="OM"
    meta="3 mutual interests"
    name="Omar Saadi"
    onActionPress={onActionPress}
    onPress={onPress}
    testID="user"
  />);

  expect(StyleSheet.flatten(stranger.getByTestId('user').props.style)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 360,
    minHeight: 88,
    gap: spacing[12],
    padding: spacing[16],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  }));
  expect(StyleSheet.flatten(stranger.getByTestId('user-avatar').props.style)).toEqual(expect.objectContaining({
    width: spacing[48],
    height: spacing[48],
  }));
  expect(StyleSheet.flatten(stranger.getByTestId('user-action-pill').props.style).backgroundColor)
    .toBe(colors.action.secondary);
  expect(StyleSheet.flatten(stranger.getByText('Omar Saadi').props.style))
    .toEqual(expect.objectContaining(typography.navigationLabel));

  fireEvent.press(stranger.getByTestId('user-action'));
  expect(onActionPress).toHaveBeenCalledTimes(1);
  fireEvent.press(stranger.getByTestId('user-profile'));
  expect(onPress).toHaveBeenCalledTimes(1);

  const friend = render(<UserCard
    initials="NA"
    meta="Friend · Indie / Soul"
    name="Nada Amrani"
    relation="friend"
    testID="friend"
  />);
  expect(friend.getByText('Friend')).toBeTruthy();
  expect(StyleSheet.flatten(friend.getByTestId('friend-action-pill').props.style).backgroundColor)
    .toBe(colors.category.secondary);
  expect(friend.getByTestId('friend-action').props.accessibilityState.disabled).toBe(true);
});

const eventStates: Record<EventCardState, { artwork: string; label: string; status: string }> = {
  default: {
    artwork: colors.category.secondary,
    label: 'PUBLIC',
    status: colors.action.secondary,
  },
  live: {
    artwork: colors.action.primary,
    label: 'LIVE',
    status: colors.action.primary,
  },
  private: {
    artwork: colors.category.secondary,
    label: 'PRIVATE',
    status: colors.category.secondary,
  },
};

it.each(Object.entries(eventStates) as Array<[EventCardState, (typeof eventStates)[EventCardState]]>)(
  'matches the %s Event Card state',
  (state, expected) => {
    const view = render(<EventCard
      attendeeSummary="24 listening · 8 tracks"
      meta="Tonight · 20:00 · Benguerir"
      state={state}
      title={state === 'live' ? 'Rooftop Tape Night' : 'Analog Sundays'}
      testID="event"
    />);

    expect(StyleSheet.flatten(view.getByTestId('event').props.style)).toEqual(expect.objectContaining({
      width: '100%',
      maxWidth: 360,
      height: 290,
      gap: spacing[12],
      padding: spacing[16],
      borderRadius: radius.card,
      backgroundColor: colors.background.surface,
    }));
    expect(StyleSheet.flatten(view.getByTestId('event-artwork').props.style)).toEqual(expect.objectContaining({
      width: '100%',
      height: 150,
      borderRadius: radius.media,
      backgroundColor: expected.artwork,
    }));
    expect(StyleSheet.flatten(view.getByTestId('event-status').props.style).backgroundColor)
      .toBe(expected.status);
    expect(view.getByText(expected.label)).toBeTruthy();
    expect(view.getByTestId('event').props.accessibilityRole).toBe('button');
  },
);

const playlistModes: Record<PlaylistCardMode, { artwork: string; meta: string; title: string }> = {
  default: {
    artwork: colors.category.secondary,
    meta: '18 tracks · 1h 12m',
    title: 'Sunday Vinyl',
  },
  collaborative: {
    artwork: colors.action.secondary,
    meta: 'Collaborative · 4 members',
    title: 'Friends Tape',
  },
  owned: {
    artwork: colors.category.secondary,
    meta: '18 tracks · 1h 12m',
    title: 'Late Night Drive',
  },
};

it.each(Object.entries(playlistModes) as Array<[PlaylistCardMode, (typeof playlistModes)[PlaylistCardMode]]>)(
  'matches the %s Playlist Card mode',
  (mode, expected) => {
    const view = render(<PlaylistCard {...expected} mode={mode} testID="playlist" />);

    expect(StyleSheet.flatten(view.getByTestId('playlist').props.style)).toEqual(expect.objectContaining({
      width: '100%',
      maxWidth: 280,
      height: 330,
      gap: spacing[12],
      padding: spacing[16],
      borderRadius: radius.card,
      backgroundColor: colors.background.surface,
    }));
    expect(StyleSheet.flatten(view.getByTestId('playlist-artwork').props.style)).toEqual(expect.objectContaining({
      width: '100%',
      height: 210,
      borderRadius: radius.media,
      backgroundColor: expected.artwork,
    }));
  },
);

const trackModes: TrackRowMode[] = ['default', 'playing', 'vote', 'dragging'];

it.each(trackModes)('matches the %s Track Row mode', (mode) => {
  const view = render(<TrackRow
    artist="The Midnight"
    duration="3:56"
    mode={mode}
    title="Better Off Alone"
    testID="track"
  />);
  const rowStyle = StyleSheet.flatten(view.getByTestId('track').props.style);
  const artworkStyle = StyleSheet.flatten(view.getByTestId('track-artwork').props.style);

  expect(rowStyle).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 720,
    minHeight: 72,
    gap: spacing[12],
    padding: spacing[12],
  }));
  expect(artworkStyle.borderRadius).toBe(radius.medium);
  expect(rowStyle.backgroundColor)
    .toBe(mode === 'playing' ? colors.background.surface : colors.background.app);
  expect(rowStyle.borderRadius).toBe(mode === 'default' ? undefined : radius.medium);
  expect(rowStyle.borderWidth).toBe(mode === 'dragging' ? 2 : undefined);
  expect(rowStyle.borderColor).toBe(mode === 'dragging' ? colors.action.secondary : undefined);

  if (mode === 'vote') expect(view.getByTestId('track-vote')).toBeTruthy();
  else expect(view.queryByTestId('track-vote')).toBeNull();
  if (mode === 'dragging') expect(view.getByTestId('track-drag-handle')).toBeTruthy();
  else expect(view.queryByTestId('track-drag-handle')).toBeNull();
  if (mode === 'playing') expect(view.getByText('Playing')).toBeTruthy();
});

it('forwards Track Row voting and Friend Request actions', () => {
  const onVotePress = jest.fn();
  const vote = render(<TrackRow
    artist="The Midnight"
    duration="3:56"
    mode="vote"
    onVotePress={onVotePress}
    title="Better Off Alone"
    testID="track"
  />);
  fireEvent.press(vote.getByTestId('track-vote'));
  expect(onVotePress).toHaveBeenCalledTimes(1);

  const onAccept = jest.fn();
  const onDecline = jest.fn();
  const pending = render(<FriendRequestRow
    initials="NA"
    name="Nada Amrani"
    onAccept={onAccept}
    onDecline={onDecline}
    testID="request"
  />);
  expect(StyleSheet.flatten(pending.getByTestId('request').props.style)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: layout.previewMaxWidth,
    minHeight: 72,
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  }));
  fireEvent.press(pending.getByTestId('request-accept'));
  fireEvent.press(pending.getByTestId('request-decline'));
  expect(onAccept).toHaveBeenCalledTimes(1);
  expect(onDecline).toHaveBeenCalledTimes(1);

  const accepted = render(<FriendRequestRow
    initials="NA"
    name="Nada Amrani"
    state="accepted"
    testID="accepted"
  />);
  expect(accepted.getByText('Friend request accepted')).toBeTruthy();
  expect(accepted.getByText('Friend')).toBeTruthy();
  expect(accepted.queryByTestId('accepted-accept')).toBeNull();
});

it('renders repository-backed image sources when supplied', () => {
  const view = render(<PlaylistCard
    artworkSource={{ uri: 'file:///artwork.jpg' }}
    meta="18 tracks"
    title="Sunday Vinyl"
    testID="playlist"
  />);

  expect(view.getByTestId('playlist-artwork-image')).toBeTruthy();
});
