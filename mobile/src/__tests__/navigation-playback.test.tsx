/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable import/first, @typescript-eslint/no-require-imports -- imports follow hoisted mocks; factories require native primitives */
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('@hugeicons/react-native', () => {
  const { View } = require('react-native');
  return { HugeiconsIcon: (props: object) => <View testID="hugeicons-glyph" {...props} /> };
});

import {
  BottomNavigation,
  MiniPlayer,
  TopBar,
  WebPlayer,
  WebSidebar,
  type MobileNavigationDestination,
  type SidebarPlaylist,
  type WebNavigationDestination,
} from '../components/ui';
import { colors, layout, radius, spacing } from '../theme';

const playlists: SidebarPlaylist[] = [
  { id: 'late-night', meta: '18 tracks', title: 'Late Night Drive', tone: 'primary' },
  { id: 'friends', meta: 'Collaborative', title: 'Friends Tape', tone: 'secondary' },
  { id: 'sunday', meta: 'Soul · Jazz', title: 'Sunday Vinyl', tone: 'category' },
];

it.each([
  ['playing', 'Pause track', '40.8%'],
  ['paused', 'Play track', '40.8%'],
] as const)('matches the %s Mini Player state', async (state, actionLabel, elapsedWidth) => {
  const view = await render(<MiniPlayer
    artist="The Midnight"
    state={state}
    title="Better Off Alone"
    testID="mini"
  />);

  expect(StyleSheet.flatten(view.getByTestId('mini').props.style)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 430,
    height: layout.miniPlayerHeight,
  }));
  expect(StyleSheet.flatten(view.getByTestId('mini-artwork').props.style)).toEqual(expect.objectContaining({
    width: layout.minimumTouchTarget,
    height: layout.minimumTouchTarget,
    borderRadius: radius.small,
    backgroundColor: colors.action.primary,
  }));
  expect(StyleSheet.flatten(view.getByTestId('mini-progress').props.style)).toEqual(expect.objectContaining({
    height: 2,
    backgroundColor: colors.border.subtle,
  }));
  expect(StyleSheet.flatten(view.getByTestId('mini-elapsed').props.style)).toEqual(expect.objectContaining({
    width: elapsedWidth,
    backgroundColor: colors.action.primary,
  }));
  expect(view.getByLabelText(actionLabel)).toBeTruthy();
});

it('forwards Mini Player actions', async () => {
  const onFavoritePress = jest.fn();
  const onOpenPress = jest.fn();
  const onPlayPausePress = jest.fn();
  const view = await render(<MiniPlayer
    artist="The Midnight"
    onFavoritePress={onFavoritePress}
    onOpenPress={onOpenPress}
    onPlayPausePress={onPlayPausePress}
    title="Better Off Alone"
    testID="mini"
  />);

  await fireEvent.press(view.getByTestId('mini-open'));
  await fireEvent.press(view.getByTestId('mini-favorite'));
  await fireEvent.press(view.getByTestId('mini-play-pause'));
  expect(onOpenPress).toHaveBeenCalledTimes(1);
  expect(onFavoritePress).toHaveBeenCalledTimes(1);
  expect(onPlayPausePress).toHaveBeenCalledTimes(1);
});

const mobileDestinations: MobileNavigationDestination[] = [
  'home',
  'events',
  'playlists',
  'friends',
  'profile',
];

it.each(mobileDestinations)('matches Bottom Navigation with %s active', async (active) => {
  const view = await render(<BottomNavigation active={active} testID="navigation" />);

  expect(StyleSheet.flatten(view.getByTestId('navigation').props.style)).toEqual(expect.objectContaining({
    width: '100%',
    maxWidth: 430,
    height: layout.bottomNavigationHeight,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    backgroundColor: colors.background.app,
  }));

  for (const destination of mobileDestinations) {
    const selected = destination === active;
    expect(view.getByTestId(`navigation-${destination}`).props.accessibilityState)
      .toEqual({ selected });
    expect(StyleSheet.flatten(view.getByTestId(`navigation-${destination}-indicator`).props.style).opacity)
      .toBe(selected ? undefined : 0);
  }
});

it('forwards Bottom Navigation selection', async () => {
  const onNavigate = jest.fn();
  const view = await render(<BottomNavigation onNavigate={onNavigate} testID="navigation" />);
  await fireEvent.press(view.getByTestId('navigation-events'));
  expect(onNavigate).toHaveBeenCalledWith('events');
});

const webDestinations: WebNavigationDestination[] = [
  'home',
  'events',
  'playlists',
  'friends',
  'settings',
  'none',
];

