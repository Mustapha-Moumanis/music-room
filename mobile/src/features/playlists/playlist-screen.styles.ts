import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../theme';

export const removeActionWidth = 88;
export const reorderThreshold = 36;
export const reorderDistance = 88;

export const playlistScreenStyles = StyleSheet.create({
  flexCopy: { minWidth: 0, flex: 1, gap: spacing[4] },
  inlineAction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing[8] },
  communityRow: { alignSelf: 'flex-start', minWidth: 192, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  smallArtwork: { width: spacing[48], height: spacing[48], borderRadius: radius.small, backgroundColor: colors.category.secondary },
  addedArtwork: { backgroundColor: colors.action.secondary },
  note: { width: '100%', padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  playlistArtwork: { width: '100%', height: 190, overflow: 'hidden', borderRadius: radius.media, backgroundColor: colors.background.surface },
  artCircle: { position: 'absolute', left: -36, top: -18, width: 220, height: 220, borderRadius: radius.full, backgroundColor: colors.background.app },
  artCard: { position: 'absolute', right: 24, bottom: 20, width: 192, height: 116, borderRadius: radius.medium, backgroundColor: colors.action.primary },
  artTape: { position: 'absolute', right: 48, top: 18, width: 127, height: 56, backgroundColor: colors.text.primary, transform: [{ rotate: '5deg' }] },
  compactActions: { width: '100%', flexDirection: 'row', gap: spacing[8] },
  homeActions: { width: '100%', flexDirection: 'row', gap: spacing[12] },
  flexButton: { flex: 1 },
  editorTools: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  swipeTrack: { width: '100%', minHeight: 72, overflow: 'hidden', borderRadius: radius.medium, backgroundColor: colors.background.surface },
  draggingTrack: { zIndex: 20, opacity: 0.94 },
  swipeForeground: { width: '100%', minHeight: 72, backgroundColor: colors.background.surface },
  removeAction: { position: 'absolute', top: 0, right: 0, bottom: 0, width: removeActionWidth, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.action.primary },
  optionGroup: { width: '100%', gap: spacing[8] },
  searchResult: { width: '100%', minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  disabledResult: { opacity: 0.55 },
  resultStatus: { minWidth: 82, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  memberRow: { width: '100%', minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  rolePill: { paddingHorizontal: spacing[12], paddingVertical: spacing[8], borderRadius: radius.full, backgroundColor: colors.category.secondary },
  inviteUsername: { width: '100%', minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[16], borderRadius: radius.medium, backgroundColor: colors.background.surface },
});
