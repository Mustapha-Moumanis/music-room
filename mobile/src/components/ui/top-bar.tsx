import type { ImageProps } from 'expo-image';
import { Pressable, View, type PressableProps, type StyleProp } from 'react-native';

import { AppText } from './app-text';
import { Avatar } from './identity-status';
import { pressedFeedback } from './interaction-feedback';
import { SearchField, type SearchFieldProps } from './form-fields';
import { navigationPlaybackStyles as styles, type ChromeLayoutStyle, type TopBarState, type WebBreakpoint } from './navigation-playback-shared';

export type TopBarProps = {
  accountLabel?: string;
  accountName: string;
  avatarSource?: ImageProps['source'];
  breakpoint?: WebBreakpoint;
  initials: string;
  onAccountPress?: PressableProps['onPress'];
  searchProps?: Omit<SearchFieldProps, 'style'>;
  state?: TopBarState;
  style?: StyleProp<ChromeLayoutStyle>;
  testID?: string;
};

export function TopBar({
  accountLabel = 'Account',
  accountName,
  avatarSource,
  breakpoint = 'desktop',
  initials,
  onAccountPress,
  searchProps,
  state = 'default',
  style,
  testID,
}: TopBarProps) {
  const compact = breakpoint === 'tablet';
  const searchWidth = compact ? 360 : state === 'search' ? 430 : 340;
  const placeholder = compact
    ? 'Search songs, artists, albums...'
    : state === 'search'
      ? 'Search Music Room'
      : 'Search tracks, people, events...';

  return <View
    testID={testID}
    style={[
      style,
      styles.topBar,
      compact ? styles.tabletTopBar : styles.desktopTopBar,
    ]}
  >
    <SearchField
      {...searchProps}
      placeholder={searchProps?.placeholder ?? placeholder}
      testOnly_focused={state === 'search' || searchProps?.testOnly_focused}
      testID={testID ? `${testID}-search` : undefined}
      style={{ maxWidth: searchWidth }}
    />
    <View style={styles.topBarAccountGroup}>
      <Pressable
        accessibilityLabel={`Open ${accountName} account`}
        accessibilityRole="button"
        onPress={onAccountPress}
        testID={testID ? `${testID}-account` : undefined}
        style={({ pressed }) => [styles.topBarAccount, pressed && pressedFeedback]}
      >
        <Avatar
          initials={initials}
          size="topBar"
          source={avatarSource}
          accessibilityLabel={`${accountName} profile photo`}
          testID={testID ? `${testID}-avatar` : undefined}
        />
        <View style={styles.topBarAccountCopy}>
          <AppText variant="bodySmall" numberOfLines={1}>{accountName}</AppText>
          <AppText variant="caption" color="text.muted" numberOfLines={1}>{accountLabel}</AppText>
        </View>
      </Pressable>
    </View>
  </View>;
}
