import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export interface BudgetState {
  incomes: BudgetItem[]
  expenses: BudgetItem[]
  categories: Category[]

  addIncome: (item: Omit<BudgetItem, 'id'>) => void
  removeIncome: (id: string) => void
  updateIncome: (id: string, item: Partial<BudgetItem>) => void

  addExpense: (item: Omit<BudgetItem, 'id'>) => void
  removeExpense: (id: string) => void
  updateExpense: (id: string, item: Partial<BudgetItem>) => void

  addCategory: (category: Omit<Category, 'id'>) => void
  removeCategory: (id: string) => void
  updateCategory: (id: string, category: Partial<Category>) => void

  importData: (data: { incomes: BudgetItem[], expenses: BudgetItem[], categories: Category[] }) => void
  exportData: () => string
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      incomes: [],
      expenses: [],
      categories: [],

      addIncome: (item) => set((state) => ({
        incomes: [...state.incomes, { ...item, id: crypto.randomUUID() }]
      })),

      removeIncome: (id) => set((state) => ({
        incomes: state.incomes.filter((i) => i.id !== id)
      })),

      updateIncome: (id, item) => set((state) => ({
        incomes: state.incomes.map((i) => (i.id === id ? { ...i, ...item } : i))
      })),

      addExpense: (item) => set((state) => ({
        expenses: [...state.expenses, { ...item, id: crypto.randomUUID() }]
      })),

      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id)
      })),

      updateExpense: (id, item) => set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...item } : e))
      })),

      addCategory: (category) => set((state) => ({
        categories: [...state.categories, { ...category, id: crypto.randomUUID() }]
      })),

      removeCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        // Remove category reference from items
        incomes: state.incomes.map(i => i.categoryId === id ? { ...i, categoryId: undefined } : i),
        expenses: state.expenses.map(e => e.categoryId === id ? { ...e, categoryId: undefined } : e)
      })),

      updateCategory: (id, category) => set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c))
      })),

      importData: (data) => set({
        incomes: data.incomes || [],
        expenses: data.expenses || [],
        categories: data.categories || []
      }),

      exportData: () => {
        const { incomes, expenses, categories } = get()
        return JSON.stringify({ incomes, expenses, categories }, null, 2)
      }
    }),
    {
      name: 'budget-storage',
      version: 2, // Increment version for migration if needed
      migrate: (persistedState: any, version) => {
        if (version === 0) {
            // migration logic if we had versioning before (we didn't, but good practice)
            return persistedState
        }
        return persistedState
      }
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
