import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { formatCurrency } from '../../lib/utils'
import { DarkModeTooltip } from './DarkModeTooltip'
import type { YearlyCalculation } from '../../types'

interface TaxChartProps {
  data: YearlyCalculation[]
  displayYears?: number[]
  maxYears?: number
}

export function TaxChart({ data, displayYears, maxYears = 30 }: TaxChartProps) {
  // Use displayYears if provided, otherwise use default years based on maxYears
  const yearsToDisplay = displayYears || [1, 5, 10, 15, 20, Math.min(30, maxYears)]
  const chartData = yearsToDisplay
    .filter(year => year <= data.length && year <= maxYears)
    .map((year) => {
      const item = data[year - 1]
      return {
        year: `Jahr ${year}`,
        'Zinsabzug (Ersparnis)': item.taxSavingsInterestDeduction,
        'Eigenmietwert (Steuerlast)': -item.rentalValueTax, // Negative for visual stacking
        'Netto-Steuereffekt': item.netTaxEffect,
      }
    })
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Steuerliche Auswirkungen</CardTitle>
        <CardDescription>
          Vergleich von Zinsabzug (Ersparnis) und Eigenmietwert (Steuerlast) bei Wohneigentum
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis 
              tickFormatter={(value) => formatCurrency(Math.abs(value) as number, 0)}
              label={{ value: 'Steuerbetrag (CHF)', angle: -90, position: 'insideLeft', dx: -10 }}
              width={90}
            />
            <Tooltip 
              content={<DarkModeTooltip />}
              formatter={(value: number | undefined) => value !== undefined ? formatCurrency(Math.abs(value)) : ''}
              labelFormatter={(label) => label}
            />
            <Legend />
            <Bar dataKey="Zinsabzug (Ersparnis)" fill="#22c55e" />
            <Bar dataKey="Eigenmietwert (Steuerlast)" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold mb-2">Netto-Steuereffekte</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">{item.year}:</span>
                  <span className={`font-mono ${item['Netto-Steuereffekt'] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item['Netto-Steuereffekt'])}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              💡 <strong>Hinweis:</strong> Grün = Steuerersparnis (Zinsabzug grösser als Eigenmietwert), 
              Rot = Steuerlast (Eigenmietwert grösser als Zinsabzug). 
              Mit sinkender Hypothek verschlechtert sich der Steuereffekt über Zeit.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
