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
  isDeleted?: boolean
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
        // Soft delete: Mark as deleted instead of removing
        const newConfigs = state.configs.map(c =>
          c.id === id
            ? { ...c, isDeleted: true, updatedAt: new Date().toISOString() }
            : c
        )

        // If current config was deleted, switch to the alphabetically first active one
        let newCurrentId = state.currentConfigId
        if (state.currentConfigId === id) {
          const activeConfigs = newConfigs.filter(c => !c.isDeleted)
          if (activeConfigs.length > 0) {
            activeConfigs.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
            newCurrentId = activeConfigs[0].id
          } else {
            newCurrentId = null
          }
        }

        return {
          configs: newConfigs,
          currentConfigId: newCurrentId
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

      setConfigs: (configs) => set((state) => {
        const newConfigs = configs.length > 0 ? configs : [defaultConfig]

        // Try to preserve current selection if it exists and is active
        const currentExists = newConfigs.find(c => c.id === state.currentConfigId && !c.isDeleted)

        let newCurrentId = state.currentConfigId
        if (!currentExists) {
          // Fallback: Select alphabetically first active config
          const activeConfigs = newConfigs.filter(c => !c.isDeleted)
          if (activeConfigs.length > 0) {
            activeConfigs.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
            newCurrentId = activeConfigs[0].id
          } else {
            // No active configs found (all deleted or empty)
            newCurrentId = newConfigs.length > 0 ? newConfigs[0].id : null
          }
        }

        return {
          configs: newConfigs,
          currentConfigId: newCurrentId
        }
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
      version: 4, // Increment version for migration
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
