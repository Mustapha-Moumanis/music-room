import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { colors, layout, radius, spacing, type SemanticColorRole } from '../../theme';
import { AppIcon } from './app-icon';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';
import { TextField, type TextFieldProps } from './form-fields';

export type OverlayLayoutStyle = Pick<
  ViewStyle,
  'width' | 'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type ModalType = 'confirm' | 'form';
export type BottomSheetType = 'actions' | 'picker';
export type ToastTone = 'success' | 'info' | 'error';

type PillActionProps = {
  backgroundColor: string;
  color: SemanticColorRole;
  label: string;
  onPress?: PressableProps['onPress'];
  testID?: string;
};

function PillAction({
  backgroundColor,
  color,
  label,
  onPress,
  testID,
}: PillActionProps) {
  return <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    onPress={onPress}
    testID={testID}
    style={({ pressed }) => [styles.pillHitTarget, pressed && pressedFeedback]}
  >
    <View
      testID={testID ? `${testID}-pill` : undefined}
      style={[styles.pill, { backgroundColor }]}
    >
      <AppText variant="caption" color={color}>{label}</AppText>
    </View>
  </Pressable>;
}

export type ModalProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  inputProps?: Omit<TextFieldProps, 'label' | 'style'>;
  onCancel?: PressableProps['onPress'];
  onConfirm?: PressableProps['onPress'];
  style?: StyleProp<OverlayLayoutStyle>;
  title: string;
  type?: ModalType;
};

export function Modal({
  cancelLabel = 'Cancel',
  confirmLabel,
  description,
  inputProps,
  onCancel,
  onConfirm,
  style,
  testID,
  title,
  type = 'confirm',
  ...viewProps
}: ModalProps) {
  const isForm = type === 'form';

  return <View
    {...viewProps}
    accessible={false}
    accessibilityViewIsModal
    testID={testID}
    style={[style, styles.modal, isForm ? styles.formModal : styles.confirmModal]}
  >
    <AppText accessibilityRole="header" variant="h4">{title}</AppText>
    <AppText variant="bodySmall" color="text.secondary" style={styles.modalDescription}>
      {description}
    </AppText>
    {isForm ? <TextField
      {...inputProps}
      label=""
      placeholder={inputProps?.placeholder ?? 'Search friends...'}
      testID={testID ? `${testID}-input` : undefined}
    /> : null}
    <View style={styles.modalActions}>
      <PillAction
        backgroundColor={colors.background.app}
        color="text.secondary"
        label={cancelLabel}
        onPress={onCancel}
        testID={testID ? `${testID}-cancel` : undefined}
      />
      <PillAction
        backgroundColor={colors.action.primary}
        color="text.onAccent"
        label={confirmLabel}
        onPress={onConfirm}
        testID={testID ? `${testID}-confirm` : undefined}
      />
    </View>
  </View>;
}

export type BottomSheetOption = {
  id: string;
  label: string;
};

export type BottomSheetProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  onOptionPress?: (option: BottomSheetOption) => void;
  options: BottomSheetOption[];
  style?: StyleProp<OverlayLayoutStyle>;
  title: string;
  type?: BottomSheetType;
};

export function BottomSheet({
  onOptionPress,
  options,
  style,
  testID,
  title,
  type = 'actions',
  ...viewProps
}: BottomSheetProps) {
  return <View
    {...viewProps}
    accessible={false}
    accessibilityViewIsModal
    testID={testID}
    style={[
      style,
      styles.bottomSheet,
      type === 'picker' ? styles.pickerSheet : styles.actionsSheet,
    ]}
  >
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID ? `${testID}-handle` : undefined}
      style={styles.sheetHandle}
    />
    <AppText variant="h5">{title}</AppText>
    {options.map((option) => <Pressable
      key={option.id}
      accessibilityLabel={option.label}
      accessibilityRole="button"
      onPress={() => onOptionPress?.(option)}
      testID={testID ? `${testID}-option-${option.id}` : undefined}
      style={({ pressed }) => [styles.sheetOption, pressed && pressedFeedback]}
    >
      <AppText numberOfLines={1} style={styles.sheetOptionLabel}>{option.label}</AppText>
      <AppIcon icon={ArrowRight01Icon} size="compact" tone="muted" />
    </Pressable>)}
  </View>;
}

export type ToastProps = Omit<
  ViewProps,
  'accessibilityLabel' | 'accessibilityRole' | 'children' | 'style'
> & {
  message: string;
  style?: StyleProp<OverlayLayoutStyle>;
  tone?: ToastTone;
};

const toastBackgrounds: Record<ToastTone, string> = {
  success: colors.action.secondary,
  info: colors.background.surface,
  error: colors.category.secondary,
};

const toastColors: Record<ToastTone, SemanticColorRole> = {
  success: 'text.onAccent',
  info: 'text.primary',
  error: 'text.primary',
};

const toastSymbols: Record<ToastTone, string> = {
  success: '✓',
  info: 'i',
  error: '!',
};

export function Toast({
  message,
  style,
  testID,
  tone = 'success',
  ...viewProps
}: ToastProps) {
  const color = toastColors[tone];

  return <View
    {...viewProps}
    accessible
    accessibilityLabel={message}
    accessibilityLiveRegion="polite"
    accessibilityRole="alert"
    testID={testID}
    style={[style, styles.toast, { backgroundColor: toastBackgrounds[tone] }]}
  >
    <AppText
      variant="navigationLabel"
      color={color}
      testID={testID ? `${testID}-symbol` : undefined}
    >
      {toastSymbols[tone]}
    </AppText>
    <AppText
      variant="bodySmall"
      color={color}
      numberOfLines={1}
      style={styles.toastCopy}
    >
      {message}
    </AppText>
  </View>;
}

const styles = StyleSheet.create({
  pillHitTarget: {
    minWidth: layout.minimumTouchTarget,
    height: layout.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    height: spacing[32],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.full,
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'stretch',
    gap: spacing[16],
    padding: spacing[24],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
  },
  confirmModal: {
    height: 250,
  },
  formModal: {
    height: 360,
  },
  modalDescription: {
    width: '100%',
  },
  modalActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: spacing[8],
    overflow: 'hidden',
  },
  bottomSheet: {
    width: '100%',
    maxWidth: 390,
    alignItems: 'stretch',
    gap: spacing[16],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[12],
    paddingBottom: spacing[24],
    borderTopLeftRadius: radius.media,
    borderTopRightRadius: radius.media,
    backgroundColor: colors.background.surface,
  },
  actionsSheet: {
    height: 280,
  },
  pickerSheet: {
    height: 360,
  },
  sheetHandle: {
    width: layout.minimumTouchTarget,
    height: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.text.muted,
  },
  sheetOption: {
    width: '100%',
    maxWidth: 358,
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[12],
    overflow: 'hidden',
  },
  sheetOptionLabel: {
    minWidth: 0,
    flex: 1,
  },
  toast: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius.medium,
  },
  toastCopy: {
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
  },
});

