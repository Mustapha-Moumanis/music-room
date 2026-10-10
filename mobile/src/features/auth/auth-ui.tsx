import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Image } from 'expo-image';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import {
  AppScreen,
  AppIcon,
  AppText,
  Avatar,
  Button,
} from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import { colors, radius, spacing, typography } from '../../theme';

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

export type AuthStatusTone = 'pending' | 'success';

export function AuthStatusCard({ icon, title, description, tone = 'success' }: {
  icon: string;
  title: string;
  description: string;
  tone?: AuthStatusTone;
}) {
  return <View style={styles.statusCard}>
    <View style={[styles.statusIcon, tone === 'pending' ? styles.pendingIcon : styles.successIcon]}>
      <AppText variant="h4" color={tone === 'pending' ? 'text.primary' : 'text.onAccent'}>{icon}</AppText>
    </View>
    <AppText variant="h4" style={styles.centeredText}>{title}</AppText>
    <AppText variant="bodySmall" color="text.secondary" style={styles.statusDescription}>{description}</AppText>
  </View>;
}

export function AuthNotice({ label, children }: PropsWithChildren<{ label: string }>) {
  return <View style={styles.notice}>
    <AppText variant="navigationLabel">{label}</AppText>
    <AppText variant="bodySmall" color="text.secondary">{children}</AppText>
  </View>;
}

export function AccountRow({ initials, name, email, onPress }: {
  initials: string;
  name: string;
  email: string;
  onPress: () => void;
}) {
  return <Pressable
    accessibilityLabel={`Continue as ${name}, ${email}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.accountRow, pressed && pressedFeedback]}
  >
    <Avatar initials={initials} size="medium" />
    <View style={styles.accountCopy}>
      <AppText variant="navigationLabel" numberOfLines={1}>{name}</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={1}>{email}</AppText>
    </View>
    <AppText variant="h5" color="text.muted">›</AppText>
  </Pressable>;
}

export function OnboardingProgress({ step }: { step: 1 | 2 }) {
  return <View style={styles.progressBlock}>
    <View style={styles.progressLabels}>
      <AppText variant="caption" color="text.muted">Account</AppText>
      <AppText variant="caption" color={step === 1 ? 'action.primary' : 'text.muted'}>Music taste</AppText>
      <AppText variant="caption" color={step === 2 ? 'action.primary' : 'text.muted'}>Profile</AppText>
    </View>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, step === 1 ? styles.progressStepOne : styles.progressStepTwo]} />
    </View>
  </View>;
}

export function AuthTextArea({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.textAreaField}>
    <AppText variant="bodySmall" color="text.secondary">{label}</AppText>
    <TextInput
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
      multiline
      cursorColor={colors.action.secondary}
      placeholderTextColor={colors.text.muted}
      selectionColor={colors.action.secondary}
      textAlignVertical="top"
      style={styles.textArea}
      underlineColorAndroid="transparent"
    />
  </View>;
}

export function AvatarUpload({ onPress }: { onPress: () => void }) {
  return <View style={styles.avatarUpload}>
    <Avatar initials="SH" size="large" />
    <View style={styles.avatarCopy}>
      <AppText variant="navigationLabel">Profile photo</AppText>
      <AppText variant="caption" color="text.muted" numberOfLines={2}>Optional · add or change this later</AppText>
    </View>
    <Button variant="ghost" onPress={onPress} style={styles.addPhotoButton}>Add photo</Button>
  </View>;
}

export function AuthActionStack({ children }: { children: ReactNode }) {
  return <View style={styles.actionStack}>{children}</View>;
}

export const authStyles = StyleSheet.create({
  form: {
    width: '100%',
    gap: spacing[16],
  },
  actions: {
    width: '100%',
    gap: spacing[12],
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing[24],
  },
  linkButton: {
    alignSelf: 'flex-start',
    minHeight: 20,
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing[24],
    paddingBottom: spacing[24],
    alignItems: 'center',
  },
  compactScreen: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  screenContent: {
    width: '100%',
    maxWidth: 358,
    flexGrow: 1,
    gap: spacing[24],
  },
  compactContent: {
    gap: spacing[16],
  },
  backHeader: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
  },
  titleBlock: {
    width: '100%',
    gap: spacing[8],
  },
  footerLink: {
    width: '100%',
    minHeight: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.action.primary,
  },
  artworkFrame: {
    width: '100%',
    height: 260,
    overflow: 'hidden',
    borderRadius: radius.media,
  },
  artworkImage: {
    position: 'absolute',
    width: '100%',
    height: '245.64%',
    top: '-57.1%',
  },
  providerButton: {
    width: '100%',
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[12],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
    backgroundColor: colors.background.app,
  },
  divider: {
    width: '100%',
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: colors.border.subtle,
  },
  statusCard: {
    width: '100%',
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[16],
    padding: spacing[24],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  statusIcon: {
    width: spacing[64],
    height: spacing[64],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  pendingIcon: {
    backgroundColor: colors.action.primary,
  },
  successIcon: {
    backgroundColor: colors.action.secondary,
  },
  centeredText: {
    textAlign: 'center',
  },
  statusDescription: {
    width: '100%',
    textAlign: 'left',
  },
  notice: {
    width: '100%',
    gap: spacing[8],
    padding: spacing[16],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  accountRow: {
    width: '100%',
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[16],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  accountCopy: {
    minWidth: 1,
    flex: 1,
    gap: spacing[4],
  },
  progressBlock: {
    width: '100%',
    gap: spacing[8],
  },
  progressLabels: {
    width: '100%',
    height: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTrack: {
    width: '100%',
    height: spacing[4],
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.border.subtle,
  },
  progressFill: {
    height: spacing[4],
    borderRadius: radius.full,
  },
  progressStepOne: {
    width: '66.5%',
    backgroundColor: colors.action.primary,
  },
  progressStepTwo: {
    width: '100%',
    backgroundColor: colors.action.secondary,
  },
  textAreaField: {
    width: '100%',
    gap: spacing[8],
  },
  textArea: {
    ...typography.body,
    width: '100%',
    height: 88,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
    backgroundColor: colors.background.app,
    color: colors.text.primary,
    outlineWidth: 0,
  },
  avatarUpload: {
    width: '100%',
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[16],
    padding: spacing[12],
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  avatarCopy: {
    minWidth: 1,
    flex: 1,
    gap: spacing[4],
  },
  addPhotoButton: {
    width: 110,
  },
  actionStack: {
    width: '100%',
    gap: spacing[12],
  },
});
