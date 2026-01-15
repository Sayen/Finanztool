import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { formatCurrency } from '../../lib/utils'
import { calculateYear0Data } from '../../lib/year0Utils'
import { CustomTooltip } from './CustomTooltip'
import type { YearlyCalculation, CalculationParams } from '../../types'

interface OpportunityCostChartProps {
  data: YearlyCalculation[]
  maxYears?: number
  params?: CalculationParams
}

export function OpportunityCostChart({ data, maxYears = 30, params }: OpportunityCostChartProps) {
  // Add year 0 if params are available
  const year0 = params ? calculateYear0Data(params) : null
  const fullData = year0 ? [year0, ...data] : data
  
  const chartData = fullData.slice(0, maxYears + 1).map((item) => ({
    year: item.year,
    'Eigenkapital in Immobilie': item.netEquity,
    'Alternatives ETF-Investment': item.opportunityCostETF,
  }))
  
  const finalYear = chartData[chartData.length - 1]
  const difference = finalYear['Alternatives ETF-Investment'] - finalYear['Eigenkapital in Immobilie']
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opportunitätskosten-Analyse</CardTitle>
        <CardDescription>
          Vergleich: Eigenkapital in Immobilie vs. alternatives ETF-Investment
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
              label={{ value: 'Vermögenswert (CHF)', angle: -90, position: 'insideLeft', dy: 50 }}
            />
            <Tooltip 
              content={<CustomTooltip type="opportunity" data={fullData} params={params} />}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Eigenkapital in Immobilie" 
              stroke="#E8731B" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Alternatives ETF-Investment" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-3">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Opportunitätskosten nach {maxYears} Jahren</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Eigenkapital in Immobilie:</p>
                <p className="text-xl font-mono text-orange-600">
                  {formatCurrency(finalYear['Eigenkapital in Immobilie'])}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Alternatives ETF-Investment:</p>
                <p className="text-xl font-mono text-blue-600">
                  {formatCurrency(finalYear['Alternatives ETF-Investment'])}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">Differenz:</p>
              <p className={`text-xl font-mono ${difference > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {difference > 0 ? '+' : ''}{formatCurrency(difference)}
              </p>
              <p className="text-xs mt-1">
                {difference > 0 
                  ? '📈 ETF-Investment hätte mehr Rendite gebracht' 
                  : '🏠 Immobilie hat besseren Vermögensaufbau'
                }
              </p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              💡 <strong>Hinweis:</strong> Diese Analyse zeigt, was mit dem Eigenkapital passiert wäre, 
              wenn es statt in die Immobilie in einen diversifizierten ETF investiert worden wäre. 
              Berücksichtigt sind die Wertsteigerung der Immobilie und die Amortisation der Hypothek 
              vs. die angenommene ETF-Rendite.
            </p>
            <p className="mt-2">
              <strong>Wichtig:</strong> Wohneigentum bietet auch nicht-finanzielle Vorteile wie 
              Sicherheit, Gestaltungsfreiheit und Schutz vor Mieterhöhungen, die in dieser 
              rein finanziellen Betrachtung nicht berücksichtigt sind.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
