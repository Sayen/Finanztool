import { ResponsiveContainer, Sankey, Tooltip } from 'recharts'
import type { BudgetItem, Category } from '../../stores/budgetStore'
import type { ViewMode } from '../../pages/BudgetPlanner'
import { useMemo } from 'react'

interface BudgetSankeyProps {
  incomes: BudgetItem[]
  expenses: BudgetItem[]
  categories: Category[]
  view: ViewMode
  totalIncome?: number
}

export function BudgetSankey({ incomes, expenses, categories, view, totalIncome = 0 }: BudgetSankeyProps) {
  const data = useMemo(() => {
    const nodes: { name: string; fill?: string }[] = []
    const links: { source: number; target: number; value: number }[] = []

    // Helper to get node index or create it
    const getNodeIndex = (name: string, fill?: string) => {
      let index = nodes.findIndex(n => n.name === name)
      if (index === -1) {
        index = nodes.length
        nodes.push({ name, fill })
      } else if (fill && !nodes[index].fill) {
        // Update color if not set yet (e.g. created by link reference without color)
        nodes[index].fill = fill
      }
      return index
    }

    const budgetNodeName = 'Budget'
    const budgetNodeIndex = getNodeIndex(budgetNodeName, '#64748b') // Slate-500 for Budget

    // Helper to calculate normalized amount
    const getAmount = (item: BudgetItem) => {
      let amount = item.amount

      const calcView = view === 'percent' ? 'monthly' : view

      if (calcView === 'monthly' && item.frequency === 'yearly') amount /= 12
      if (calcView === 'yearly' && item.frequency === 'monthly') amount *= 12

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
             const currentCat = cat
             const currentVal = categoryFlows.get(currentCat.id) || 0
             categoryFlows.set(currentCat.id, currentVal + amount)

             // Ensure this category node exists
             getNodeIndex(cat.name, cat.color)

             links.push({
                 source: getNodeIndex(item.name),
                 target: getNodeIndex(cat.name),
                 value: amount
             })

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
    getNodeIndex(budgetNodeName, '#64748b')

    // --- UNIFIED LOGIC ---

    // 1. Income Items
    let calcTotalIncome = 0
    incomes.forEach(item => {
        const amount = getAmount(item)
        calcTotalIncome += amount
        if (amount <= 0) return

        const cat = item.categoryId ? categories.find(c => c.id === item.categoryId) : null
        const targetName = cat ? cat.name : budgetNodeName
        const targetColor = cat ? cat.color : undefined

        if (targetName) {
            // Ensure target node exists with color
            if (targetColor) getNodeIndex(targetName, targetColor)

            links.push({
                source: getNodeIndex(item.name, '#22c55e'), // Default Green for income items
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
        const cat = item.categoryId ? categories.find(c => c.id === item.categoryId) : null
        const sourceName = cat ? cat.name : budgetNodeName
        const sourceColor = cat ? cat.color : undefined

        if (sourceName) {
            if (sourceColor) getNodeIndex(sourceName, sourceColor)

            links.push({
                source: getNodeIndex(sourceName),
                target: getNodeIndex(item.name, '#ef4444'), // Default Red for expense items
                value: amount
            })
        }
    })

    // 3. Categories (Internal Links)
    categories.forEach(cat => {
        const total = getCategoryTotal(cat.id, cat.type)
        if (total <= 0) return

        // Ensure this category node exists with its color
        getNodeIndex(cat.name, cat.color)

        if (cat.type === 'income') {
            // Income Category: Flows TO Parent or Budget
            const parent = cat.parentId ? categories.find(c => c.id === cat.parentId) : null
            const targetName = parent ? parent.name : budgetNodeName
            const targetColor = parent ? parent.color : undefined

            if (targetName) {
                if (targetColor) getNodeIndex(targetName, targetColor)
                links.push({
                    source: getNodeIndex(cat.name),
                    target: getNodeIndex(targetName),
                    value: total
                })
            }
        } else {
            // Expense Category: Flows FROM Parent or Budget
            const parent = cat.parentId ? categories.find(c => c.id === cat.parentId) : null
            const sourceName = parent ? parent.name : budgetNodeName
            const sourceColor = parent ? parent.color : undefined

            if (sourceName) {
                 if (sourceColor) getNodeIndex(sourceName, sourceColor)
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
        target: getNodeIndex('Sparen / Verfügbar', '#10b981'), // Emerald-500
        value: savings
      })
    } else if (savings < 0) {
        const deficit = Math.abs(savings)
        links.push({
            source: getNodeIndex('Defizit', '#f43f5e'), // Rose-500
            target: budgetNodeIndex,
            value: deficit
        })
    }

    // Deduplicate links
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

    let finalLinks = Array.from(aggregatedLinks.values())

    // Convert to Percentage if view is percent
    if (view === 'percent' && totalIncome > 0) {
        finalLinks = finalLinks.map(l => ({
            ...l,
            value: (l.value / totalIncome) * 100
        }))
    }

    return {
        nodes,
        links: finalLinks
    }
  }, [incomes, expenses, categories, view, totalIncome])

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
          node={({ x, y, width, height, payload, containerWidth }: any) => {
              const nodeFill = payload.fill || '#8884d8'

              // Text Positioning Logic
              const centerX = x + width / 2
              const isLeft = x < containerWidth / 3
              const isRight = x > (containerWidth * 2) / 3

              let textX = centerX
              let textAnchor: 'start' | 'middle' | 'end' = 'middle'
              let textColor = '#fff'
              let textShadow = '0 0 2px rgba(0,0,0,0.5)'

              // If bar is too thin, move text outside
              if (width < 60 || height < 20) {
                  textColor = 'currentColor' // Use theme color
                  textShadow = 'none'

                  if (isLeft) {
                      textX = x + width + 6
                      textAnchor = 'start'
                  } else if (isRight) {
                      textX = x - 6
                      textAnchor = 'end'
                  } else {
                      // Middle nodes: if thin, keep above or just try center with background?
                      // Let's keep center but with shadow for now, or just hide if very small?
                      // Users said text in center is hard to read.
                      // Let's force it slightly above?
                  }
              }

              // Just enforce left/right labeling for input/output nodes regardless of width
              if (isLeft) {
                 textX = x - 6
                 textAnchor = 'end'
                 textColor = 'var(--foreground)' // Use CSS var for theme compatibility
                 textShadow = 'none'
              } else if (isRight) {
                 textX = x + width + 6
                 textAnchor = 'start'
                 textColor = 'var(--foreground)'
                 textShadow = 'none'
              }

              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={nodeFill}
                    fillOpacity={1}
                  />
                  <text
                    x={textX}
                    y={y + height / 2}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    fill={textColor}
                    fontSize={12}
                    fontWeight="500"
                    style={{ pointerEvents: 'none', textShadow }}
                  >
                    {height > 10 ? payload.name : ''}
                  </text>
                </g>
              )
          }}
          nodePadding={50}
          margin={{
            left: 100, // Increase margins for outside labels
            right: 100,
            top: 20,
            bottom: 20,
          }}
          link={(props: any) => {
              const { sourceX, sourceY, targetX, targetY, linkWidth, index, payload } = props
              const sourceColor = payload.source.fill || '#8884d8'
              const targetColor = payload.target.fill || '#8884d8'
              const gradientId = `linkGradient-${index}`

              return (
                  <g>
                      <defs>
                          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor={sourceColor} stopOpacity={0.4} />
                              <stop offset="100%" stopColor={targetColor} stopOpacity={0.4} />
                          </linearGradient>
                      </defs>
                      <path
                        d={`
                          M${sourceX},${sourceY + linkWidth / 2}
                          C${sourceX + (targetX - sourceX) / 2},${sourceY + linkWidth / 2}
                           ${sourceX + (targetX - sourceX) / 2},${targetY + linkWidth / 2}
                           ${targetX},${targetY + linkWidth / 2}
                          L${targetX},${targetY - linkWidth / 2}
                          C${sourceX + (targetX - sourceX) / 2},${targetY - linkWidth / 2}
                           ${sourceX + (targetX - sourceX) / 2},${sourceY - linkWidth / 2}
                           ${sourceX},${sourceY - linkWidth / 2}
                          Z
                        `}
                        fill={`url(#${gradientId})`}
                        stroke="none"
                        onMouseEnter={() => {}}
                      />
                  </g>
              )
          }}
        >
          <Tooltip
             isAnimationActive={false}
             content={({ active, payload }) => {
                 if (!active || !payload || !payload.length) return null
                 const data = payload[0]
                 const isLink = data.payload.source && data.payload.target

                 return (
                     <div className="bg-popover text-popover-foreground p-2 rounded-md shadow-md border text-sm">
                        {isLink ? (
                            <>
                                <div className="font-semibold mb-1">Fluss</div>
                                <div>{data.payload.source.name} → {data.payload.target.name}</div>
                                <div className="font-mono mt-1">
                                    {view === 'percent'
                                        ? `${Number(data.value).toFixed(1)}%`
                                        : Number(data.value).toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })
                                    }
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="font-semibold mb-1">{data.payload.name}</div>
                                <div className="font-mono">
                                    {view === 'percent'
                                        ? `${Number(data.value).toFixed(1)}%`
                                        : Number(data.value).toLocaleString('de-CH', { style: 'currency', currency: 'CHF' })
                                    }
                                </div>
                            </>
                        )}
                     </div>
                 )
             }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  )
}
