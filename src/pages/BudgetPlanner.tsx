import { useState, useRef } from 'react'
import { useBudgetStore, calculateTotal } from '../stores/budgetStore'
import type { Frequency } from '../stores/budgetStore'
import { BudgetList } from '../components/budget/BudgetList'
import { BudgetSankey } from '../components/charts/BudgetSankey'
import { Button } from '../components/ui/Button'
import { Download, Upload } from 'lucide-react'

export function BudgetPlanner() {
  const { incomes, expenses, addIncome, removeIncome, addExpense, removeExpense, importData, exportData } = useBudgetStore()
  const [view, setView] = useState<Frequency>('monthly')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalIncome = calculateTotal(incomes, view)
  const totalExpenses = calculateTotal(expenses, view)
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

  const handleExport = () => {
    const dataStr = exportData()
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `budget-plan-${new Date().toISOString().split('T')[0]}.json`
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
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Budget Planer</h1>
          <p className="text-muted-foreground">Visualisieren Sie Ihre Geldflüsse</p>
        </div>

        <div className="flex items-center gap-2">
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
            {totalIncome.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Ausgaben ({view === 'monthly' ? 'mtl.' : 'jährl.'})</div>
          <div className="text-2xl font-bold text-red-600">
            {totalExpenses.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Verfügbar / Sparrate</div>
          <div className={`text-2xl font-bold ${savings >= 0 ? 'text-primary' : 'text-red-500'}`}>
            {savings.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({savingsRate.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Sankey Chart */}
      <BudgetSankey incomes={incomes} expenses={expenses} view={view} />

      {/* Input Lists */}
      <div className="grid md:grid-cols-2 gap-8">
        <BudgetList
          title="Einnahmen"
          items={incomes}
          onAdd={addIncome}
          onRemove={removeIncome}
          type="income"
        />
        <BudgetList
          title="Ausgaben"
          items={expenses}
          onAdd={addExpense}
          onRemove={removeExpense}
          type="expense"
        />
      </div>
    </div>
  )
}
