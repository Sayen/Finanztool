import { useState, useMemo } from 'react'
import { Plus, Trash2, Edit2, Check, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '../ui/Button'
import type { BudgetItem, Frequency, Category } from '../../stores/budgetStore'
import type { ViewMode } from '../../pages/BudgetPlanner'

interface BudgetListProps {
  title: string
  items: BudgetItem[]
  categories: Category[]
  onAdd: (item: Omit<BudgetItem, 'id'>) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, item: Partial<BudgetItem>) => void
  type: 'income' | 'expense'
  view?: ViewMode
  totalIncome?: number
  isPrivate?: boolean
}

export function BudgetList({ title, items, categories, onAdd, onRemove, onUpdate, type, view = 'monthly', totalIncome = 0, isPrivate }: BudgetListProps) {
  const [newItemName, setNewItemName] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [newItemFrequency, setNewItemFrequency] = useState<Frequency>('monthly')
  const [newItemCategory, setNewItemCategory] = useState<string>('')

  // Expanded/Collapsed state for groups
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)

  // Filter categories by type
  const availableCategories = categories.filter(c => c.type === type)

  const toggleGroup = (id: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(id)) {
        newExpanded.delete(id)
    } else {
        newExpanded.add(id)
    }
    setExpandedCategories(newExpanded)
  }

  // Group items logic
  const groups = useMemo(() => {
    const grouped: {
        id: string;
        name: string;
        items: BudgetItem[];
        monthlyTotal: number;
    }[] = [];

    items.forEach(item => {
        const catId = item.categoryId || 'uncategorized';
        let group = grouped.find(g => g.id === catId);

        if (!group) {
            const catName = item.categoryId
                ? categories.find(c => c.id === item.categoryId)?.name || 'Unbekannt'
                : 'Keine Kategorie';
             group = { id: catId, name: catName, items: [], monthlyTotal: 0 };
             grouped.push(group);
        }

        group.items.push(item);

        let mAmount = item.amount;
        if (item.frequency === 'yearly') mAmount /= 12;
        group.monthlyTotal += mAmount;
    });

    return grouped;
  }, [items, categories]);

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
        {groups.map(group => {
            const isExpanded = expandedCategories.has(group.id)

            // Calculate Group Display Values
            let groupDisplayAmount = 0
            if (view === 'monthly') groupDisplayAmount = group.monthlyTotal
            else if (view === 'yearly') groupDisplayAmount = group.monthlyTotal * 12
            else if (view === 'percent') {
                if (totalIncome > 0) groupDisplayAmount = (group.monthlyTotal / totalIncome) * 100
            }

            // Calculate Group Percentage for label (always show % alongside amount)
            const groupPercent = totalIncome > 0 ? (group.monthlyTotal / totalIncome) * 100 : 0

            return (
                <div key={group.id} className="border rounded-md overflow-hidden">
                    <div
                        onClick={() => toggleGroup(group.id)}
                        className="flex items-center justify-between p-3 bg-muted cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    >
                        <div className="font-semibold text-sm">{group.name}</div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex flex-col items-end leading-tight">
                                <span className="font-mono font-medium">
                                    {view === 'percent'
                                        ? `${groupDisplayAmount.toFixed(1)}%`
                                        : (isPrivate
                                            ? '*****'
                                            : groupDisplayAmount.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })
                                        )
                                    }
                                </span>
                                {view !== 'percent' && (
                                    <span className="text-xs text-muted-foreground">
                                        {groupPercent.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                            {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="divide-y border-t bg-muted/30">
                            {group.items.map((item) => {
                                let displayAmount = item.amount
                                if (view === 'percent') {
                                    let monthlyAmount = item.amount
                                    if (item.frequency === 'yearly') monthlyAmount /= 12
                                    if (totalIncome > 0) {
                                        displayAmount = (monthlyAmount / totalIncome) * 100
                                    } else {
                                        displayAmount = 0
                                    }
                                }

                                return (
                                    <div key={item.id} className="flex items-center justify-between p-3 pl-6 hover:bg-muted/50 transition-colors group">
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.frequency === 'monthly' ? 'Monatlich' : 'Jährlich'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-mono text-sm">
                                                {view === 'percent'
                                                    ? `${displayAmount.toFixed(1)}%`
                                                    : (isPrivate
                                                        ? '*****'
                                                        : item.amount.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })
                                                    )
                                                }
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
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
