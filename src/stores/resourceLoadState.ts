export type ResourceLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export function isResourcePending(status: ResourceLoadStatus) {
  return status === 'idle' || status === 'loading'
}

export function hasResourceLoadError(status: ResourceLoadStatus) {
  return status === 'error'
}

export function isResourceReady(status: ResourceLoadStatus) {
  return status === 'ready'
}
