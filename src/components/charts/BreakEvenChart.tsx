import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { formatCurrency } from '../../lib/utils'
import { calculateYear0Data } from '../../lib/year0Utils'
import { CustomTooltip } from './CustomTooltip'
import type { YearlyCalculation, CalculationParams } from '../../types'

interface BreakEvenChartProps {
  data: YearlyCalculation[]
  breakEvenYear: number | null
  maxYears?: number
  params?: CalculationParams
}

export function BreakEvenChart({ data, breakEvenYear, maxYears = 30, params }: BreakEvenChartProps) {
  // Add year 0 if params are available
  const year0 = params ? calculateYear0Data(params) : null
  const fullData = year0 ? [year0, ...data] : data
  
  const chartData = fullData.slice(0, maxYears + 1).map((item) => ({
    year: item.year,
    'Kumulierte Kosten Miete': item.rentCumulativeCost,
    'Kumulierte Kosten Eigentum': item.ownershipCumulativeCost,
  }))
  
  // Milestone years for comparison cards (adjust for year 0 index)
  const YEAR_10 = 10  // Array index for year 10
  const YEAR_20 = 20 // Array index for year 20
  const YEAR_30 = 30 // Array index for year 30
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Break-Even Analyse</CardTitle>
        <CardDescription>
          {breakEvenYear 
            ? `Break-Even erreicht in Jahr ${breakEvenYear} - ab dann ist Eigentum günstiger`
            : 'Kein Break-Even in den ersten 50 Jahren - Miete bleibt günstiger'
          }
        </CardDescription>
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
              label={{ value: 'Kumulierte Kosten (CHF)', angle: -90, position: 'insideLeft', dx: -20 }}
            />
            <Tooltip 
              content={<CustomTooltip type="breakeven" data={fullData} params={params} />}
            />
            <Legend />
            
            {/* Shaded areas to show which is cheaper */}
            {breakEvenYear && breakEvenYear <= maxYears && (
              <>
                <ReferenceArea 
                  x1={0} 
                  x2={breakEvenYear} 
                  fill="#47C881" 
                  fillOpacity={0.1}
                  label={{ value: 'Miete günstiger', position: 'top' }}
                />
                <ReferenceArea 
                  x1={breakEvenYear} 
                  x2={maxYears} 
                  fill="#E8731B" 
                  fillOpacity={0.1}
                  label={{ value: 'Eigentum günstiger', position: 'top' }}
                />
              </>
            )}
            
            {/* Break-even line */}
            {breakEvenYear && breakEvenYear <= maxYears && (
              <ReferenceLine 
                x={breakEvenYear} 
                stroke="#666" 
                strokeDasharray="3 3"
                label={{ 
                  value: `Break-Even: Jahr ${breakEvenYear}`, 
                  position: 'top',
                  fill: '#666',
                  fontSize: 12
                }}
              />
            )}
            
            <Line 
              type="monotone" 
              dataKey="Kumulierte Kosten Miete" 
              stroke="#47C881" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Kumulierte Kosten Eigentum" 
              stroke="#E8731B" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-semibold mb-1">Nach 10 Jahren</h4>
            <p className="text-xs text-muted-foreground">Differenz:</p>
            <p className="font-mono text-sm">
              {formatCurrency(
                Math.abs(chartData[YEAR_10]['Kumulierte Kosten Eigentum'] - chartData[YEAR_10]['Kumulierte Kosten Miete'])
              )}
            </p>
            <p className="text-xs mt-1">
              {chartData[YEAR_10]['Kumulierte Kosten Eigentum'] < chartData[YEAR_10]['Kumulierte Kosten Miete'] 
                ? '✓ Eigentum günstiger' 
                : '✗ Miete günstiger'}
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-semibold mb-1">Nach 20 Jahren</h4>
            <p className="text-xs text-muted-foreground">Differenz:</p>
            <p className="font-mono text-sm">
              {formatCurrency(
                Math.abs(chartData[YEAR_20]['Kumulierte Kosten Eigentum'] - chartData[YEAR_20]['Kumulierte Kosten Miete'])
              )}
            </p>
            <p className="text-xs mt-1">
              {chartData[YEAR_20]['Kumulierte Kosten Eigentum'] < chartData[YEAR_20]['Kumulierte Kosten Miete'] 
                ? '✓ Eigentum günstiger' 
                : '✗ Miete günstiger'}
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-semibold mb-1">Nach 30 Jahren</h4>
            <p className="text-xs text-muted-foreground">Differenz:</p>
            <p className="font-mono text-sm">
              {formatCurrency(
                Math.abs(chartData[YEAR_30]['Kumulierte Kosten Eigentum'] - chartData[YEAR_30]['Kumulierte Kosten Miete'])
              )}
            </p>
            <p className="text-xs mt-1">
              {chartData[YEAR_30]['Kumulierte Kosten Eigentum'] < chartData[YEAR_30]['Kumulierte Kosten Miete'] 
                ? '✓ Eigentum günstiger' 
                : '✗ Miete günstiger'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
