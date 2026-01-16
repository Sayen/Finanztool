import { TooltipProps } from 'recharts'

interface DarkModeTooltipProps extends TooltipProps<number, string> {
  // Additional props if needed
}

/**
 * A dark-mode compatible tooltip wrapper for Recharts
 * Uses Tailwind CSS custom properties to respect theme
 */
export function DarkModeTooltip({ active, payload, label }: DarkModeTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="bg-popover border border-border text-popover-foreground rounded-lg shadow-lg p-3">
      <div className="font-semibold text-sm mb-2">{label}</div>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-mono font-semibold ml-auto">
              {entry.value !== undefined && entry.formatter 
                ? entry.formatter(entry.value, entry.name || '', entry, index, payload)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
