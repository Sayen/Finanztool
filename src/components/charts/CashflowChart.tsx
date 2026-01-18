import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { formatCurrency } from '../../lib/utils'
import { DarkModeTooltip } from './DarkModeTooltip'
import type { YearlyCalculation } from '../../types'

interface CashflowChartProps {
  data: YearlyCalculation[]
  maxYears?: number
}

export function CashflowChart({ data }: CashflowChartProps) {
  // Show first 12 months (year 1) broken down monthly
  // Note: maxYears parameter accepted for interface consistency but not used (chart only shows first year)
  const yearData = data[0]
  
  const monthlyData = useMemo(() => {
    if (!yearData) {
      return []
    }

    // Create monthly data for first year
    return Array.from({ length: 12 }, (_, i) => ({
      month: `Monat ${i + 1}`,
      'Miete': yearData.rentCost / 12,
      'Nebenkosten (Miete)': (yearData.rentUtilities + yearData.rentInsurance) / 12,
      'Hypothekarzins': yearData.ownershipMortgageInterest / 12,
      'Amortisation': yearData.ownershipAmortization / 12,
      'Nebenkosten (Eigentum)': (yearData.ownershipUtilities + yearData.ownershipInsurance) / 12,
      'Unterhalt': yearData.ownershipMaintenance / 12,
    }))
  }, [yearData])

  if (!yearData) {
    return null
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monatlicher Cashflow (Erstes Jahr)</CardTitle>
        <CardDescription>
          Vergleich der monatlichen Ausgaben für Miete vs. Eigentum
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value as number, 0)}
              label={{ value: 'Betrag (CHF)', angle: -90, position: 'insideLeft', dx: -10 }}
              width={90}
            />
            <Tooltip 
              content={<DarkModeTooltip />}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Legend />
            <Bar dataKey="Miete" stackId="rent" fill="#47C881" />
            <Bar dataKey="Nebenkosten (Miete)" stackId="rent" fill="#60D394" />
            <Bar dataKey="Hypothekarzins" stackId="ownership" fill="#E8731B" />
            <Bar dataKey="Amortisation" stackId="ownership" fill="#F59E42" />
            <Bar dataKey="Nebenkosten (Eigentum)" stackId="ownership" fill="#FFB366" />
            <Bar dataKey="Unterhalt" stackId="ownership" fill="#FFC98A" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
