import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Frequency = 'monthly' | 'yearly'

export interface BudgetItem {
  id: string
  name: string
  amount: number
  frequency: Frequency
  category?: string
}

export interface BudgetState {
  incomes: BudgetItem[]
  expenses: BudgetItem[]

  addIncome: (item: Omit<BudgetItem, 'id'>) => void
  removeIncome: (id: string) => void
  updateIncome: (id: string, item: Partial<BudgetItem>) => void

  addExpense: (item: Omit<BudgetItem, 'id'>) => void
  removeExpense: (id: string) => void
  updateExpense: (id: string, item: Partial<BudgetItem>) => void

  importData: (data: { incomes: BudgetItem[], expenses: BudgetItem[] }) => void
  exportData: () => string
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      incomes: [],
      expenses: [],

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

      importData: (data) => set({ incomes: data.incomes, expenses: data.expenses }),

      exportData: () => {
        const { incomes, expenses } = get()
        return JSON.stringify({ incomes, expenses }, null, 2)
      }
    }),
    {
      name: 'budget-storage',
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
