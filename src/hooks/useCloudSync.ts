import { useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useBudgetStore } from '../stores/budgetStore'
import { useScenarioStore } from '../stores/scenarioStore'

export function useCloudSync() {
  const { user, csrfToken } = useAuthStore()
  const { configs: budgetConfigs, setConfigs: setBudgetConfigs } = useBudgetStore()
  const { scenarios: scenarioConfigs, setScenarios: setScenarioConfigs } = useScenarioStore()

  // Refs to track previous state to avoid loops or unnecessary syncs
  const isInitialMount = useRef(true)
  const isFetching = useRef(false)

  // 1. FETCH ON LOGIN
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        isFetching.current = true
        try {
          const res = await fetch('api/sync.php')
          if (!res.ok) throw new Error('Sync failed')

          const data = await res.json()

          if (data.budgetConfigs) {
            setBudgetConfigs(data.budgetConfigs)
          }
          if (data.scenarioConfigs) {
            setScenarioConfigs(data.scenarioConfigs)
          }
        } catch (error) {
          console.error('Failed to fetch cloud data:', error)
        } finally {
          isFetching.current = false
        }
      }
      fetchData()
    }
  }, [user, setBudgetConfigs, setScenarioConfigs])

  // 2. SYNC ON CHANGE (Debounced)
  useEffect(() => {
    if (!user || isFetching.current) return
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timer = setTimeout(async () => {
      try {
        const payload = {
          budgetConfigs,
          scenarioConfigs
        }

        await fetch('api/sync.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''
          },
          body: JSON.stringify(payload)
        })
      } catch (error) {
        console.error('Cloud sync failed:', error)
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timer)
  }, [budgetConfigs, scenarioConfigs, user, csrfToken])
}
