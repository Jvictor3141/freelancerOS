import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { WorkspaceTheme } from '../types/freelancerProfile'

type PreferencesStoreState = {
  theme: WorkspaceTheme
}

type PreferencesStoreActions = {
  setTheme: (theme: WorkspaceTheme) => void
}

export type PreferencesStore = PreferencesStoreState & PreferencesStoreActions

const preferencesStoreInitialState: PreferencesStoreState = {
  theme: 'indigo',
}

export const preferencesStoreSelectors = {
  theme: (state: PreferencesStoreState) => state.theme,
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...preferencesStoreInitialState,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'freelanceros-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
