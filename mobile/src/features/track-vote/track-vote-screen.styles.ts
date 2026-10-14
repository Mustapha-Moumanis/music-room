import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../theme';

export const eventScreenStyles = StyleSheet.create({
  flexCopy: { minWidth: 0, flex: 1, gap: spacing[4] },
  flexButton: { flex: 1 },
  eventType: { width: '100%', minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[16], borderRadius: radius.medium, backgroundColor: colors.background.surface },
  upcomingCard: {
    width: '100%', minHeight: 90, flexDirection: 'row', alignItems: 'center', gap: spacing[12],
    padding: spacing[12], borderWidth: 1, borderColor: colors.border.subtle,
    borderRadius: radius.medium, backgroundColor: colors.background.surface,
  },
  upcomingArtwork: { width: spacing[64], height: spacing[64], borderRadius: radius.small, backgroundColor: colors.category.secondary },
  eventHero: { width: '100%', height: 180, overflow: 'hidden', borderRadius: radius.media, backgroundColor: colors.background.surface },
  heroCircle: { position: 'absolute', left: 20, bottom: 30, width: 88, height: 88, borderRadius: radius.full, backgroundColor: colors.action.secondary },
  heroCard: { position: 'absolute', right: 22, bottom: 24, width: 190, height: 112, borderRadius: radius.medium, backgroundColor: colors.action.primary },
  heroTape: { position: 'absolute', right: 56, top: 24, width: 120, height: 48, backgroundColor: colors.text.primary, transform: [{ rotate: '5deg' }] },
  infoLine: { width: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing[12] },
  infoDot: { width: spacing[12], height: spacing[12], borderRadius: radius.full, borderWidth: 2, borderColor: colors.text.primary },
  nowPlaying: { alignSelf: 'flex-start', minWidth: 208, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.card, backgroundColor: colors.background.surface },
  nowPlayingArtwork: { width: 56, height: 56, borderRadius: radius.small, backgroundColor: colors.action.secondary },
  ownerControls: { width: '100%', flexDirection: 'row', gap: spacing[8] },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: spacing[24], backgroundColor: 'rgba(0, 0, 0, 0.68)' },
  confirmDialog: { width: '100%', maxWidth: 382, alignSelf: 'center', gap: spacing[16], padding: spacing[24], borderRadius: radius.card, backgroundColor: colors.background.surface },
  confirmActions: { width: '100%', flexDirection: 'row', gap: spacing[8] },
  friendCard: { width: '100%', minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[16], borderRadius: radius.card, backgroundColor: colors.background.surface },
  invitePill: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing[12], borderRadius: radius.full, backgroundColor: colors.background.app },
  invitePillSelected: { backgroundColor: colors.category.secondary },
  trackChoice: { width: '100%', borderWidth: 2, borderColor: 'transparent', borderRadius: radius.medium, overflow: 'hidden' },
  trackChoiceSelected: { borderColor: colors.action.secondary, backgroundColor: colors.background.surface },
  restrictionNotice: { width: '100%', minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: spacing[12], padding: spacing[12], borderRadius: radius.medium, backgroundColor: colors.background.surface },
});
