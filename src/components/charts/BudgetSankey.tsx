import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'
import type { BudgetItem, Frequency, Category } from '../../stores/budgetStore'
import { useMemo } from 'react'

interface BudgetSankeyProps {
  incomes: BudgetItem[]
  expenses: BudgetItem[]
  categories: Category[]
  view: Frequency
}

export function BudgetSankey({ incomes, expenses, categories, view }: BudgetSankeyProps) {
  const data = useMemo(() => {
    const nodes: { name: string }[] = []
    const links: { source: number; target: number; value: number }[] = []

    // Helper to get node index or create it
    const getNodeIndex = (name: string) => {
      let index = nodes.findIndex(n => n.name === name)
      if (index === -1) {
        index = nodes.length
        nodes.push({ name })
      }
      return index
    }

    const budgetNodeName = 'Budget'
    const budgetNodeIndex = getNodeIndex(budgetNodeName)

    // Helper to calculate normalized amount
    const getAmount = (item: BudgetItem) => {
      let amount = item.amount
      if (view === 'monthly' && item.frequency === 'yearly') amount /= 12
      if (view === 'yearly' && item.frequency === 'monthly') amount *= 12
      return amount
    }

    // --- Process Incomes ---
    let totalIncome = 0
    const incomeCategories = categories.filter(c => c.type === 'income')

    // 1. Group Incomes by Category (or Direct)
    const categoryFlows = new Map<string, number>() // Category ID -> Amount

    incomes.forEach(item => {
      const amount = getAmount(item)
      totalIncome += amount

      if (item.categoryId) {
        // Flow: Item -> Category

        // Find category
        const cat = incomeCategories.find(c => c.id === item.categoryId)
        if (cat) {
             links.push({
                 source: getNodeIndex(item.name),
                 target: getNodeIndex(cat.name),
                 value: amount
             })

             const currentCat = cat
             const currentVal = categoryFlows.get(currentCat.id) || 0
             categoryFlows.set(currentCat.id, currentVal + amount)

        } else {
            // Category not found, flow direct to budget
             links.push({
                source: getNodeIndex(item.name),
                target: budgetNodeIndex,
                value: amount
             })
        }
      } else {
        // Direct Flow: Item -> Budget
        links.push({
          source: getNodeIndex(item.name),
          target: budgetNodeIndex,
          value: amount
        })
      }
    })

    // 2. Process Income Category Flows (Category -> Parent/Budget)
    // We need to process from bottom up, or just iteratively until all are resolved.
    // Since we don't have a guaranteed depth, let's process all categories that have value.
    // Warning: Cycles would crash this. Assuming no cycles (Parent != Self).

    // We iterate incomeCategories. To handle nested correctly, we might need topological sort.
    // Simple approach: Repeatedly find categories that have values but haven't been linked out?
    // Or just link them now. Recharts handles the "sum of inputs" visualization, we just need to provide the link with the correct value.
    // Wait, Sankey links represent flow.
    // If Item A (100) -> Cat X.
    // Item B (50) -> Cat X.
    // Then Cat X has 150.
    // Link Cat X -> Budget must be value 150.
    // But what if Cat Y (20) -> Cat X? Then Cat X has 170.
    // We need to resolve the total flow through each category node.

    // Let's do a recursive calculation for category totals.
    // But data is flat list of items.

    // It's easier to just iterate categories and sum their DIRECT items + DIRECT child categories.
    // Recursion is best.

    const getCategoryTotal = (catId: string, type: 'income' | 'expense'): number => {
        let total = 0

        // Sum items directly in this category
        const directItems = (type === 'income' ? incomes : expenses).filter(i => i.categoryId === catId)
        directItems.forEach(i => total += getAmount(i))

        // Sum child categories
        const childCats = categories.filter(c => c.parentId === catId && c.type === type)
        childCats.forEach(c => {
            total += getCategoryTotal(c.id, type)
        })

        return total
    }

    // Generate links for Categories
    // We only need to generate the OUTGOING link for each category.
    // If it's a root category -> flows to Budget (Income) or from Budget (Expense).
    // If it's a child category -> flows to Parent (Income) or from Parent (Expense).

    categories.forEach(cat => {
        const total = getCategoryTotal(cat.id, cat.type)
        if (total === 0) return // Skip empty categories

        if (cat.type === 'income') {
             // Flow: Category -> Parent/Budget
             const targetIndex = cat.parentId
                ? getNodeIndex(categories.find(c => c.id === cat.parentId)?.name || 'Budget') // Fallback if parent missing
                : budgetNodeIndex

             links.push({
                 source: getNodeIndex(cat.name),
                 target: targetIndex,
                 value: total
             })
        } else {
            // Flow: Parent/Budget -> Category
            // For expenses, the logic is reversed.
            // Items flow OUT of Category.
            // So Category must receive flow FROM Parent/Budget.

            const sourceIndex = cat.parentId
                ? getNodeIndex(categories.find(c => c.id === cat.parentId)?.name || 'Budget')
                : budgetNodeIndex

            links.push({
                source: sourceIndex,
                target: getNodeIndex(cat.name),
                value: total
            })
        }
    })

    // Now we need links for Items -> Category (Income) and Category -> Item (Expense)
    // We did Income Items partly above, but let's redo uniformly.
    // Reset links to be safe? No, let's just clear the "Income Logic" above and do it clean.

    // CLEAR EVERYTHING
    nodes.length = 0
    links.length = 0
    // Re-init Budget
    getNodeIndex(budgetNodeName)

    // --- UNIFIED LOGIC ---

    // 1. Income Items
    let calcTotalIncome = 0
    incomes.forEach(item => {
        const amount = getAmount(item)
        calcTotalIncome += amount
        if (amount <= 0) return

        const targetName = item.categoryId
            ? categories.find(c => c.id === item.categoryId)?.name
            : budgetNodeName

        if (targetName) {
            links.push({
                source: getNodeIndex(item.name),
                target: getNodeIndex(targetName),
                value: amount
            })
        }
    })

    // 2. Expense Items
    let calcTotalExpense = 0
    expenses.forEach(item => {
        const amount = getAmount(item)
        calcTotalExpense += amount
        if (amount <= 0) return

        // Flow: Category/Budget -> Item
        const sourceName = item.categoryId
            ? categories.find(c => c.id === item.categoryId)?.name
            : budgetNodeName

        if (sourceName) {
            links.push({
                source: getNodeIndex(sourceName),
                target: getNodeIndex(item.name),
                value: amount
            })
        }
    })

    // 3. Categories (Internal Links)
    categories.forEach(cat => {
        const total = getCategoryTotal(cat.id, cat.type)
        if (total <= 0) return

        if (cat.type === 'income') {
            // Income Category: Flows TO Parent or Budget
            // (We assume items flow INTO this category, which we handled in step 1)
            // Now link this category OUT.
            const targetName = cat.parentId
                ? categories.find(c => c.id === cat.parentId)?.name
                : budgetNodeName

            if (targetName) {
                links.push({
                    source: getNodeIndex(cat.name),
                    target: getNodeIndex(targetName),
                    value: total
                })
            }
        } else {
            // Expense Category: Flows FROM Parent or Budget
            // (We assume items flow OUT of this category, handled in step 2)
            // Now link flows INTO this category.
            const sourceName = cat.parentId
                ? categories.find(c => c.id === cat.parentId)?.name
                : budgetNodeName

            if (sourceName) {
                 links.push({
                     source: getNodeIndex(sourceName),
                     target: getNodeIndex(cat.name),
                     value: total
                 })
            }
        }
    })

    // 4. Savings / Deficit
    const savings = calcTotalIncome - calcTotalExpense
    if (savings > 0) {
      links.push({
        source: budgetNodeIndex,
        target: getNodeIndex('Sparen / Verfügbar'),
        value: savings
      })
    } else if (savings < 0) {
        const deficit = Math.abs(savings)
        links.push({
            source: getNodeIndex('Defizit'),
            target: budgetNodeIndex,
            value: deficit
        })
    }

    // Deduplicate links?
    // If multiple items have same name, we might have issues.
    // Ideally items should be unique or aggregated.
    // Recharts handles multiple links between same nodes by stacking them.
    // But let's aggregate same source-target pairs to be cleaner.

    const aggregatedLinks = new Map<string, { source: number, target: number, value: number }>()
    links.forEach(l => {
        const key = `${l.source}-${l.target}`
        const existing = aggregatedLinks.get(key)
        if (existing) {
            existing.value += l.value
        } else {
            aggregatedLinks.set(key, { ...l })
        }
    })

    return {
        nodes,
        links: Array.from(aggregatedLinks.values())
    }
  }, [incomes, expenses, categories, view])

  if (data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted/20 rounded-xl border-2 border-dashed text-muted-foreground">
        Fügen Sie Einnahmen und Ausgaben hinzu, um das Diagramm zu sehen.
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full bg-card rounded-xl border p-4">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          node={{ strokeWidth: 0 }}
          nodePadding={50}
          margin={{
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
          }}
          link={{ stroke: '#8884d8', strokeOpacity: 0.3 }} // Hardcoded visible color
        >
          <Tooltip
             formatter={(value: any) => {
                 // Custom tooltip to show flow direction
                 return [
                     typeof value === 'number'
                       ? value.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })
                       : value,
                     'Betrag'
                 ]
             }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  )
}
