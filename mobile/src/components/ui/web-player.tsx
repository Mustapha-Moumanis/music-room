import { HeartIcon, NextIcon, PauseIcon, PreviousIcon, Queue01Icon, RepeatIcon, ShuffleIcon, VolumeHighIcon } from '@hugeicons/core-free-icons';
import type { ImageProps } from 'expo-image';
import { View, type StyleProp } from 'react-native';

import { AppText } from './app-text';
import { IconControl, PlayerArtwork, navigationPlaybackStyles as styles, percentage, type ChromeLayoutStyle, type PlayerAction, type WebBreakpoint } from './navigation-playback-shared';

const defaultWebPlayerArtwork = require('../../../assets/images/web-player-artwork.jpg') as number;

export type WebPlayerProps = {
  artist: string;
  artworkSource?: ImageProps['source'];
  breakpoint?: WebBreakpoint;
  currentTime?: string;
  duration?: string;
  onAction?: (action: PlayerAction) => void;
  progress?: number;
  style?: StyleProp<ChromeLayoutStyle>;
  testID?: string;
  title: string;
  volume?: number;
};

export function WebPlayer({
  artist,
  artworkSource = defaultWebPlayerArtwork,
  breakpoint = 'desktop',
  currentTime = '1:42',
  duration = '3:56',
  onAction,
  progress = 0.43,
  style,
  testID,
  title,
  volume = 0.68,
}: WebPlayerProps) {
  const compact = breakpoint === 'tablet';

  return <View
    testID={testID}
    style={[
      style,
      styles.webPlayer,
      compact ? styles.tabletWebPlayer : styles.desktopWebPlayer,
    ]}
  >
    <View style={[styles.webTrackInfo, compact ? styles.tabletTrackInfo : styles.desktopTrackInfo]}>
      <PlayerArtwork
        size={52}
        source={artworkSource}
        testID={testID ? `${testID}-artwork` : undefined}
      />
      <View style={[styles.webTrackCopy, compact ? styles.tabletTrackCopy : styles.desktopTrackCopy]}>
        <AppText variant="bodySmall" numberOfLines={1}>{title}</AppText>
        <AppText variant="caption" color="text.muted" numberOfLines={1}>{artist}</AppText>
      </View>
      <IconControl
        action="favorite"
        icon={HeartIcon}
        label="Favorite track"
        onAction={onAction}
        testID={testID ? `${testID}-favorite` : undefined}
      />
    </View>

    <View style={[styles.webTransport, compact ? styles.tabletTransport : styles.desktopTransport]}>
      <View style={styles.webControls}>
        <IconControl action="shuffle" icon={ShuffleIcon} label="Shuffle" onAction={onAction} testID={testID ? `${testID}-shuffle` : undefined} />
        <IconControl action="previous" icon={PreviousIcon} label="Previous track" onAction={onAction} testID={testID ? `${testID}-previous` : undefined} />
        <IconControl action="playPause" icon={PauseIcon} label="Pause track" onAction={onAction} primary testID={testID ? `${testID}-play-pause` : undefined} />
        <IconControl action="next" icon={NextIcon} label="Next track" onAction={onAction} testID={testID ? `${testID}-next` : undefined} />
        <IconControl action="repeat" icon={RepeatIcon} label="Repeat" onAction={onAction} testID={testID ? `${testID}-repeat` : undefined} />
      </View>
      <View style={[styles.webProgressGroup, compact ? styles.tabletProgressGroup : styles.desktopProgressGroup]}>
        <View testID={testID ? `${testID}-progress` : undefined} style={styles.webProgress}>
          <View style={[styles.webElapsed, { width: percentage(progress) }]} />
        </View>
        <View style={styles.webTimes}>
          <AppText variant="caption" color="text.muted">{currentTime}</AppText>
          <AppText variant="caption" color="text.muted">{duration}</AppText>
        </View>
      </View>
    </View>

    <View style={[styles.webUtilities, compact ? styles.tabletUtilities : styles.desktopUtilities]}>
      <IconControl action="queue" icon={Queue01Icon} label="Open queue" onAction={onAction} testID={testID ? `${testID}-queue` : undefined} />
      <IconControl action="volume" icon={VolumeHighIcon} label="Volume" onAction={onAction} testID={testID ? `${testID}-volume` : undefined} />
      <View
        testID={testID ? `${testID}-volume-track` : undefined}
        style={[styles.volumeTrack, compact ? styles.tabletVolume : styles.desktopVolume]}
      >
        <View style={[styles.volumeLevel, { width: percentage(volume) }]} />
      </View>
    </View>
  </View>;
}
