import type { StateStorage } from 'zustand/middleware'
import { useAuthStore } from '../stores/authStore'

export const createAuthAwareStorage = (): StateStorage => ({
  getItem: (name: string): string | null => {
    return localStorage.getItem(name)
  },
  setItem: (name: string, value: string): void => {
    const { user } = useAuthStore.getState()
    // If logged in, DO NOT write to local storage
    if (user) {
      return
    }
    localStorage.setItem(name, value)
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  }
})
