/// <reference lib="webworker" />

interface SyncMessage {
  type: 'SYNC'
  payload: any
  csrfToken: string
  url: string
}

self.onmessage = async (e: MessageEvent<SyncMessage>) => {
  const { type, payload, csrfToken, url } = e.data

  if (type === 'SYNC') {
    try {
      // Serialize on the worker thread (off-main-thread)
      const body = JSON.stringify(payload)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body
      })

      if (!response.ok) {
        throw new Error(`Sync failed with status: ${response.status}`)
      }

      // We don't necessarily need the response body for sync-up,
      // but if we did, we could process it here.
      // Usually sync.php returns the updated state or just success.
      // Looking at useCloudSync.ts, the POST request doesn't seem to use the response data
      // to update the store immediately (it just catches errors).
      // The store update happens on GET (initial mount).

      self.postMessage({ type: 'SUCCESS' })
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
}

export {}
