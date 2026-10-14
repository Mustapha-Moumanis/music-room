import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

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

export const authUiStyles = StyleSheet.create({
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
