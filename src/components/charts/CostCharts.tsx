import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { formatCurrency } from '../../lib/utils'
import type { YearlyCalculation } from '../../types'

interface CostComparisonChartProps {
  data: YearlyCalculation[]
  maxYears?: number
}

export function CostComparisonChart({ data, maxYears = 30 }: CostComparisonChartProps) {
  const chartData = data.slice(0, maxYears).map((item) => ({
    year: item.year,
    Miete: item.rentCumulativeCost,
    Eigentum: item.ownershipCumulativeCost,
  }))
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kumulierte Kosten über Zeit</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Jahre', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value as number, 0)}
              label={{ value: 'Kosten (CHF)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(value as number)}
              labelFormatter={(label) => `Jahr ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Miete" 
              stroke="#47C881" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Eigentum" 
              stroke="#E8731B" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface WealthChartProps {
  data: YearlyCalculation[]
  maxYears?: number
}

export function WealthChart({ data, maxYears = 30 }: WealthChartProps) {
  const chartData = data.slice(0, maxYears).map((item) => ({
    year: item.year,
    'Nettovermögen Miete': item.netWealthRent,
    'Nettovermögen Eigentum': item.netWealthOwnership,
  }))
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nettovermögen Entwicklung</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Jahre', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value as number, 0)}
              label={{ value: 'Vermögen (CHF)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(value as number)}
              labelFormatter={(label) => `Jahr ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Nettovermögen Miete" 
              stroke="#47C881" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Nettovermögen Eigentum" 
              stroke="#E8731B" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
