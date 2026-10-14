import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../../theme';

export const eventScheduleStyles = StyleSheet.create({
  fields: {
    width: '100%',
    gap: spacing[16],
  },
  triggerAnchor: {
    width: '100%',
  },
  scheduleGroup: {
    width: '100%',
    gap: spacing[8],
  },
  pickerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[8],
  },
  datePicker: {
    minWidth: 0,
    flex: 1.45,
  },
  timePicker: {
    minWidth: 0,
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    overflow: 'hidden',
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
    elevation: 8,
  },
  searchWrap: {
    padding: spacing[4],
  },
  optionsScroll: {
    flex: 1,
  },
  option: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.small,
  },
  customOption: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  selectedOption: {
    backgroundColor: colors.background.app,
  },
  optionCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
});
