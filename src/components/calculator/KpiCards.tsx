import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { formatCurrency, formatPercent } from '../../lib/utils'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  status?: 'success' | 'warning' | 'error'
  icon?: React.ReactNode
}

export function KpiCard({ title, value, subtitle, trend, status, icon }: KpiCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }
  
  const getStatusColor = () => {
    if (status === 'success') return 'border-green-500 bg-green-50 dark:bg-green-900/20'
    if (status === 'warning') return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    if (status === 'error') return 'border-red-500 bg-red-50 dark:bg-red-900/20'
    return ''
  }
  
  return (
    <Card className={`${getStatusColor()}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span>{title}</span>
          {icon || getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface ResultsOverviewProps {
  monthlyRent: number
  monthlyOwnership: number
  isAffordable: boolean
  utilizationPercent: number
  breakEvenYear: number | null
  equityAfter10Years: number
}

export function ResultsOverview({
  monthlyRent,
  monthlyOwnership,
  isAffordable,
  utilizationPercent,
  breakEvenYear,
  equityAfter10Years,
}: ResultsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <KpiCard
        title="Monatliche Miete"
        value={formatCurrency(monthlyRent)}
        subtitle="Netto-Miete pro Monat"
        icon={<span className="text-rent">●</span>}
      />
      
      <KpiCard
        title="Monatliche Kosten Eigentum"
        value={formatCurrency(monthlyOwnership)}
        subtitle="Zins, Amortisation & Nebenkosten"
        icon={<span className="text-ownership">●</span>}
      />
      
      <KpiCard
        title="Tragbarkeit"
        value={formatPercent(utilizationPercent, 1)}
        subtitle={isAffordable ? 'Tragbar ✓' : 'Nicht tragbar ✗'}
        status={isAffordable ? 'success' : 'error'}
        icon={isAffordable ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      />
      
      <KpiCard
        title="Break-Even"
        value={breakEvenYear ? `Jahr ${breakEvenYear}` : 'Nicht erreicht'}
        subtitle="Wann lohnt sich Eigentum?"
      />
      
      <KpiCard
        title="Eigenkapital nach 10 Jahren"
        value={formatCurrency(equityAfter10Years)}
        subtitle="Vermögensaufbau"
        trend="up"
      />
      
      <KpiCard
        title="Monatliche Differenz"
        value={formatCurrency(Math.abs(monthlyOwnership - monthlyRent))}
        subtitle={monthlyOwnership > monthlyRent ? 'Eigentum teurer' : 'Miete teurer'}
        trend={monthlyOwnership > monthlyRent ? 'down' : 'up'}
      />
    </div>
  )
}
