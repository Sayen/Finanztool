import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { formatCurrency } from '../../lib/utils'
import type { YearlyCalculation } from '../../types'

interface CashflowChartProps {
  data: YearlyCalculation[]
}

export function CashflowChart({ data }: CashflowChartProps) {
  // Show first 12 months (year 1) broken down monthly
  const yearData = data[0]
  
  if (!yearData) {
    return null
  }
  
  // Create monthly data for first year
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: `Monat ${i + 1}`,
    'Miete': yearData.rentCost / 12,
    'Nebenkosten (Miete)': (yearData.rentUtilities + yearData.rentInsurance) / 12,
    'Hypothekarzins': yearData.ownershipMortgageInterest / 12,
    'Amortisation': yearData.ownershipAmortization / 12,
    'Nebenkosten (Eigentum)': (yearData.ownershipUtilities + yearData.ownershipInsurance) / 12,
    'Unterhalt': yearData.ownershipMaintenance / 12,
  }))
  
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
              label={{ value: 'Kosten (CHF)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
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
