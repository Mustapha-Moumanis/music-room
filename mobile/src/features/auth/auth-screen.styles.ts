import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../theme';

export const authScreenStyles = StyleSheet.create({
  welcomeCopy: {
    width: '100%',
    gap: spacing[24],
  },
  accounts: {
    width: '100%',
    gap: spacing[12],
  },
  networkHint: {
    minHeight: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
  },
  networkDot: {
    width: spacing[8],
    height: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.action.secondary,
  },
  serverSummary: {
    width: '100%',
    gap: spacing[8],
    padding: spacing[16],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  preferenceChips: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[8],
  },
});
