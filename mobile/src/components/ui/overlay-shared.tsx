import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from 'react-native';

import { colors, layout, radius, spacing, type SemanticColorRole } from '../../theme';
import { AppText } from './app-text';
import { pressedFeedback } from './interaction-feedback';

export type OverlayLayoutStyle = Pick<
  ViewStyle,
  'width' | 'minWidth' | 'maxWidth' | 'alignSelf' | 'flex' | 'flexGrow' | 'flexShrink' | 'flexBasis'
>;

export type ModalType = 'confirm' | 'form';
export type BottomSheetType = 'actions' | 'picker';
export type ToastTone = 'success' | 'info' | 'error';

export type PillActionProps = {
  backgroundColor: string;
  color: SemanticColorRole;
  label: string;
  onPress?: PressableProps['onPress'];
  testID?: string;
};

export function PillAction({
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
    style={({ pressed }) => [overlayStyles.pillHitTarget, pressed && pressedFeedback]}
  >
    <View
      testID={testID ? `${testID}-pill` : undefined}
      style={[overlayStyles.pill, { backgroundColor }]}
    >
      <AppText variant="caption" color={color}>{label}</AppText>
    </View>
  </Pressable>;
}

export const overlayStyles = StyleSheet.create({
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
