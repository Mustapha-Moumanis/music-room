import type { ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { AppText, Avatar, Button } from '../../components/ui';
import { colors } from '../../theme';
import { authUiStyles as styles } from './auth-ui.styles';

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