it.each(webDestinations)('matches desktop Web Sidebar with %s active', async (active) => {
  const view = await render(<WebSidebar
    active={active}
    playlists={playlists}
    testID="sidebar"
  />);
  const rootStyle = StyleSheet.flatten(view.getByTestId('sidebar').props.style);

  expect(rootStyle).toEqual(expect.objectContaining({
    width: 264,
    height: 900,
    gap: spacing[24],
    borderRightWidth: 1,
    borderRightColor: colors.border.subtle,
    backgroundColor: colors.background.app,
  }));
  expect(view.getByText('Your playlists')).toBeTruthy();
  expect(view.getByTestId('sidebar-playlist-late-night')).toBeTruthy();

  if (active !== 'none') {
    expect(StyleSheet.flatten(view.getByTestId(`sidebar-${active}`).props.style))
      .toEqual(expect.objectContaining({
        borderRadius: radius.medium,
        backgroundColor: colors.action.secondary,
      }));
  }
});

it('matches the compact tablet Web Sidebar and forwards actions', async () => {
  const onAddPlaylist = jest.fn();
  const onNavigate = jest.fn();
  const view = await render(<WebSidebar
    active="settings"
    breakpoint="tablet"
    onAddPlaylist={onAddPlaylist}
    onNavigate={onNavigate}
    playlists={playlists}
    testID="sidebar"
  />);

  expect(StyleSheet.flatten(view.getByTestId('sidebar').props.style)).toEqual(expect.objectContaining({
    width: 104,
    height: 672,
    gap: 18,
    paddingHorizontal: spacing[4],
  }));
  expect(view.queryByText('Your playlists')).toBeNull();
  expect(view.queryByTestId('sidebar-add-playlist')).toBeNull();
  await fireEvent.press(view.getByTestId('sidebar-home'));
  expect(onNavigate).toHaveBeenCalledWith('home');
});

it.each([
  ['desktop', 'default', 1112, 72, 340],
  ['desktop', 'search', 1112, 72, 430],
  ['tablet', 'default', 872, 64, 360],
  ['tablet', 'search', 872, 64, 360],
] as const)(
  'matches the %s %s Top Bar geometry',
  async (breakpoint, state, width, height, searchWidth) => {
    const view = await render(<TopBar
      accountName="Souad"
      breakpoint={breakpoint}
      initials="SH"
      state={state}
      testID="top"
    />);

    expect(StyleSheet.flatten(view.getByTestId('top').props.style)).toEqual(expect.objectContaining({
      width,
      height,
      gap: spacing[16],
    }));
    expect(StyleSheet.flatten(view.getByTestId('top-search-container').props.style).maxWidth)
      .toBe(searchWidth);
    expect(StyleSheet.flatten(view.getByTestId('top-avatar').props.style)).toEqual(expect.objectContaining({
      width: 36,
      height: 36,
      borderRadius: radius.full,
    }));
    expect(StyleSheet.flatten(view.getByTestId('top-search-control').props.style).borderColor)
      .toBe(state === 'search' ? colors.action.secondary : colors.border.subtle);
  },
);

it('forwards the Top Bar account action without a redundant dots control', async () => {
  const onAccountPress = jest.fn();
  const view = await render(<TopBar
    accountName="Souad"
    initials="SH"
    onAccountPress={onAccountPress}
    testID="top"
  />);

  await fireEvent.press(view.getByTestId('top-account'));
  expect(onAccountPress).toHaveBeenCalledTimes(1);
  expect(view.queryByTestId('top-more')).toBeNull();
});

it.each([
  ['desktop', 1440, 100],
  ['tablet', 1024, 62],
] as const)(
  'matches the %s Web Player geometry',
  async (breakpoint, width, volumeWidth) => {
    const view = await render(<WebPlayer
      artist="The Midnight"
      breakpoint={breakpoint}
      title="Better Off Alone"
      testID="player"
    />);

    expect(StyleSheet.flatten(view.getByTestId('player').props.style)).toEqual(expect.objectContaining({
      width,
      height: 96,
      paddingHorizontal: 20,
      paddingVertical: spacing[12],
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
      backgroundColor: colors.background.app,
    }));
    expect(view.getByTestId('player-artwork-image')).toBeTruthy();
    expect(StyleSheet.flatten(view.getByTestId('player-progress').props.style).width)
      .toBe('100%');
    expect(StyleSheet.flatten(view.getByTestId('player-volume-track').props.style).width)
      .toBe(volumeWidth);
    expect(StyleSheet.flatten(view.getByTestId('player-play-pause').props.style)).toEqual(expect.objectContaining({
      width: 52,
      height: 52,
      borderRadius: radius.full,
      backgroundColor: colors.background.selected,
    }));
  },
);

it('forwards Web Player actions through one semantic callback', async () => {
  const onAction = jest.fn();
  const view = await render(<WebPlayer
    artist="The Midnight"
    onAction={onAction}
    title="Better Off Alone"
    testID="player"
  />);

  await fireEvent.press(view.getByTestId('player-next'));
  await fireEvent.press(view.getByTestId('player-queue'));
  expect(onAction).toHaveBeenNthCalledWith(1, 'next');
  expect(onAction).toHaveBeenNthCalledWith(2, 'queue');
});
