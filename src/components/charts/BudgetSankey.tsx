import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'
import type { BudgetItem, Frequency } from '../../stores/budgetStore'
import { useMemo } from 'react'

interface BudgetSankeyProps {
  incomes: BudgetItem[]
  expenses: BudgetItem[]
  view: Frequency
}

export function BudgetSankey({ incomes, expenses, view }: BudgetSankeyProps) {
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

    const budgetNodeIndex = getNodeIndex('Budget')

    // 1. Process Incomes
    // Calculate totals for each income source
    const incomeMap = new Map<string, number>()
    let totalIncome = 0

    incomes.forEach(item => {
      let amount = item.amount
      if (view === 'monthly' && item.frequency === 'yearly') amount /= 12
      if (view === 'yearly' && item.frequency === 'monthly') amount *= 12

      const current = incomeMap.get(item.name) || 0
      incomeMap.set(item.name, current + amount)
      totalIncome += amount
    })

    // Add Income Links (Income -> Budget)
    incomeMap.forEach((amount, name) => {
      links.push({
        source: getNodeIndex(name),
        target: budgetNodeIndex,
        value: amount
      })
    })

    // 2. Process Expenses
    let totalExpenses = 0
    expenses.forEach(item => {
      let amount = item.amount
      if (view === 'monthly' && item.frequency === 'yearly') amount /= 12
      if (view === 'yearly' && item.frequency === 'monthly') amount *= 12

      totalExpenses += amount

      links.push({
        source: budgetNodeIndex,
        target: getNodeIndex(item.name),
        value: amount
      })
    })

    // 3. Savings / Unallocated
    const savings = totalIncome - totalExpenses
    if (savings > 0) {
      links.push({
        source: budgetNodeIndex,
        target: getNodeIndex('Sparen / Verfügbar'),
        value: savings
      })
    } else if (savings < 0) {
        // Deficit handling could be complex in Sankey.
        // For now, let's just show it as a negative flow from a "Debt" node if we wanted,
        // but re-charts sankey only does positive flows.
        // We will just let the "Budget" node be unbalanced or maybe add a "Deficit" input node?
        // Sankey diagrams generally require flow conservation (Input = Output).
        // If Expenses > Income, the "Budget" node has more output than input.
        // We can add a "Deficit" node feeding into Budget to balance it.
        const deficit = Math.abs(savings)
        links.push({
            source: getNodeIndex('Defizit'),
            target: budgetNodeIndex,
            value: deficit
        })
    }

    return { nodes, links }
  }, [incomes, expenses, view])

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
          link={{ stroke: 'var(--primary)', strokeOpacity: 0.2 }}
        >
          <Tooltip
             formatter={(value: any) =>
                typeof value === 'number'
                  ? value.toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })
                  : value
             }
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  )
}
