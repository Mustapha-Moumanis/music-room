import { create } from 'zustand';

interface PlaybackState {
  hasStarted: boolean;
  playing: boolean;
  start: () => void;
  toggle: () => void;
}

export const usePlaybackStore = create<PlaybackState>()((set) => ({
  hasStarted: false,
  playing: false,
  start: () => set({ hasStarted: true, playing: true }),
  toggle: () => set((state) => state.hasStarted
    ? { playing: !state.playing }
    : state),
}));
