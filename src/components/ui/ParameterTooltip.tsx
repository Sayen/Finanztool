import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip'
import { Info } from 'lucide-react'
import { TOOLTIPS } from '../../lib/tooltips'

interface ParameterTooltipProps {
  paramKey: keyof typeof TOOLTIPS
}

export function ParameterTooltip({ paramKey }: ParameterTooltipProps) {
  const tooltip = TOOLTIPS[paramKey]
  
  if (!tooltip) {
    return null
  }
  
  return (
    <Tooltip>
      <TooltipTrigger type="button">
        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-md">
        <p className="font-semibold mb-1">{tooltip.title}</p>
        <p className="text-sm mb-2">{tooltip.description}</p>
        <p className="text-sm text-muted-foreground">
          <strong>Einfluss:</strong> {tooltip.impact}
        </p>
        {tooltip.hint && (
          <p className="text-xs mt-1 text-muted-foreground">
            {tooltip.hint}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
