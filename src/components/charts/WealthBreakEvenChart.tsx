import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { formatCurrency } from '../../lib/utils'
import type { YearlyCalculation } from '../../types'

interface WealthBreakEvenChartProps {
  data: YearlyCalculation[]
  maxYears?: number
}

export function WealthBreakEvenChart({ data, maxYears = 30 }: WealthBreakEvenChartProps) {
  const chartData = data.slice(0, maxYears).map((item) => ({
    year: item.year,
    'Nettovermögen Miete': item.netWealthRent,
    'Nettovermögen Eigentum': item.netWealthOwnership,
  }))
  
  // Calculate wealth break-even year (when netWealthOwnership > netWealthRent)
  let wealthBreakEvenYear: number | null = null
  for (let i = 0; i < data.length && i < maxYears; i++) {
    if (data[i].netWealthOwnership > data[i].netWealthRent) {
      wealthBreakEvenYear = data[i].year
      break
    }
  }
  
  // Milestone years for comparison cards
  const YEAR_10 = 9  // Array index for year 10
  const YEAR_20 = 19 // Array index for year 20
  const YEAR_30 = 29 // Array index for year 30
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vermögens-Break-Even Analyse</CardTitle>
        <CardDescription>
          {wealthBreakEvenYear 
            ? `Vermögens-Break-Even erreicht in Jahr ${wealthBreakEvenYear} - ab dann lohnt sich die Investition des Eigenkapitals`
            : 'Kein Vermögens-Break-Even in den ersten 50 Jahren - Miete mit alternativer Anlage bleibt vermögensoptimal'
          }
          <br />
          Wann lohnt sich die Investition des Eigenkapitals unter Berücksichtigung alternativer Anlagen?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Jahre', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value as number, 0)}
              label={{ value: 'Gesamtvermögen (CHF)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(value as number)}
              labelFormatter={(label) => `Jahr ${label}`}
            />
            <Legend 
              verticalAlign="bottom"
              height={40}
              wrapperStyle={{ paddingTop: '10px' }}
            />
            
            {/* Shaded areas to show which scenario has higher wealth */}
            {wealthBreakEvenYear && wealthBreakEvenYear <= maxYears && (
              <>
                <ReferenceArea 
                  x1={1} 
                  x2={wealthBreakEvenYear} 
                  fill="#47C881" 
                  fillOpacity={0.1}
                />
                <ReferenceArea 
                  x1={wealthBreakEvenYear} 
                  x2={maxYears} 
                  fill="#E8731B" 
                  fillOpacity={0.1}
                />
              </>
            )}
            
            {/* Break-even line */}
            {wealthBreakEvenYear && wealthBreakEvenYear <= maxYears && (
              <ReferenceLine 
                x={wealthBreakEvenYear} 
                stroke="#666" 
                strokeDasharray="3 3"
                label={{ 
                  value: `Vermögens-Break-Even: Jahr ${wealthBreakEvenYear}`, 
                  position: 'top',
                  fill: '#666',
                  fontSize: 12
                }}
              />
            )}
            
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
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-semibold mb-1">Nach 10 Jahren</h4>
            <p className="text-xs text-muted-foreground">Vermögensdifferenz:</p>
            <p className="font-mono text-sm">
              {formatCurrency(
                Math.abs(chartData[YEAR_10]['Nettovermögen Eigentum'] - chartData[YEAR_10]['Nettovermögen Miete'])
              )}
            </p>
            <p className="text-xs mt-1">
              {chartData[YEAR_10]['Nettovermögen Eigentum'] > chartData[YEAR_10]['Nettovermögen Miete'] 
                ? '✓ Eigentum vermögensoptimal' 
                : '✗ Miete vermögensoptimal'}
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-semibold mb-1">Nach 20 Jahren</h4>
            <p className="text-xs text-muted-foreground">Vermögensdifferenz:</p>
            <p className="font-mono text-sm">
              {formatCurrency(
                Math.abs(chartData[YEAR_20]['Nettovermögen Eigentum'] - chartData[YEAR_20]['Nettovermögen Miete'])
              )}
            </p>
            <p className="text-xs mt-1">
              {chartData[YEAR_20]['Nettovermögen Eigentum'] > chartData[YEAR_20]['Nettovermögen Miete'] 
                ? '✓ Eigentum vermögensoptimal' 
                : '✗ Miete vermögensoptimal'}
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-semibold mb-1">Nach 30 Jahren</h4>
            <p className="text-xs text-muted-foreground">Vermögensdifferenz:</p>
            <p className="font-mono text-sm">
              {formatCurrency(
                Math.abs(chartData[YEAR_30]['Nettovermögen Eigentum'] - chartData[YEAR_30]['Nettovermögen Miete'])
              )}
            </p>
            <p className="text-xs mt-1">
              {chartData[YEAR_30]['Nettovermögen Eigentum'] > chartData[YEAR_30]['Nettovermögen Miete'] 
                ? '✓ Eigentum vermögensoptimal' 
                : '✗ Miete vermögensoptimal'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
