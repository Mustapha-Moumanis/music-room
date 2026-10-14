import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../theme';

export const profileFriendsStyles = StyleSheet.create({
  form: {
    width: '100%',
    gap: spacing[16],
  },
  chips: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[8],
  },
  spacer: {
    minHeight: spacing[24],
    flexGrow: 1,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing[12],
  },
  centered: {
    textAlign: 'center',
  },
});

export const profileFriendsInternalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.app,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 430,
    minHeight: 1,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: colors.background.app,
  },
  scroll: {
    flex: 1,
  },
  body: {
    width: '100%',
    minHeight: '100%',
    flexGrow: 1,
    alignItems: 'stretch',
    gap: spacing[16],
    padding: spacing[16],
  },
  header: {
    width: '100%',
    height: spacing[48],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    minWidth: 1,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -10,
  },
  rootHeaderLeft: {
    marginLeft: 0,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    minWidth: 1,
    flexShrink: 1,
  },
  visibilityRow: {
    width: '100%',
    height: spacing[64],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  visibilityCopy: {
    minWidth: 1,
    flex: 1,
  },
  visibilityBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  informationRow: {
    width: '100%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[12],
    paddingVertical: 10,
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  compactInformationRow: {
    minHeight: 54,
  },
  informationCopy: {
    minWidth: 1,
    flex: 1,
  },
  sectionHeading: {
    width: '100%',
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stats: {
    width: '100%',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[16],
  },
  iconNote: {
    width: '100%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    padding: spacing[12],
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
  },
  noteCopy: {
    minWidth: 1,
    flex: 1,
  },
});
