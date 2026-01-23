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

    // Helper for category totals (moved up for sorting)
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

    // --- SORTING REMOVED ---
    // Using original order to respect user's manual arrangement or insertion order
    const sortedIncomes = [...incomes]
    const sortedExpenses = [...expenses]
    const sortedCategories = [...categories]

    // --- UNIFIED LOGIC ---

    // 1. Income Items
    let calcTotalIncome = 0
    sortedIncomes.forEach(item => {
        const amount = getAmount(item)
        calcTotalIncome += amount
        if (amount <= 0) return

        const cat = item.categoryId ? sortedCategories.find(c => c.id === item.categoryId) : null
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
    sortedExpenses.forEach(item => {
        const amount = getAmount(item)
        calcTotalExpense += amount
        if (amount <= 0) return

        // Flow: Category/Budget -> Item
        const cat = item.categoryId ? sortedCategories.find(c => c.id === item.categoryId) : null
        const sourceName = cat ? cat.name : budgetNodeName
        const sourceColor = cat ? cat.color : undefined

        if (sourceName) {
            if (sourceColor) getNodeIndex(sourceName, sourceColor)

            links.push({
                source: getNodeIndex(sourceName),
                // INHERIT COLOR from Source (Category) for the Expense Item Bar
                target: getNodeIndex(item.name, sourceColor || '#ef4444'),
                value: amount
            })
        }
    })

    // 3. Categories (Internal Links)
    sortedCategories.forEach(cat => {
        const total = getCategoryTotal(cat.id, cat.type)
        if (total <= 0) return

        // Ensure this category node exists with its color
        getNodeIndex(cat.name, cat.color)

        if (cat.type === 'income') {
            // Income Category: Flows TO Parent or Budget
            const parent = cat.parentId ? sortedCategories.find(c => c.id === cat.parentId) : null
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
            const parent = cat.parentId ? sortedCategories.find(c => c.id === cat.parentId) : null
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

  // Calculate dynamic height based on node count to prevent overlap
  // Base height 600px, add 35px per node if we have many nodes
  const dynamicHeight = Math.max(600, data.nodes.length * 35)

  // Recharts Sankey types might be incomplete in this version, so we cast to any for nodeSort
  // to avoid TS errors while keeping the functionality which is supported by the underlying lib.
  const SankeyComponent = Sankey as any

  return (
    <div
      className="w-full bg-card rounded-xl border p-4 overflow-x-auto overflow-y-hidden"
      style={{ height: dynamicHeight }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <SankeyComponent
          data={data}
          iterations={0}
          // nodeSort removed to respect input order
          node={({ x, y, width, height, payload }: any) => {
              const nodeFill = payload.fill || '#8884d8'

              // Text Positioning Logic
              const isIncomeLayer = x < 250

              let textX = 0
              let textAnchor: 'start' | 'end'
              let textColor = 'var(--foreground)'
              let textShadow = 'none'

              if (isIncomeLayer) {
                  // Income nodes: Text on Right of bar
                  textX = x + width + 6
                  textAnchor = 'start'
              } else {
                  // All other nodes: Text on Left of bar
                  textX = x - 6
                  textAnchor = 'end'
              }

              // Format the value for the label
              const valueText = view === 'percent'
                  ? `${Number(payload.value).toFixed(1)}%`
                  : Number(payload.value).toLocaleString('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 })

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
                  {height > 10 && (
                      <text
                        x={textX}
                        y={y + height / 2}
                        textAnchor={textAnchor}
                        fill={textColor}
                        fontSize={12}
                        fontWeight="500"
                        style={{ pointerEvents: 'none', textShadow }}
                      >
                         {/* Name on first line */}
                         <tspan x={textX} dy={height > 20 ? "-0.4em" : "0.3em"}>
                             {payload.name}
                         </tspan>

                         {/* Amount on second line (if height permits) */}
                         {height > 20 && (
                             <tspan x={textX} dy="1.2em" fontSize={10} fillOpacity={0.7} fontWeight="400">
                                 {valueText}
                             </tspan>
                         )}
                      </text>
                  )}
                </g>
              )
          }}
          nodePadding={50}
          margin={{
            left: 100,
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
        </SankeyComponent>
      </ResponsiveContainer>
    </div>
  )
}
