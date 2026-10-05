import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_BACKEND_URL, normalizeBackendUrl } from '../config/backend';

interface SettingsState {
  backendUrl: string;
  hydrated: boolean;
  setBackendUrl: (url: string) => void;
  resetBackendUrl: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      backendUrl: DEFAULT_BACKEND_URL,
      hydrated: false,
      setBackendUrl: (url) => set({ backendUrl: normalizeBackendUrl(url) }),
      resetBackendUrl: () => set({ backendUrl: DEFAULT_BACKEND_URL }),
    }),
    {
      name: 'music-room-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ backendUrl }) => ({ backendUrl }),
      merge: (persisted, current) => {
        try {
          const saved = persisted as { backendUrl?: unknown } | undefined;
          return {
            ...current,
            backendUrl: typeof saved?.backendUrl === 'string'
              ? normalizeBackendUrl(saved.backendUrl) : DEFAULT_BACKEND_URL,
          };
        } catch {
          return current;
        }
      },
      // Release the loading screen even when storage is unavailable/corrupt.
      onRehydrateStorage: () => () => useSettingsStore.setState({ hydrated: true }),
    },
  ),
);
