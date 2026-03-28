import { create } from 'zustand'

export type RealtimeSnapshotKey = 'dashboard' | 'clientDetails'

type RealtimeInvalidationState = {
  versions: Record<RealtimeSnapshotKey, number>
  bump: (keys: RealtimeSnapshotKey | RealtimeSnapshotKey[]) => void
  reset: () => void
}

const realtimeInvalidationInitialState: Pick<
  RealtimeInvalidationState,
  'versions'
> = {
  versions: {
    dashboard: 0,
    clientDetails: 0,
  },
}

export const useRealtimeInvalidationStore =
  create<RealtimeInvalidationState>((set) => ({
    ...realtimeInvalidationInitialState,

    bump: (keys) => {
      const invalidationKeys = Array.isArray(keys) ? keys : [keys]

      set((state) => ({
        versions: invalidationKeys.reduce(
          (nextVersions, key) => ({
            ...nextVersions,
            [key]: nextVersions[key] + 1,
          }),
          state.versions,
        ),
      }))
    },

    reset: () => {
      set(realtimeInvalidationInitialState)
    },
  }))
