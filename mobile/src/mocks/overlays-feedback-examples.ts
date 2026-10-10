import type {
  BottomSheetOption,
  BottomSheetType,
  ModalType,
  ToastTone,
} from '../components/ui';

export const modalExamples: Array<{
  confirmLabel: string;
  description: string;
  title: string;
  type: ModalType;
}> = [
  {
    confirmLabel: 'Remove',
    description: 'This change will update for every collaborator in real time.',
    title: 'Remove this track?',
    type: 'confirm',
  },
  {
    confirmLabel: 'Send invite',
    description: 'Search friends and invite them to this playlist.',
    title: 'Invite friends',
    type: 'form',
  },
];

export const bottomSheetExamples: Array<{
  options: BottomSheetOption[];
  title: string;
  type: BottomSheetType;
}> = [
  {
    options: [
      { id: 'add', label: 'Add to playlist' },
      { id: 'save', label: 'Save track' },
      { id: 'share', label: 'Share' },
      { id: 'remove', label: 'Remove' },
    ],
    title: 'Track actions',
    type: 'actions',
  },
  {
    options: [
      { id: 'public', label: 'Public' },
      { id: 'friends', label: 'Friends only' },
      { id: 'private', label: 'Private' },
    ],
    title: 'Choose visibility',
    type: 'picker',
  },
];

export const toastExamples: Array<{
  message: string;
  tone: ToastTone;
}> = [
  { message: 'Playlist updated', tone: 'success' },
  { message: 'Nada is editing', tone: 'info' },
  { message: 'Connection failed', tone: 'error' },
];
