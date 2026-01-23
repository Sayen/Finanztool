import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createAuthAwareStorage } from '../lib/storage'

export type Frequency = 'monthly' | 'yearly'
export type ItemType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  type: ItemType
  parentId?: string
  color?: string
}

export interface BudgetItem {
  id: string
  name: string
  amount: number
  frequency: Frequency
  categoryId?: string
}

export interface BudgetConfig {
  id: string
  name: string
  incomes: BudgetItem[]
  expenses: BudgetItem[]
  categories: Category[]
  createdAt: string
  updatedAt: string
}

export interface BudgetState {
  configs: BudgetConfig[]
  currentConfigId: string | null

  // Meta Actions
  createConfig: (name: string) => void
  switchConfig: (id: string) => void
  renameConfig: (id: string, name: string) => void
  deleteConfig: (id: string) => void
  duplicateConfig: (id: string) => void

  // Data Actions (operate on current config)
  addIncome: (item: Omit<BudgetItem, 'id'>) => void
  removeIncome: (id: string) => void
  updateIncome: (id: string, item: Partial<BudgetItem>) => void

  addExpense: (item: Omit<BudgetItem, 'id'>) => void
  removeExpense: (id: string) => void
  updateExpense: (id: string, item: Partial<BudgetItem>) => void

  addCategory: (category: Omit<Category, 'id'>) => void
  removeCategory: (id: string) => void
  updateCategory: (id: string, category: Partial<Category>) => void

  // Bulk Import/Export
  importData: (data: { incomes: BudgetItem[], expenses: BudgetItem[], categories: Category[] }) => void
  setConfigs: (configs: BudgetConfig[]) => void
  exportData: () => string

  // Selectors
  getCurrentConfig: () => BudgetConfig | null
}

const createEmptyConfig = (name: string): BudgetConfig => ({
  id: crypto.randomUUID(),
  name,
  incomes: [],
  expenses: [],
  categories: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

const defaultId = crypto.randomUUID()
const defaultConfig: BudgetConfig = {
  id: defaultId,
  name: 'Mein Budget',
  incomes: [],
  expenses: [],
  categories: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      configs: [defaultConfig],
      currentConfigId: defaultId,

      createConfig: (name) => {
        const newConfig = createEmptyConfig(name)
        set((state) => ({
          configs: [...state.configs, newConfig],
          currentConfigId: newConfig.id
        }))
      },

      switchConfig: (id) => set({ currentConfigId: id }),

      renameConfig: (id, name) => set((state) => ({
        configs: state.configs.map(c => c.id === id ? { ...c, name, updatedAt: new Date().toISOString() } : c)
      })),

      deleteConfig: (id) => set((state) => {
        const newConfigs = state.configs.filter(c => c.id !== id)
        return {
          configs: newConfigs,
          currentConfigId: state.currentConfigId === id ? (newConfigs[0]?.id || null) : state.currentConfigId
        }
      }),

      duplicateConfig: (id) => set((state) => {
        const config = state.configs.find(c => c.id === id)
        if (!config) return {}
        const newConfig = {
          ...config,
          id: crypto.randomUUID(),
          name: `${config.name} (Kopie)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        return {
          configs: [...state.configs, newConfig],
          currentConfigId: newConfig.id
        }
      }),

      // Helper to update current config
      // We can't use a helper function easily inside the object literal without 'this' or passing state
      // So we repeat the pattern: map configs, if id matches current, update it.

      addIncome: (item) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          incomes: [...c.incomes, { ...item, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString()
        } : c)
      })),

      removeIncome: (id) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          incomes: c.incomes.filter(i => i.id !== id),
          updatedAt: new Date().toISOString()
        } : c)
      })),

      updateIncome: (id, item) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          incomes: c.incomes.map(i => i.id === id ? { ...i, ...item } : i),
          updatedAt: new Date().toISOString()
        } : c)
      })),

      addExpense: (item) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          expenses: [...c.expenses, { ...item, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString()
        } : c)
      })),

      removeExpense: (id) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          expenses: c.expenses.filter(e => e.id !== id),
          updatedAt: new Date().toISOString()
        } : c)
      })),

      updateExpense: (id, item) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          expenses: c.expenses.map(e => e.id === id ? { ...e, ...item } : e),
          updatedAt: new Date().toISOString()
        } : c)
      })),

      addCategory: (category) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          categories: [...c.categories, { ...category, id: crypto.randomUUID() }],
          updatedAt: new Date().toISOString()
        } : c)
      })),

      removeCategory: (id) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          categories: c.categories.filter(cat => cat.id !== id),
          // Clean up references
          incomes: c.incomes.map(i => i.categoryId === id ? { ...i, categoryId: undefined } : i),
          expenses: c.expenses.map(e => e.categoryId === id ? { ...e, categoryId: undefined } : e),
          updatedAt: new Date().toISOString()
        } : c)
      })),

      updateCategory: (id, category) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          categories: c.categories.map(cat => cat.id === id ? { ...cat, ...category } : cat),
          updatedAt: new Date().toISOString()
        } : c)
      })),

      importData: (data) => set((state) => ({
        configs: state.configs.map(c => c.id === state.currentConfigId ? {
          ...c,
          incomes: data.incomes || [],
          expenses: data.expenses || [],
          categories: data.categories || [],
          updatedAt: new Date().toISOString()
        } : c)
      })),

      setConfigs: (configs) => set({
        configs: configs.length > 0 ? configs : [defaultConfig],
        currentConfigId: configs.length > 0 ? configs[0].id : defaultConfig.id
      }),

      exportData: () => {
        const current = get().getCurrentConfig()
        if (!current) return JSON.stringify({ incomes: [], expenses: [], categories: [] })
        const { incomes, expenses, categories } = current
        return JSON.stringify({ incomes, expenses, categories }, null, 2)
      },

      getCurrentConfig: () => {
        const state = get()
        return state.configs.find(c => c.id === state.currentConfigId) || null
      }
    }),
    {
      name: 'budget-storage',
      version: 3, // Increment version for migration
      migrate: (persistedState: any, version) => {
        if (version < 3) {
          // Migration from flat state to configs
          const oldState = persistedState as { incomes: BudgetItem[], expenses: BudgetItem[], categories: Category[] }

          const defaultId = crypto.randomUUID()
          const defaultConfig: BudgetConfig = {
            id: defaultId,
            name: 'Mein Budget',
            incomes: oldState.incomes || [],
            expenses: oldState.expenses || [],
            categories: oldState.categories || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          return {
            configs: [defaultConfig],
            currentConfigId: defaultId
          }
        }
        return persistedState
      },
      storage: createJSONStorage(() => createAuthAwareStorage()),
    }
  )
)

export const calculateTotal = (items: BudgetItem[], view: Frequency): number => {
  return items.reduce((acc, item) => {
    let amount = item.amount
    if (view === 'monthly' && item.frequency === 'yearly') {
      amount = item.amount / 12
    } else if (view === 'yearly' && item.frequency === 'monthly') {
      amount = item.amount * 12
    }
    return acc + amount
  }, 0)
}
