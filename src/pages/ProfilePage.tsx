import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useBudgetStore } from '../stores/budgetStore'
import { useScenarioStore } from '../stores/scenarioStore'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { LogOut, RefreshCw, AlertTriangle, DownloadCloud, UploadCloud, Trash2 } from 'lucide-react'

export function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { configs: budgetConfigs, setConfigs: setBudgetConfigs } = useBudgetStore()
  const { scenarios: scenarioConfigs, setScenarios: setScenarioConfigs } = useScenarioStore()

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
        navigate('/auth')
    }
  }, [user, navigate])

  const handleSync = async () => {
    setSyncStatus('syncing')
    try {
        const payload = {
            budgetConfigs,
            scenarioConfigs: scenarioConfigs.map(s => ({ ...s }))
        }

        const res = await fetch('api/sync.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!res.ok) throw new Error('Sync failed')

        setSyncStatus('success')
        setLastSync(new Date().toLocaleTimeString())

        // Reset success message after 3s
        setTimeout(() => setSyncStatus('idle'), 3000)

    } catch (error) {
        console.error(error)
        setSyncStatus('error')
    }
  }

  const handleLoad = async () => {
      if (!confirm('Achtung: Alle lokalen Änderungen, die nicht synchronisiert wurden, gehen verloren. Fortfahren?')) return;

      setLoadStatus('loading')
      try {
          const res = await fetch('api/sync.php')
          const data = await res.json()

          if (data.budgetConfigs) {
              setBudgetConfigs(data.budgetConfigs)
          }
          if (data.scenarioConfigs) {
              setScenarioConfigs(data.scenarioConfigs)
          }

          setLoadStatus('success')
          setTimeout(() => setLoadStatus('idle'), 3000)
      } catch (e) {
          console.error(e)
          setLoadStatus('error')
      }
  }

  const handleLogout = async () => {
      await fetch('api/auth.php?action=logout')
      logout()
      navigate('/')
  }

  const handleClearLocal = () => {
    if (confirm('Sind Sie sicher? Alle lokalen Daten auf diesem Gerät werden unwiderruflich gelöscht.')) {
        localStorage.clear()
        window.location.reload()
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mein Profil</h1>
        <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" />
            Abmelden
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="font-medium">{user.email}</div>
              </div>
              <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="font-medium">{user.isAdmin ? 'Administrator' : 'Benutzer'}</div>
              </div>
          </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-6">
          <div>
              <h2 className="text-xl font-semibold mb-2">Synchronisation</h2>
              <p className="text-sm text-muted-foreground mb-4">
                  Synchronisieren Sie Ihre Daten mit der Cloud, um sie auf allen Geräten verfügbar zu haben.
              </p>

              <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Button onClick={handleSync} disabled={syncStatus === 'syncing' || loadStatus === 'loading'} className="w-48">
                        {syncStatus === 'syncing' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                        {syncStatus === 'success' ? 'Gespeichert!' : 'In Cloud speichern'}
                    </Button>

                    {lastSync && <span className="text-xs text-muted-foreground">Zuletzt gespeichert: {lastSync}</span>}

                    {syncStatus === 'error' && (
                        <span className="text-sm text-red-500 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" /> Fehler
                        </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={handleLoad} disabled={syncStatus === 'syncing' || loadStatus === 'loading'} className="w-48">
                        {loadStatus === 'loading' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <DownloadCloud className="h-4 w-4 mr-2" />}
                        {loadStatus === 'success' ? 'Geladen!' : 'Aus Cloud laden'}
                    </Button>

                    {loadStatus === 'error' && (
                        <span className="text-sm text-red-500 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" /> Fehler beim Laden
                        </span>
                    )}
                  </div>
              </div>
          </div>

          <div className="pt-4 border-t">
              <div className="bg-blue-50 text-blue-700 p-4 rounded text-sm">
                  <strong>Hinweis:</strong> "In Cloud speichern" überschreibt Ihre Daten in der Cloud mit den aktuellen lokalen Daten. "Aus Cloud laden" überschreibt Ihre lokalen Daten mit denen aus der Cloud.
              </div>
          </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4 border-destructive/20">
          <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Gefahrenzone
          </h2>
          <p className="text-sm text-muted-foreground">
              Hier können Sie alle lokal gespeicherten Daten löschen. Dies betrifft nur die Daten auf diesem Gerät.
          </p>
          <Button variant="destructive" onClick={handleClearLocal}>
              <Trash2 className="h-4 w-4 mr-2" />
              Lokale Daten löschen
          </Button>
      </div>

      {user.isAdmin && (
          <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Administration</h2>
              <Button onClick={() => navigate('/admin')}>
                  Zum Admin Bereich
              </Button>
          </div>
      )}
    </div>
  )
}
