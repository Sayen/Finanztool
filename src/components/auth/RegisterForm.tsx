import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useBudgetStore } from '../../stores/budgetStore'
import { useScenarioStore } from '../../stores/scenarioStore'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [importLocal, setImportLocal] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()

  const budgetConfigs = useBudgetStore(state => state.configs)
  const scenarioConfigs = useScenarioStore(state => state.scenarios)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPass) {
        setError('Passwörter stimmen nicht überein')
        return
    }
    if (password.length < 8) {
        setError('Passwort muss mind. 8 Zeichen lang sein')
        return
    }
    const hasNumber = /[0-9]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (!hasNumber || !hasUpperCase || !hasLowerCase || !hasSpecial) {
        setError('Passwort muss Groß- und Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten')
        return
    }

    setError('')
    setLoading(true)

    const importData = importLocal ? {
        budgetConfigs,
        scenarioConfigs: scenarioConfigs.map(s => ({
            ...s
        }))
    } : null

    try {
      const res = await fetch('api/auth.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, importData })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      login(data.user, data.csrfToken)
      navigate('/profile')

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Passwort</label>
        <Input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Passwort bestätigen</label>
        <Input
          type="password"
          required
          minLength={8}
          value={confirmPass}
          onChange={e => setConfirmPass(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2 py-2">
        <input
            type="checkbox"
            id="import"
            checked={importLocal}
            onChange={e => setImportLocal(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="import" className="text-sm">
            Lokale Daten ins Profil übernehmen
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Laden...' : 'Registrieren'}
      </Button>
    </form>
  )
}
