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

  const workerRef = useRef<Worker | null>(null)

  // Initialize Worker
  useEffect(() => {
    if (user && !workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/sync.worker.ts', import.meta.url), { type: 'module' })
      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'ERROR') {
          console.error('Cloud sync failed:', e.data.error)
        }
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [user])

  // 2. SYNC ON CHANGE (Debounced)
  useEffect(() => {
    if (!user || isFetching.current) return
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timer = setTimeout(() => {
      if (workerRef.current) {
        const payload = {
          budgetConfigs,
          scenarioConfigs
        }

        workerRef.current.postMessage({
          type: 'SYNC',
          payload,
          csrfToken: csrfToken || '',
          url: new URL('api/sync.php', window.location.href).toString()
        })
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timer)
  }, [budgetConfigs, scenarioConfigs, user, csrfToken])
}
