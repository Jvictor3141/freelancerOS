import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { WorkspaceTheme } from '../types/freelancerProfile';

type PreferencesStore = {
  theme: WorkspaceTheme;
  setTheme: (theme: WorkspaceTheme) => void;
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'indigo',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'freelanceros-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
