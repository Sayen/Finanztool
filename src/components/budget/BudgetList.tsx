import { useState } from 'react'
import { Plus, Trash2, Edit2, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import type { BudgetItem, Frequency, Category } from '../../stores/budgetStore'

interface BudgetListProps {
  title: string
  items: BudgetItem[]
  categories: Category[]
  onAdd: (item: Omit<BudgetItem, 'id'>) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, item: Partial<BudgetItem>) => void
  type: 'income' | 'expense'
}

export function BudgetList({ title, items, categories, onAdd, onRemove, onUpdate, type }: BudgetListProps) {
  const [newItemName, setNewItemName] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [newItemFrequency, setNewItemFrequency] = useState<Frequency>('monthly')
  const [newItemCategory, setNewItemCategory] = useState<string>('')

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)

  // Filter categories by type
  const availableCategories = categories.filter(c => c.type === type)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName || !newItemAmount) return

    if (editingId) {
        onUpdate(editingId, {
            name: newItemName,
            amount: parseFloat(newItemAmount),
            frequency: newItemFrequency,
            categoryId: newItemCategory || undefined
        })
        setEditingId(null)
    } else {
        onAdd({
            name: newItemName,
            amount: parseFloat(newItemAmount),
            frequency: newItemFrequency,
            categoryId: newItemCategory || undefined
        })
    }

    resetForm()
  }

  const resetForm = () => {
    setNewItemName('')
    setNewItemAmount('')
    setNewItemFrequency('monthly')
    setNewItemCategory('')
    setEditingId(null)
  }

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id)
    setNewItemName(item.name)
    setNewItemAmount(item.amount.toString())
    setNewItemFrequency(item.frequency)
    setNewItemCategory(item.categoryId || '')
  }

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="space-y-4 mb-6">
        {items.map((item) => {
          const catName = item.categoryId ? categories.find(c => c.id === item.categoryId)?.name : null
          return (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md group hover:bg-muted transition-colors">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground flex gap-2">
                  <span>{item.frequency === 'monthly' ? 'Monatlich' : 'Jährlich'}</span>
                  {catName && <span className="text-primary font-medium">• {catName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-mono font-medium mr-2">
                  {item.amount.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(item)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm italic border-2 border-dashed rounded-md">
            Noch keine Einträge
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={`flex flex-col gap-2 border-t pt-4 ${editingId ? 'bg-primary/5 -mx-6 px-6 pb-2 border-primary/20' : ''}`}>
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {editingId ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
            </span>
            {editingId && (
                <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="h-6 text-xs">
                    Abbrechen
                </Button>
            )}
        </div>

        <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
            <label className="text-xs font-medium">Bezeichnung</label>
            <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary/20"
                placeholder="z.B. Lohn, Miete"
                required
            />
            </div>
            <div className="w-32 space-y-2">
            <label className="text-xs font-medium">Betrag</label>
            <input
                type="number"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary/20"
                placeholder="0.00"
                min="0"
                step="0.05"
                required
            />
            </div>
        </div>
        <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
                <label className="text-xs font-medium">Kategorie (Optional)</label>
                <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">(Keine Kategorie)</option>
                    {availableCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div className="w-32 space-y-2">
            <label className="text-xs font-medium">Intervall</label>
            <select
                value={newItemFrequency}
                onChange={(e) => setNewItemFrequency(e.target.value as Frequency)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary/20"
            >
                <option value="monthly">Monatlich</option>
                <option value="yearly">Jährlich</option>
            </select>
            </div>
            <Button type="submit" size="sm" className="mb-[1px]">
                {editingId ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {editingId ? 'Speichern' : 'Hinzufügen'}
            </Button>
        </div>
      </form>
    </div>
  )
}
