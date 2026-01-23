import { create } from 'zustand'
import { useAuthStore } from './authStore'

export interface AppSettings {
  nodePadding: number
  minHeight: number
  heightPerNode: number
}

interface SettingsState {
  settings: AppSettings
  isLoading: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<boolean>
}

const DEFAULT_SETTINGS: AppSettings = {
  nodePadding: 5,
  minHeight: 600,
  heightPerNode: 35
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('api/settings.php')
      if (res.ok) {
        const data = await res.json()
        set({ settings: { ...DEFAULT_SETTINGS, ...data } })
      }
    } catch (e) {
      console.error('Failed to fetch settings', e)
    } finally {
      set({ isLoading: false })
    }
  },

  updateSettings: async (newSettings: Partial<AppSettings>) => {
    const currentSettings = get().settings
    const updated = { ...currentSettings, ...newSettings }
    const csrfToken = useAuthStore.getState().csrfToken

    try {
      const res = await fetch('api/settings.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify(updated)
      })

      if (res.ok) {
        set({ settings: updated })
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to update settings', e)
      return false
    }
  }
}))
