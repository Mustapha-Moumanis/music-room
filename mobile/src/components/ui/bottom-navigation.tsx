import { Calendar03Icon, Home01Icon, Playlist01Icon, UserGroupIcon, UserIcon } from '@hugeicons/core-free-icons';
import { Pressable, View, type StyleProp } from 'react-native';

import { AppIcon, type AppIconData } from './app-icon';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';
import { navigationPlaybackStyles as styles, type ChromeLayoutStyle, type MobileNavigationDestination } from './navigation-playback-shared';

const mobileNavigationItems: {
  icon: AppIconData;
  label: string;
  value: MobileNavigationDestination;
}[] = [
  { icon: Home01Icon, label: 'Home', value: 'home' },
  { icon: Calendar03Icon, label: 'Events', value: 'events' },
  { icon: Playlist01Icon, label: 'Playlists', value: 'playlists' },
  { icon: UserGroupIcon, label: 'Friends', value: 'friends' },
  { icon: UserIcon, label: 'Profile', value: 'profile' },
];

export type BottomNavigationProps = {
  active?: MobileNavigationDestination;
  onNavigate?: (destination: MobileNavigationDestination) => void;
  style?: StyleProp<ChromeLayoutStyle>;
  testID?: string;
};

export function BottomNavigation({
  active = 'home',
  onNavigate,
  style,
  testID,
}: BottomNavigationProps) {
  return <View
    accessibilityRole="tablist"
    testID={testID}
    style={[style, styles.bottomNavigation]}
  >
    {mobileNavigationItems.map((item) => {
      const selected = active === item.value;
      return <Pressable
        key={item.value}
        accessibilityLabel={item.label}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        onPress={() => onNavigate?.(item.value)}
        testID={testID ? `${testID}-${item.value}` : undefined}
        style={({ pressed }) => [styles.bottomNavigationItem, pressed && pressedFeedback]}
      >
        <AppIcon icon={item.icon} size="standard" tone={selected ? 'default' : 'muted'} />
        <AppText variant="caption" color={selected ? 'text.primary' : 'text.muted'}>
          {item.label}
        </AppText>
        <View
          testID={testID ? `${testID}-${item.value}-indicator` : undefined}
          style={[styles.mobileIndicator, !selected && styles.hiddenIndicator]}
        />
      </Pressable>;
    })}
  </View>;
}
