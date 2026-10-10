/* Jest mock factories use require to avoid hoisted import references. */
/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen } from '@testing-library/react-native';

const mockIsDevBuild = jest.fn();

jest.mock('../config/variant', () => ({ isDevBuild: () => mockIsDevBuild() }));
jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return { Redirect: ({ href }: { href: string }) => <Text>Redirect:{href}</Text> };
});
jest.mock('@hugeicons/core-free-icons', () => ({ Search01Icon: [], PlayIcon: [], MoreVerticalIcon: [] }));
jest.mock('@hugeicons/react-native', () => {
  const { View } = require('react-native');
  return { HugeiconsIcon: (props: object) => <View {...props} /> };
});

import FoundationsScreen from '../../app/dev/foundations';

it('renders the static native foundations specimen in development builds', () => {
  mockIsDevBuild.mockReturnValue(true);
  render(<FoundationsScreen />);
  expect(screen.getByTestId('foundations-screen')).toBeTruthy();
  expect(screen.getByText('Foundations')).toBeTruthy();
  expect(screen.getByText('01. Visual direction')).toBeTruthy();
  expect(screen.getByText('09. Button specimens')).toBeTruthy();
  expect(screen.getByText('Implementation rule')).toBeTruthy();
});

it('redirects to the normal entry route outside development builds', () => {
  mockIsDevBuild.mockReturnValue(false);
  render(<FoundationsScreen />);
  expect(screen.getByText('Redirect:/')).toBeTruthy();
  expect(screen.queryByTestId('foundations-screen')).toBeNull();
});
