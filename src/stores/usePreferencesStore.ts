import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  isSupportedCurrency,
  type CurrencyCode,
} from '../i18n/config'
import type { HeaderNotificationType } from '../components/headerNotificationsModel'
import type { WorkspaceTheme } from '../types/freelancerProfile'

type PreferencesStoreState = {
  theme: WorkspaceTheme
  defaultCurrency: CurrencyCode
  disabledNotificationTypes: HeaderNotificationType[]
}

type PreferencesStoreActions = {
  setTheme: (theme: WorkspaceTheme) => void
  setDefaultCurrency: (currency: CurrencyCode) => void
  toggleNotificationType: (type: HeaderNotificationType) => void
}

export type PreferencesStore = PreferencesStoreState & PreferencesStoreActions

const preferencesStoreInitialState: PreferencesStoreState = {
  theme: 'indigo',
  defaultCurrency: 'BRL',
  disabledNotificationTypes: [],
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...preferencesStoreInitialState,
      setTheme: (theme) => set({ theme }),
      setDefaultCurrency: (defaultCurrency) => set({ defaultCurrency }),
      toggleNotificationType: (type) =>
        set((state) => ({
          disabledNotificationTypes: state.disabledNotificationTypes.includes(
            type,
          )
            ? state.disabledNotificationTypes.filter((t) => t !== type)
            : [...state.disabledNotificationTypes, type],
        })),
    }),
    {
      name: 'freelanceros-preferences',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PreferencesStoreState> | null
        const persistedCurrency = persisted?.defaultCurrency
        const defaultCurrency: CurrencyCode =
          persistedCurrency && isSupportedCurrency(persistedCurrency)
            ? persistedCurrency
            : currentState.defaultCurrency

        return {
          ...currentState,
          ...persisted,
          defaultCurrency,
        }
      },
    },
  ),
)
