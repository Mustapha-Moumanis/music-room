import { View, type PressableProps, type StyleProp, type ViewProps } from 'react-native';

import { colors } from '../../theme';
import { AppText } from './app-text';
import { TextField, type TextFieldProps } from './form-fields';
import { PillAction, overlayStyles as styles, type ModalType, type OverlayLayoutStyle } from './overlay-shared';

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
