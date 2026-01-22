import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Trash2, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  userCount: number
  budgetCount: number
  scenarioCount: number
  activeUsers: number
  registrations: { month: string, count: number }[]
}

interface UserData {
  id: number
  email: string
  is_admin: number
  created_at: string
  last_login: string | null
}

export function AdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !user.isAdmin) {
        navigate('/profile')
        return
    }
    if (!user) {
        navigate('/auth')
        return
    }

    loadData()
  }, [user, navigate])

  const loadData = async () => {
      setLoading(true)
      try {
          const [statsRes, usersRes] = await Promise.all([
              fetch('api/admin.php?action=stats'),
              fetch('api/admin.php?action=users')
          ])

          if (statsRes.ok) setStats(await statsRes.json())
          if (usersRes.ok) setUsers(await usersRes.json())
      } catch (e) {
          console.error(e)
      } finally {
          setLoading(false)
      }
  }

  const handleDeleteUser = async (id: number) => {
      if (!confirm(`Benutzer ${id} wirklich löschen?`)) return

      try {
          const res = await fetch('api/admin.php?action=delete_user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id })
          })
          if (res.ok) {
              setUsers(users.filter(u => u.id !== id))
          } else {
              alert('Fehler beim Löschen')
          }
      } catch (e) {
          alert('Fehler')
      }
  }

  if (loading) return <div className="p-8 text-center">Laden...</div>

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Benutzer</div>
                  <div className="text-2xl font-bold">{stats.userCount}</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Aktive (30d)</div>
                  <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Budget Configs</div>
                  <div className="text-2xl font-bold">{stats.budgetCount}</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Szenarien</div>
                  <div className="text-2xl font-bold">{stats.scenarioCount}</div>
              </div>
          </div>
      )}

      {/* Charts */}
      {stats && stats.registrations && (
          <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Registrierungen (letzte 12 Monate)</h3>
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.registrations}>
                          <XAxis dataKey="month" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      )}

      {/* User Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Benutzerverwaltung</h3>
              <Button size="sm" variant="ghost" onClick={loadData}><RefreshCw className="h-4 w-4" /></Button>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm">
                  <thead className="bg-muted">
                      <tr>
                          <th className="p-3 text-left">ID</th>
                          <th className="p-3 text-left">Email</th>
                          <th className="p-3 text-left">Rolle</th>
                          <th className="p-3 text-left">Registriert</th>
                          <th className="p-3 text-left">Letzter Login</th>
                          <th className="p-3 text-right">Aktionen</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y">
                      {users.map(u => (
                          <tr key={u.id}>
                              <td className="p-3">{u.id}</td>
                              <td className="p-3 font-medium">{u.email}</td>
                              <td className="p-3">
                                  {u.is_admin ? (
                                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold">Admin</span>
                                  ) : (
                                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">User</span>
                                  )}
                              </td>
                              <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                              <td className="p-3 text-muted-foreground">
                                  {u.last_login ? new Date(u.last_login).toLocaleString() : '-'}
                              </td>
                              <td className="p-3 text-right">
                                  {!u.is_admin && (
                                      <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteUser(u.id)}
                                          className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
                                      >
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  )
}
