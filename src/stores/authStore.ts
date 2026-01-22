import { create } from 'zustand'

interface User {
  id: number
  email: string
  isAdmin: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  checkSession: () => Promise<void>
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  checkSession: async () => {
    try {
      const res = await fetch('api/auth.php?action=check')
      const data = await res.json()
      if (data && data.user) {
        set({ user: data.user })
      } else {
        set({ user: null })
      }
    } catch (e) {
      console.error('Session check failed', e)
      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },
  login: (user) => set({ user }),
  logout: () => set({ user: null })
}))
