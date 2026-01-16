import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { formatCurrency } from '../../lib/utils'
import { calculateYear0Data } from '../../lib/year0Utils'
import { CustomTooltip } from './CustomTooltip'
import type { YearlyCalculation, CalculationParams } from '../../types'

interface CostComparisonChartProps {
  data: YearlyCalculation[]
  maxYears?: number
  params?: CalculationParams
}

export function CostComparisonChart({ data, maxYears = 30, params }: CostComparisonChartProps) {
  // Add year 0 if params are available
  const year0 = params ? calculateYear0Data(params) : null
  const fullData = year0 ? [year0, ...data] : data
  
  const chartData = fullData.slice(0, maxYears + 1).map((item) => ({
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
              label={{ value: 'Kumulierte Kosten (CHF)', angle: -90, position: 'insideLeft' }}
              width={80}
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
  params?: CalculationParams
}

export function WealthChart({ data, maxYears = 30, params }: WealthChartProps) {
  // Add year 0 if params are available
  const year0 = params ? calculateYear0Data(params) : null
  const fullData = year0 ? [year0, ...data] : data
  
  const chartData = fullData.slice(0, maxYears + 1).map((item) => ({
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
              label={{ value: 'Nettovermögen (CHF)', angle: -90, position: 'insideLeft' }}
              width={80}
            />
            <Tooltip 
              content={<CustomTooltip type="wealth" data={fullData} params={params} />}
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

interface AnnualCostBreakdownProps {
  data: YearlyCalculation[]
  displayYears?: number[]
  maxYears?: number
}

export function AnnualCostBreakdown({ data, displayYears, maxYears = 30 }: AnnualCostBreakdownProps) {
  // Use displayYears if provided, otherwise use default years based on maxYears
  const yearsToDisplay = displayYears || [1, 5, 10, 15, 20, Math.min(30, maxYears)]
  const chartData = yearsToDisplay
    .filter(year => year <= data.length && year <= maxYears)
    .map((year) => {
      const item = data[year - 1]
      return {
        year: `Jahr ${year}`,
        'Miete': item.rentCost,
        'Nebenkosten (Miete)': item.rentUtilities + item.rentInsurance,
        'Hypothekarzins': item.ownershipMortgageInterest,
        'Amortisation': item.ownershipAmortization,
        'Nebenkosten (Eigentum)': item.ownershipUtilities + item.ownershipInsurance,
        'Unterhalt': item.ownershipMaintenance,
      }
    })
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jährliche Kostenaufteilung</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value as number, 0)}
              label={{ value: 'Jährliche Kosten (CHF)', angle: -90, position: 'insideLeft' }}
              width={80}
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
