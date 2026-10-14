import type {
  BottomSheetOption,
  BottomSheetType,
  ModalType,
  ToastTone,
} from '../components/ui';
import examples from '../content/dev-examples.json';

export const modalExamples = examples.overlays.modals as {
  confirmLabel: string;
  description: string;
  title: string;
  type: ModalType;
}[];

export const bottomSheetExamples = examples.overlays.bottomSheets as {
  options: BottomSheetOption[];
  title: string;
  type: BottomSheetType;
}[];

export const toastExamples = examples.overlays.toasts as {
  message: string;
  tone: ToastTone;
}[];
