import { create } from 'zustand'

interface User {
  id: number
  email: string
  isAdmin: boolean
}

interface AuthState {
  user: User | null
  csrfToken: string | null
  isLoading: boolean
  checkSession: () => Promise<void>
  login: (user: User, csrfToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  csrfToken: null,
  isLoading: true,
  checkSession: async () => {
    try {
      const res = await fetch('api/auth.php?action=check')
      const data = await res.json()
      if (data && data.user) {
        set({ user: data.user, csrfToken: data.csrfToken || null })
      } else {
        set({ user: null, csrfToken: null })
      }
    } catch (e) {
      console.error('Session check failed', e)
      set({ user: null, csrfToken: null })
    } finally {
      set({ isLoading: false })
    }
  },
  login: (user, csrfToken) => set({ user, csrfToken }),
  logout: () => {
    fetch('api/auth.php?action=logout').catch(console.error)
    set({ user: null, csrfToken: null })
  }
}))
