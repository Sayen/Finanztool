import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { calculateYear0Data } from '../../lib/year0Utils'
import { CustomTooltip } from './CustomTooltip'
import type { CalculationParams, YearlyCalculation } from '../../types'

interface AffordabilityChartProps {
  params: CalculationParams
  maxYears?: number
}

const AFFORDABILITY_CALC_RATE = 5.0 // 5% kalkulatorischer Zins
const AFFORDABILITY_MAX_RATIO = 33.33 // 33% rule

export function AffordabilityChart({ params, maxYears = 30 }: AffordabilityChartProps) {
  const monthlyIncome = params.quickStart.householdIncome / 12
  const totalMortgage = params.mortgage.firstMortgage + params.mortgage.secondMortgage
  
  // Add year 0 data
  const year0Data: YearlyCalculation = calculateYear0Data(params)
  
  // Calculate year 0 affordability
  const calculatedInterestYear0 = totalMortgage * AFFORDABILITY_CALC_RATE / 100
  const annualAmortizationYear0 = params.mortgage.secondMortgage / params.mortgage.amortizationYears
  const annualCostsYear0 = calculatedInterestYear0 + annualAmortizationYear0 + 
                          (params.runningCosts.utilities + (params.runningCosts.parkingCost || 0) + 
                           (params.runningCosts.condominiumFees || 0)) * 12 +
                          params.runningCosts.insurance +
                          (params.runningCosts.renovationReserve || 0) +
                          (params.purchase.purchasePrice * params.runningCosts.maintenanceSimple / 100)
  const monthlyCostsYear0 = annualCostsYear0 / 12
  const utilizationPercentYear0 = (monthlyCostsYear0 / monthlyIncome) * 100
  
  // Calculate affordability over time (years 1-maxYears)
  const chartDataYears = Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1
    
    // Calculate mortgage balance after amortization
    const yearsAmortized = Math.min(year, params.mortgage.amortizationYears)
    const amortizedAmount = params.mortgage.secondMortgage * (yearsAmortized / params.mortgage.amortizationYears)
    const remainingMortgage = totalMortgage - amortizedAmount
    
    // Calculate with 5% calculation rate
    const calculatedInterest = remainingMortgage * AFFORDABILITY_CALC_RATE / 100
    const annualAmortization = year <= params.mortgage.amortizationYears 
      ? params.mortgage.secondMortgage / params.mortgage.amortizationYears
      : 0
    
    // Apply inflation to running costs
    const inflationFactor = Math.pow(1 + params.additional.inflationRate / 100, year - 1)
    const annualCosts = calculatedInterest + annualAmortization + 
                        (params.runningCosts.utilities + 
                         (params.runningCosts.parkingCost || 0) +
                         (params.runningCosts.condominiumFees || 0)) * 12 * inflationFactor +
                        (params.runningCosts.insurance + 
                         (params.runningCosts.renovationReserve || 0)) * inflationFactor +
                        (params.purchase.purchasePrice * params.runningCosts.maintenanceSimple / 100) * inflationFactor
    
    const monthlyCosts = annualCosts / 12
    const utilizationPercent = (monthlyCosts / monthlyIncome) * 100
    
    return {
      year,
      'Tragbarkeit (%)': utilizationPercent,
    }
  })
  
  // Combine year 0 with other years
  const fullData: YearlyCalculation[] = [year0Data, ...Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1
    const yearsAmortized = Math.min(year, params.mortgage.amortizationYears)
    const amortizedAmount = params.mortgage.secondMortgage * (yearsAmortized / params.mortgage.amortizationYears)
    const remainingMortgage = totalMortgage - amortizedAmount
    return { ...year0Data, year, mortgageBalance: remainingMortgage } as YearlyCalculation
  })]
  
  const chartData = [
    {
      year: 0,
      'Tragbarkeit (%)': utilizationPercentYear0,
    },
    ...chartDataYears
  ]
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tragbarkeitsentwicklung</CardTitle>
        <CardDescription>
          Entwicklung der Kostenbelastung im Verhältnis zum Einkommen (33%-Regel als Referenz)
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
              label={{ value: 'Tragbarkeit (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 50]}
            />
            <Tooltip 
              content={<CustomTooltip type="affordability" data={fullData} params={params} />}
            />
            <Legend />
            <ReferenceLine 
              y={AFFORDABILITY_MAX_RATIO} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ value: '33% Grenze', position: 'right' }}
            />
            <Line 
              type="monotone" 
              dataKey="Tragbarkeit (%)" 
              stroke="#E8731B" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            💡 <strong>Tragbarkeitsregel:</strong> Die jährlichen Wohnkosten sollten maximal 33% des Bruttoeinkommens betragen,
            berechnet mit einem kalkulatorischen Zinssatz von 5%.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
