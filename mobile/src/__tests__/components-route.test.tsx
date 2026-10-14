/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable import/first, @typescript-eslint/no-require-imports -- imports follow hoisted mocks; factories require native primitives */
import { render, screen } from '@testing-library/react-native';

const mockIsDevBuild = jest.fn();

jest.mock('../config/variant', () => ({ isDevBuild: () => mockIsDevBuild() }));
jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return { Redirect: ({ href }: { href: string }) => <Text>Redirect:{href}</Text> };
});

import ComponentsScreen from '../../app/dev/components';

it('renders every Button specimen and the live example in development builds', async () => {
  mockIsDevBuild.mockReturnValue(true);
  await render(<ComponentsScreen />);

  expect(screen.getByTestId('components-screen')).toBeTruthy();
  expect(screen.getByText('Components')).toBeTruthy();
  expect(screen.getByText('01. Buttons')).toBeTruthy();
  expect(screen.getByText('Reusable UI')).toBeTruthy();

  for (const variant of ['primary', 'accent', 'secondary', 'ghost', 'danger']) {
    for (const size of ['small', 'default']) {
      for (const state of ['default', 'active', 'disabled']) {
        expect(screen.getByTestId(`button-${variant}-${size}-${state}`)).toBeTruthy();
      }
    }
  }

  expect(screen.getByText('06. Cards & rows')).toBeTruthy();
  for (const relation of ['stranger', 'friend']) {
    expect(screen.getByTestId(`user-card-${relation}`)).toBeTruthy();
  }
  for (const state of ['default', 'live', 'private']) {
    expect(screen.getByTestId(`event-card-${state}`)).toBeTruthy();
  }
  for (const mode of ['default', 'collaborative', 'owned']) {
    expect(screen.getByTestId(`playlist-card-${mode}`)).toBeTruthy();
  }
  for (const mode of ['default', 'playing', 'vote', 'dragging']) {
    expect(screen.getByTestId(`track-row-${mode}`)).toBeTruthy();
  }
  for (const state of ['pending', 'accepted']) {
    expect(screen.getByTestId(`friend-request-${state}`)).toBeTruthy();
  }

  expect(screen.getByText('07. Navigation & playback')).toBeTruthy();
  for (const state of ['playing', 'paused']) {
    expect(screen.getByTestId(`mini-player-${state}`)).toBeTruthy();
  }
  for (const active of ['home', 'events', 'playlists', 'friends', 'profile']) {
    expect(screen.getByTestId(`bottom-navigation-${active}`)).toBeTruthy();
  }
  for (const breakpoint of ['desktop', 'tablet']) {
    for (const state of ['default', 'search']) {
      expect(screen.getByTestId(`top-bar-${breakpoint}-${state}`)).toBeTruthy();
    }
    expect(screen.getByTestId(`web-player-${breakpoint}`)).toBeTruthy();
  }
  for (const breakpoint of ['desktop', 'tablet']) {
    for (const active of ['home', 'events', 'playlists', 'friends', 'settings', 'none']) {
      expect(screen.getByTestId(`web-sidebar-${breakpoint}-${active}`)).toBeTruthy();
    }
  }

  expect(screen.getByText('08. Overlays & feedback')).toBeTruthy();
  for (const type of ['confirm', 'form']) {
    expect(screen.getByTestId(`modal-${type}`)).toBeTruthy();
  }
  for (const type of ['actions', 'picker']) {
    expect(screen.getByTestId(`bottom-sheet-${type}`)).toBeTruthy();
  }
  for (const tone of ['success', 'info', 'error']) {
    expect(screen.getByTestId(`toast-${tone}`)).toBeTruthy();
  }

  expect(screen.getByText('09. System states')).toBeTruthy();
  for (const type of ['default', 'noResults']) {
    expect(screen.getByTestId(`empty-state-${type}`)).toBeTruthy();
  }
  expect(screen.getByTestId('error-state')).toBeTruthy();
  for (const type of ['card', 'row']) {
    expect(screen.getByTestId(`skeleton-loader-${type}`)).toBeTruthy();
  }
});

it('redirects to the normal entry route outside development builds', async () => {
  mockIsDevBuild.mockReturnValue(false);
  await render(<ComponentsScreen />);
  expect(screen.getByText('Redirect:/')).toBeTruthy();
  expect(screen.queryByTestId('components-screen')).toBeNull();
});
