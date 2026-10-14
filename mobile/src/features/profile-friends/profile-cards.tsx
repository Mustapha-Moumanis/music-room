import { PlayIcon } from '@hugeicons/core-free-icons';
import { Pressable, View } from 'react-native';

import { AppIcon, AppText } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { profileScreenStyles as styles } from './profile-screen.styles';

export function ProfileRecordDecoration() {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.profileRecord}>
    <View style={styles.profileRecordLabel}>
      <View style={styles.profileRecordHole} />
    </View>
  </View>;
}

export function MusicSpotlightCard({ artist, meta, onPress, title }: {
  artist: string;
  meta: string;
  onPress: () => void;
  title: string;
}) {
  return <Pressable
    accessibilityLabel={`Play ${title} by ${artist}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.musicSpotlight, pressed && pressedFeedback]}
  >
    <View style={styles.musicArtwork}>
      <View style={styles.musicRecord}>
        <View style={styles.musicRecordHole} />
      </View>
    </View>
    <View style={styles.musicSpotlightCopy}>
      <AppText variant="caption" color="action.secondary">ON REPEAT</AppText>
      <AppText variant="navigationLabel" numberOfLines={1}>{title}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={1}>{artist} · {meta}</AppText>
    </View>
    <View style={styles.musicPlayButton}>
      <AppIcon icon={PlayIcon} size="compact" tone="onAccent" />
    </View>
  </Pressable>;
}
