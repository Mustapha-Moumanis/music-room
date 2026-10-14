import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Image } from 'expo-image';
import type { PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon, AppScreen, AppText } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { spacing } from '../../theme';
import { authUiStyles as styles } from './auth-ui.styles';

const cassetteArtwork = require('../../../assets/images/auth/cassette-artwork.jpg');

export function AuthScreen({
  children,
  compact = false,
  testID,
}: PropsWithChildren<{ compact?: boolean; testID: string }>) {
  return <AppScreen
    scrollable
    testID={testID}
    contentContainerStyle={[styles.screen, compact && styles.compactScreen]}
  >
    <View style={[styles.screenContent, compact && styles.compactContent]}>{children}</View>
  </AppScreen>;
}

export function AuthBackHeader({ label = 'Back', onPress }: { label?: string; onPress: () => void }) {
  return <Pressable
    accessibilityLabel={`Go back to ${label}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.backHeader, pressed && pressedFeedback]}
  >
    <AppIcon icon={ArrowLeft01Icon} size="compact" />
    <AppText variant="navigationLabel" color="text.secondary">{label}</AppText>
  </Pressable>;
}

export function AuthTitle({ eyebrow, title, description }: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return <View style={styles.titleBlock}>
    <AppText variant="navigationLabel" color="action.primary">{eyebrow}</AppText>
    <AppText variant="h2">{title}</AppText>
    {description ? <AppText variant="bodySmall" color="text.secondary">{description}</AppText> : null}
  </View>;
}

export function AuthFooterLink({ before, action, onPress }: {
  before: string;
  action: string;
  onPress: () => void;
}) {
  return <View style={styles.footerLink}>
    <AppText variant="bodySmall" color="text.muted">{before}</AppText>
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      hitSlop={spacing[8]}
      style={({ pressed }) => pressed && pressedFeedback}
    >
      <AppText variant="navigationLabel" color="action.secondary">{action}</AppText>
    </Pressable>
  </View>;
}

export function AuthBrand() {
  return <View style={styles.brand}>
    <View style={styles.brandMark} />
    <AppText variant="h5">Music Room</AppText>
  </View>;
}

export function CassetteArtwork() {
  return <View style={styles.artworkFrame}>
    <Image source={cassetteArtwork} contentFit="fill" accessible={false} style={styles.artworkImage} />
  </View>;
}

export function ProviderButton({ onPress }: { onPress: () => void }) {
  return <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.providerButton, pressed && pressedFeedback]}
  >
    <AppText variant="buttonLabel">G</AppText>
    <AppText variant="buttonLabel">Continue with Google</AppText>
  </Pressable>;
}

export function AuthDivider() {
  return <View style={styles.divider}>
    <View style={styles.dividerLine} />
    <AppText variant="caption" color="text.muted">or</AppText>
    <View style={styles.dividerLine} />
  </View>;
}
