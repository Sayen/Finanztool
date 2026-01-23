import { useState, useRef, useMemo } from 'react'
import { useBudgetStore, calculateTotal } from '../stores/budgetStore'
import type { Frequency } from '../stores/budgetStore'
import { BudgetList } from '../components/budget/BudgetList'
import { CategoryManager } from '../components/budget/CategoryManager'
import { BudgetSankey } from '../components/charts/BudgetSankey'
import { Button } from '../components/ui/Button'
import { sortBudgetData } from '../lib/budgetSorting'
import { Download, Upload, Plus, Copy, Trash2, Edit2, Check, X } from 'lucide-react'
import { usePrivacyMode } from '../hooks/usePrivacyMode'

export type ViewMode = Frequency | 'percent'

export function BudgetPlanner() {
  const { isPrivate } = usePrivacyMode()
  const {
    configs, currentConfigId,
    createConfig, switchConfig, renameConfig, deleteConfig, duplicateConfig,
    addIncome, removeIncome, updateIncome,
    addExpense, removeExpense, updateExpense,
    importData, exportData,
    getCurrentConfig
  } = useBudgetStore()

  const [view, setView] = useState<ViewMode>('monthly')
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentConfig = getCurrentConfig()

  // Guard: if no config (should not happen due to migrate/default), show something
  if (!currentConfig) {
      return (
          <div className="container mx-auto p-8 text-center">
              <p>Keine Budget-Konfiguration gefunden.</p>
              <Button onClick={() => createConfig("Mein Budget")}>Neues Budget erstellen</Button>
          </div>
      )
  }

  const { incomes, expenses, categories } = currentConfig

  // Sort data for display and Sankey
  const sortedIncomes = useMemo(() => sortBudgetData(incomes), [incomes])
  const sortedExpenses = useMemo(() => sortBudgetData(expenses), [expenses])

  // Sort configs for selector
  const sortedConfigs = useMemo(() => {
    return [...configs].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }, [configs])

  // Calculate base totals
  const calcView = view === 'percent' ? 'monthly' : view
  const totalIncome = calculateTotal(incomes, calcView)
  const totalExpenses = calculateTotal(expenses, calcView)
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

  const handleExport = () => {
    const dataStr = exportData()
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `budget-${currentConfig.name}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed = JSON.parse(content)
        if (parsed.incomes && parsed.expenses) {
          importData(parsed)
        } else {
          alert('Ungültiges Dateiformat')
        }
      } catch (error) {
        alert('Fehler beim Lesen der Datei')
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startRenaming = () => {
      setNewName(currentConfig.name)
      setIsRenaming(true)
  }

  const saveRename = () => {
      if (newName.trim()) {
          renameConfig(currentConfig.id, newName)
      }
      setIsRenaming(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header & Config Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Budget Planer</h1>
          <p className="text-muted-foreground">Visualisieren Sie Ihre Geldflüsse</p>
        </div>

        <div className="flex items-center gap-2 bg-card border rounded-lg p-1 max-w-full overflow-hidden">
            {/* Mobile: Dropdown */}
            <select
                value={currentConfigId || ''}
                onChange={(e) => switchConfig(e.target.value)}
                className="md:hidden bg-transparent text-sm font-medium px-2 py-1 outline-none max-w-[150px] truncate"
            >
                {sortedConfigs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>

            {/* Desktop: Tabs */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-[300px] lg:max-w-[600px]">
                {sortedConfigs.map(c => (
                    <button
                        key={c.id}
                        onClick={() => switchConfig(c.id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                            currentConfigId === c.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted text-muted-foreground'
                        }`}
                    >
                        {c.name}
                    </button>
                ))}
            </div>

            <div className="h-4 w-px bg-border mx-1 flex-shrink-0" />

            {isRenaming ? (
                <div className="flex items-center gap-1">
                    <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-32 px-1 py-0.5 text-sm border rounded"
                        autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={saveRename} className="h-7 w-7 p-0"><Check className="h-4 w-4 text-green-600" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsRenaming(false)} className="h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
                </div>
            ) : (
                <Button size="sm" variant="ghost" onClick={startRenaming} title="Umbenennen" className="h-7 w-7 p-0">
                    <Edit2 className="h-4 w-4" />
                </Button>
            )}

            <Button size="sm" variant="ghost" onClick={() => createConfig("Neues Budget")} title="Neu" className="h-7 w-7 p-0">
                <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => duplicateConfig(currentConfig.id)} title="Duplizieren" className="h-7 w-7 p-0">
                <Copy className="h-4 w-4" />
            </Button>
            {configs.length > 1 && (
                <Button size="sm" variant="ghost" onClick={() => deleteConfig(currentConfig.id)} title="Löschen" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CategoryManager />

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-card border rounded-lg p-1 flex items-center">
                <button
                onClick={() => setView('monthly')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === 'monthly' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                >
                Monatlich
                </button>
                <button
                onClick={() => setView('yearly')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === 'yearly' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                >
                Jährlich
                </button>
                <button
                onClick={() => setView('percent')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === 'percent' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                >
                Prozent
                </button>
            </div>

            <div className="h-6 w-px bg-border mx-2" />

            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
            />

            <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
            </Button>
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Einnahmen ({view === 'monthly' ? 'mtl.' : 'jährl.'})</div>
          <div className="text-2xl font-bold text-green-600">
            {isPrivate ? '*****' : totalIncome.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Ausgaben ({view === 'monthly' ? 'mtl.' : 'jährl.'})</div>
          <div className="text-2xl font-bold text-red-600">
            {isPrivate ? '*****' : totalExpenses.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Verfügbar / Sparrate</div>
          <div className={`text-2xl font-bold ${savings >= 0 ? 'text-primary' : 'text-red-500'}`}>
            {isPrivate ? '*****' : savings.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({savingsRate.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Sankey Chart */}
      <BudgetSankey
        incomes={sortedIncomes}
        expenses={sortedExpenses}
        categories={categories}
        view={view}
        totalIncome={totalIncome}
        isPrivate={isPrivate}
      />

      {/* Input Lists */}
      <div className="grid md:grid-cols-2 gap-8">
        <BudgetList
          title="Einnahmen"
          items={sortedIncomes}
          categories={categories}
          onAdd={addIncome}
          onRemove={removeIncome}
          onUpdate={updateIncome}
          type="income"
          view={view}
          totalIncome={totalIncome}
          isPrivate={isPrivate}
        />
        <BudgetList
          title="Ausgaben"
          items={sortedExpenses}
          categories={categories}
          onAdd={addExpense}
          onRemove={removeExpense}
          onUpdate={updateExpense}
          type="expense"
          view={view}
          totalIncome={totalIncome}
          isPrivate={isPrivate}
        />
      </div>
    </div>
  )
}
