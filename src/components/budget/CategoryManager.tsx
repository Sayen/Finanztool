import { useState } from 'react'
import { Plus, Trash2, FolderPlus, Edit2, X, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { useBudgetStore } from '../../stores/budgetStore'
import type { Category, ItemType } from '../../stores/budgetStore'
import * as Dialog from '@radix-ui/react-dialog'

export function CategoryManager() {
  const { categories, addCategory, removeCategory, updateCategory } = useBudgetStore()
  const [isOpen, setIsOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<ItemType>('expense')
  const [newCatParent, setNewCatParent] = useState<string>('')
  const [newCatColor, setNewCatColor] = useState<string>('#3b82f6') // default blue-500

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editParent, setEditParent] = useState<string>('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName) return
    addCategory({
      name: newCatName,
      type: newCatType,
      parentId: newCatParent || undefined,
      color: newCatColor
    })
    setNewCatName('')
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditColor(cat.color || '#3b82f6')
    setEditParent(cat.parentId || '')
  }

  const saveEdit = () => {
    if (editingId && editName) {
        updateCategory(editingId, {
            name: editName,
            color: editColor,
            parentId: editParent || undefined
        })
        setEditingId(null)
    }
  }

  // Predefined distinct colors (Tailwind palette 500)
  const colors = [
    '#64748b', // Slate
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#eab308', // Yellow
    '#84cc16', // Lime
    '#22c55e', // Green
    '#10b981', // Emerald
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#0ea5e9', // Sky
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#a855f7', // Purple
    '#d946ef', // Fuchsia
    '#ec4899', // Pink
    '#f43f5e', // Rose
  ]

  // Filter possible parents (avoid circular dependency roughly - usually just prevent self)
  // And must match type
  const getPossibleParents = (type: ItemType) => categories.filter(c => c.type === type)

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  const renderCategoryList = (cats: Category[], title: string) => (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-2">{title}</h3>
      {cats.length === 0 && <div className="text-sm text-muted-foreground px-2 italic">Keine Kategorien</div>}
      {cats.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md border border-transparent hover:border-border">
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: cat.color || (cat.type === 'income' ? '#22c55e' : '#ef4444') }} />
                  {editingId === cat.id ? (
                      <div className="flex flex-col gap-2 w-full pr-2">
                          <div className="flex gap-2">
                            <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-2 py-1 h-7 text-sm border rounded flex-1"
                                autoFocus
                            />
                            <select
                                value={editParent}
                                onChange={(e) => setEditParent(e.target.value)}
                                className="px-2 py-1 h-7 text-xs border rounded w-32"
                            >
                                <option value="">(Keine Parent)</option>
                                {getPossibleParents(cat.type)
                                    .filter(c => c.id !== cat.id) // Prevent self-parenting
                                    .map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                          </div>

                          <div className="flex gap-1 flex-wrap">
                              {colors.map(c => (
                                  <button
                                      key={c}
                                      type="button"
                                      onClick={() => setEditColor(c)}
                                      className={`w-4 h-4 rounded-full border border-border ${editColor === c ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                      style={{ backgroundColor: c }}
                                  />
                              ))}
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col">
                          <span className="font-medium text-sm">{cat.name}</span>
                          {cat.parentId && (
                              <span className="text-xs text-muted-foreground">
                                  ↳ {categories.find(c => c.id === cat.parentId)?.name}
                              </span>
                          )}
                      </div>
                  )}
              </div>

              <div className="flex items-center gap-1">
                  {editingId === cat.id ? (
                      <>
                          <Button size="sm" variant="ghost" onClick={saveEdit}><Check className="h-4 w-4 text-green-600" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                      </>
                  ) : (
                      <Button size="sm" variant="ghost" onClick={() => startEdit(cat)}><Edit2 className="h-4 w-4" /></Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => removeCategory(cat.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
          </div>
      ))}
    </div>
  )

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          <FolderPlus className="h-4 w-4 mr-2" />
          Kategorien verwalten
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 className="text-lg font-semibold leading-none tracking-tight">Kategorien verwalten</h2>
            <p className="text-sm text-muted-foreground">
              Erstellen Sie Gruppen für Ihre Einnahmen und Ausgaben.
            </p>
          </div>

          <div className="grid gap-4 py-4">
            {/* Add New Form */}
            <form onSubmit={handleAdd} className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg border">
                <div className="flex gap-2">
                    <select
                        value={newCatType}
                        onChange={(e) => {
                            setNewCatType(e.target.value as ItemType)
                            setNewCatParent('') // Reset parent on type change
                        }}
                        className="w-32 px-2 py-1 text-sm rounded-md border"
                    >
                        <option value="income">Einnahme</option>
                        <option value="expense">Ausgabe</option>
                    </select>
                    <input
                        className="flex-1 px-3 py-1 text-sm rounded-md border"
                        placeholder="Neue Kategorie..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                    />
                </div>

                {/* Color Picker */}
                <div className="flex gap-1 flex-wrap">
                    {colors.map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setNewCatColor(c)}
                            className={`w-5 h-5 rounded-full border border-border ${newCatColor === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground w-32">Überkategorie:</span>
                    <select
                        className="flex-1 px-2 py-1 text-sm rounded-md border"
                        value={newCatParent}
                        onChange={(e) => setNewCatParent(e.target.value)}
                    >
                        <option value="">(Keine)</option>
                        {getPossibleParents(newCatType).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <Button type="submit" size="sm">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </form>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1">
                {renderCategoryList(incomeCategories, 'Einnahmen')}
                <div className="h-px bg-border" />
                {renderCategoryList(expenseCategories, 'Ausgaben')}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Schliessen</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
