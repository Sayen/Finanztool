import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import type { BudgetItem, Frequency, Category } from '../../stores/budgetStore'

interface BudgetListProps {
  title: string
  items: BudgetItem[]
  categories: Category[]
  onAdd: (item: Omit<BudgetItem, 'id'>) => void
  onRemove: (id: string) => void
  type: 'income' | 'expense'
}

export function BudgetList({ title, items, categories, onAdd, onRemove, type }: BudgetListProps) {
  const [newItemName, setNewItemName] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [newItemFrequency, setNewItemFrequency] = useState<Frequency>('monthly')
  const [newItemCategory, setNewItemCategory] = useState<string>('')

  // Filter categories by type
  const availableCategories = categories.filter(c => c.type === type)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName || !newItemAmount) return

    onAdd({
      name: newItemName,
      amount: parseFloat(newItemAmount),
      frequency: newItemFrequency,
      categoryId: newItemCategory || undefined
    })

    setNewItemName('')
    setNewItemAmount('')
    setNewItemFrequency('monthly')
    setNewItemCategory('')
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
              <div className="flex items-center gap-4">
                <div className="font-mono font-medium">
                  {item.amount.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })}
                </div>
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t pt-4">
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
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
            </Button>
        </div>
      </form>
    </div>
  )
}
