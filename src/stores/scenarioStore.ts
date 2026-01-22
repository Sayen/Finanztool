import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Scenario, CalculationParams } from '../types'
import { calculateScenario, deriveFromQuickStart } from '../lib/calculator'

interface ScenarioStore {
  scenarios: Scenario[]
  currentScenarioId: string | null
  comparisonScenarioIds: string[]
  
  // Actions
  createScenario: (name: string, params?: Partial<CalculationParams>) => string
  updateScenario: (id: string, params: Partial<CalculationParams>) => void
  deleteScenario: (id: string) => void
  duplicateScenario: (id: string) => string
  renameScenario: (id: string, name: string) => void
  toggleFavorite: (id: string) => void
  setCurrentScenario: (id: string | null) => void
  addToComparison: (id: string) => void
  removeFromComparison: (id: string) => void
  clearComparison: () => void
  getCurrentScenario: () => Scenario | null
  getScenario: (id: string) => Scenario | null
  recalculateScenario: (id: string) => void
  exportScenarios: () => string
  importScenarios: (json: string) => void
  setScenarios: (scenarios: Scenario[]) => void
}

const getDefaultParams = (): CalculationParams => {
  const quickStart = {
    purchasePrice: 1000000,
    propertyType: 'apartment' as const,
    equity: 200000,
    householdIncome: 150000,
    location: 'good' as const,
  }
  
  return {
    ...deriveFromQuickStart(quickStart),
  } as CalculationParams
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: [],
      currentScenarioId: null,
      comparisonScenarioIds: [],
      
      createScenario: (name: string, params?: Partial<CalculationParams>) => {
        const id = `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fullParams = { ...getDefaultParams(), ...params }
        const results = calculateScenario(fullParams)
        
        const newScenario: Scenario = {
          id,
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFavorite: false,
          params: fullParams,
          results,
        }
        
        set((state) => ({
          scenarios: [...state.scenarios, newScenario],
          currentScenarioId: id,
        }))
        
        return id
      },
      
      updateScenario: (id: string, params: Partial<CalculationParams>) => {
        set((state) => ({
          scenarios: state.scenarios.map((scenario) => {
            if (scenario.id === id) {
              const fullParams = { ...scenario.params, ...params }
              const results = calculateScenario(fullParams)
              return {
                ...scenario,
                params: fullParams,
                results,
                updatedAt: new Date().toISOString(),
              }
            }
            return scenario
          }),
        }))
      },
      
      deleteScenario: (id: string) => {
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          currentScenarioId: state.currentScenarioId === id ? null : state.currentScenarioId,
          comparisonScenarioIds: state.comparisonScenarioIds.filter((sid) => sid !== id),
        }))
      },
      
      duplicateScenario: (id: string) => {
        const scenario = get().scenarios.find((s) => s.id === id)
        if (!scenario) return ''
        
        const newId = `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const duplicatedScenario: Scenario = {
          ...scenario,
          id: newId,
          name: `${scenario.name} (Kopie)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFavorite: false,
        }
        
        set((state) => ({
          scenarios: [...state.scenarios, duplicatedScenario],
        }))
        
        return newId
      },
      
      renameScenario: (id: string, name: string) => {
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === id
              ? { ...scenario, name, updatedAt: new Date().toISOString() }
              : scenario
          ),
        }))
      },
      
      toggleFavorite: (id: string) => {
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === id
              ? { ...scenario, isFavorite: !scenario.isFavorite }
              : scenario
          ),
        }))
      },
      
      setCurrentScenario: (id: string | null) => {
        set({ currentScenarioId: id })
      },
      
      addToComparison: (id: string) => {
        set((state) => {
          if (state.comparisonScenarioIds.includes(id)) return state
          if (state.comparisonScenarioIds.length >= 3) {
            // Max 3 scenarios for comparison
            return {
              comparisonScenarioIds: [...state.comparisonScenarioIds.slice(1), id],
            }
          }
          return {
            comparisonScenarioIds: [...state.comparisonScenarioIds, id],
          }
        })
      },
      
      removeFromComparison: (id: string) => {
        set((state) => ({
          comparisonScenarioIds: state.comparisonScenarioIds.filter((sid) => sid !== id),
        }))
      },
      
      clearComparison: () => {
        set({ comparisonScenarioIds: [] })
      },
      
      getCurrentScenario: () => {
        const state = get()
        return state.scenarios.find((s) => s.id === state.currentScenarioId) || null
      },
      
      getScenario: (id: string) => {
        return get().scenarios.find((s) => s.id === id) || null
      },
      
      recalculateScenario: (id: string) => {
        set((state) => ({
          scenarios: state.scenarios.map((scenario) => {
            if (scenario.id === id) {
              const results = calculateScenario(scenario.params)
              return {
                ...scenario,
                results,
                updatedAt: new Date().toISOString(),
              }
            }
            return scenario
          }),
        }))
      },
      
      exportScenarios: () => {
        const state = get()
        return JSON.stringify(state.scenarios, null, 2)
      },
      
      importScenarios: (json: string) => {
        try {
          const imported = JSON.parse(json) as Scenario[]
          set((state) => ({
            scenarios: [...state.scenarios, ...imported],
          }))
        } catch (error) {
          console.error('Failed to import scenarios:', error)
        }
      },

      setScenarios: (scenarios) => set({
        scenarios: scenarios,
        currentScenarioId: scenarios.length > 0 ? scenarios[0].id : null
      }),
    }),
    {
      name: 'finanztool-scenarios',
      version: 1,
    }
  )
)
