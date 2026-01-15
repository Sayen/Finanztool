import { formatCurrency, formatPercent } from '../../lib/utils'
import type { YearlyCalculation, CalculationParams } from '../../types'

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string | number
  type: 'cost' | 'wealth' | 'breakeven' | 'totalAssets' | 'opportunity' | 'affordability'
  data?: YearlyCalculation[]
  params?: CalculationParams
}

export function CustomTooltip({ active, payload, label, type, data, params }: CustomTooltipProps) {
  if (!active || !payload || !payload.length || !data) return null
  
  const year = typeof label === 'number' ? label : parseInt(label as string, 10)
  const currentData = data.find(d => d.year === year)
  const previousData = year > 0 ? data.find(d => d.year === year - 1) || null : null
  
  if (!currentData) return null
  
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[280px] max-w-[400px]">
      <div className="font-semibold text-sm mb-2 pb-2 border-b border-border">
        Jahr {year}
      </div>
      
      {type === 'cost' && <CostTooltipContent currentData={currentData} />}
      {type === 'wealth' && <WealthTooltipContent currentData={currentData} previousData={previousData} params={params} />}
      {type === 'breakeven' && <BreakEvenTooltipContent currentData={currentData} />}
      {type === 'totalAssets' && <TotalAssetsTooltipContent currentData={currentData} previousData={previousData} />}
      {type === 'opportunity' && <OpportunityTooltipContent currentData={currentData} params={params} />}
      {type === 'affordability' && <AffordabilityTooltipContent currentData={currentData} params={params} />}
    </div>
  )
}

function CostTooltipContent({ currentData }: { currentData: YearlyCalculation }) {
  const rentDiff = currentData.rentCumulativeCost - currentData.ownershipCumulativeCost
  const isRentCheaper = rentDiff < 0
  
  return (
    <div className="space-y-3 text-xs">
      <div>
        <div className="font-semibold mb-1">📊 Kumulierte Kosten</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Miete:</span>
            <span className="font-mono">{formatCurrency(currentData.rentCumulativeCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eigentum:</span>
            <span className="font-mono">{formatCurrency(currentData.ownershipCumulativeCost)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border">
            <span className="text-muted-foreground">Differenz:</span>
            <span className="font-mono font-semibold">
              {formatCurrency(Math.abs(rentDiff))}
              <span className="text-[10px] ml-1">({isRentCheaper ? 'Eigentum' : 'Miete'} günstiger)</span>
            </span>
          </div>
        </div>
      </div>
      
      {currentData.year > 0 && (
        <>
          <div>
            <div className="font-semibold mb-1">📈 Jährliche Kosten (Jahr {currentData.year})</div>
            <div className="space-y-1 ml-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Miete:</span>
                <span className="font-mono">{formatCurrency(currentData.rentTotalAnnual)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Eigentum:</span>
                <span className="font-mono">{formatCurrency(currentData.ownershipTotalAnnual)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="font-semibold mb-1">💰 Kostenaufteilung Eigentum</div>
            <div className="space-y-1 ml-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hypothekarzins:</span>
                <span className="font-mono">{formatCurrency(currentData.ownershipMortgageInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amortisation:</span>
                <span className="font-mono">{formatCurrency(currentData.ownershipAmortization)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nebenkosten:</span>
                <span className="font-mono">{formatCurrency(currentData.ownershipUtilities + currentData.ownershipInsurance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unterhalt:</span>
                <span className="font-mono">{formatCurrency(currentData.ownershipMaintenance)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function WealthTooltipContent({ currentData, previousData, params }: { currentData: YearlyCalculation; previousData: YearlyCalculation | null; params?: CalculationParams }) {
  const rentDelta = previousData ? currentData.netWealthRent - previousData.netWealthRent : 0
  const ownershipDelta = previousData ? currentData.netWealthOwnership - previousData.netWealthOwnership : 0
  const wealthDiff = currentData.netWealthOwnership - currentData.netWealthRent
  
  const propertyAppreciationRate = params?.additional?.propertyAppreciationRate || 2.0
  const etfReturnRate = params?.additional?.etfReturnRate || 6.0
  
  return (
    <div className="space-y-3 text-xs">
      <div>
        <div className="font-semibold mb-1">💎 Nettovermögen</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Miete:</span>
            <span className="font-mono">
              {formatCurrency(currentData.netWealthRent)}
              {previousData && <span className="text-green-600 ml-1">(+{formatCurrency(rentDelta)})</span>}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eigentum:</span>
            <span className="font-mono">
              {formatCurrency(currentData.netWealthOwnership)}
              {previousData && <span className="text-green-600 ml-1">(+{formatCurrency(ownershipDelta)})</span>}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border">
            <span className="text-muted-foreground">Differenz:</span>
            <span className="font-mono font-semibold">{formatCurrency(Math.abs(wealthDiff))}</span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="font-semibold mb-1">🏠 Immobilie (Eigentum)</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wert:</span>
            <span className="font-mono">
              {formatCurrency(currentData.propertyValue)}
              <span className="text-green-600 text-[10px] ml-1">(↑ +{formatPercent(propertyAppreciationRate, 1)} p.a.)</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hypothek:</span>
            <span className="font-mono">
              {formatCurrency(currentData.mortgageBalance)}
              {previousData && previousData.mortgageBalance > currentData.mortgageBalance && (
                <span className="text-green-600 text-[10px] ml-1">(↓ -{formatCurrency(previousData.mortgageBalance - currentData.mortgageBalance)})</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eigenkapital:</span>
            <span className="font-mono font-semibold">{formatCurrency(currentData.netEquity)}</span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="font-semibold mb-1">📈 Investitionen (Miete)</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ETF-Depot:</span>
            <span className="font-mono">
              {formatCurrency(currentData.netWealthRent)}
              <span className="text-green-600 text-[10px] ml-1">(↑ +{formatPercent(etfReturnRate, 1)} p.a.)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function BreakEvenTooltipContent({ currentData }: { currentData: YearlyCalculation }) {
  const rentDiff = currentData.ownershipCumulativeCost - currentData.rentCumulativeCost
  const percentCheaper = Math.abs((rentDiff / Math.max(currentData.rentCumulativeCost, currentData.ownershipCumulativeCost)) * 100)
  
  return (
    <div className="space-y-3 text-xs">
      <div>
        <div className="font-semibold mb-1">📊 Kumulierte Kosten</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Miete:</span>
            <span className="font-mono">{formatCurrency(currentData.rentCumulativeCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eigentum:</span>
            <span className="font-mono">{formatCurrency(currentData.ownershipCumulativeCost)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border">
            <span className="text-muted-foreground">Differenz:</span>
            <span className="font-mono font-semibold">
              {formatCurrency(Math.abs(rentDiff))}
              <span className="text-[10px] ml-1">({formatPercent(percentCheaper, 1)} günstiger)</span>
            </span>
          </div>
        </div>
      </div>
      
      {currentData.year > 0 && (
        <div>
          <div className="font-semibold mb-1">💰 Jährliche Kosten (Jahr {currentData.year})</div>
          <div className="space-y-2 ml-2">
            <div>
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Miete gesamt:</span>
                <span className="font-mono">{formatCurrency(currentData.rentTotalAnnual)}</span>
              </div>
              <div className="ml-3 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">└ Kaltmiete:</span>
                  <span className="font-mono">{formatCurrency(currentData.rentCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">└ Nebenkosten:</span>
                  <span className="font-mono">{formatCurrency(currentData.rentUtilities + currentData.rentInsurance)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Eigentum gesamt:</span>
                <span className="font-mono">{formatCurrency(currentData.ownershipTotalAnnual)}</span>
              </div>
              <div className="ml-3 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">└ Hypothek:</span>
                  <span className="font-mono">{formatCurrency(currentData.ownershipMortgageInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">└ Amortisation:</span>
                  <span className="font-mono">{formatCurrency(currentData.ownershipAmortization)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">└ Nebenkosten:</span>
                  <span className="font-mono">{formatCurrency(currentData.ownershipUtilities + currentData.ownershipInsurance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">└ Unterhalt:</span>
                  <span className="font-mono">{formatCurrency(currentData.ownershipMaintenance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TotalAssetsTooltipContent({ currentData, previousData }: { currentData: YearlyCalculation; previousData: YearlyCalculation | null }) {
  const rentDelta = previousData ? currentData.netWealthRent - previousData.netWealthRent : 0
  const ownershipDelta = previousData ? currentData.netWealthOwnership - previousData.netWealthOwnership : 0
  const wealthDiff = currentData.netWealthOwnership - currentData.netWealthRent
  
  return (
    <div className="space-y-3 text-xs">
      <div>
        <div className="font-semibold mb-1">💎 Gesamtvermögen</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Miete:</span>
            <span className="font-mono">
              {formatCurrency(currentData.netWealthRent)}
              {previousData && <span className="text-green-600 text-[10px] ml-1">(+{formatCurrency(rentDelta)})</span>}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eigentum:</span>
            <span className="font-mono">
              {formatCurrency(currentData.netWealthOwnership)}
              {previousData && <span className="text-green-600 text-[10px] ml-1">(+{formatCurrency(ownershipDelta)})</span>}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border">
            <span className="text-muted-foreground">Differenz:</span>
            <span className="font-mono font-semibold">{formatCurrency(Math.abs(wealthDiff))}</span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="font-semibold mb-1">🏠 Eigentum Aufschlüsselung</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Immobilienwert:</span>
            <span className="font-mono">{formatCurrency(currentData.propertyValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">- Hypothek:</span>
            <span className="font-mono">{formatCurrency(currentData.mortgageBalance)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-1 border-t border-border">
            <span className="text-muted-foreground">= Eigenkapital:</span>
            <span className="font-mono">{formatCurrency(currentData.netEquity)}</span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="font-semibold mb-1">📊 Miete Aufschlüsselung</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Investiert (ETF):</span>
            <span className="font-mono">{formatCurrency(currentData.netWealthRent)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function OpportunityTooltipContent({ currentData, params }: { currentData: YearlyCalculation; params?: CalculationParams }) {
  const opportunityCost = currentData.opportunityCostETF - currentData.netEquity
  const propertyAppreciationRate = params?.additional?.propertyAppreciationRate || 2.0
  const etfReturnRate = params?.additional?.etfReturnRate || 6.0
  
  return (
    <div className="space-y-3 text-xs">
      <div>
        <div className="font-semibold mb-1">📊 Vermögensvergleich</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eigenkapital (Immobilie):</span>
            <span className="font-mono">{formatCurrency(currentData.netEquity)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ETF-Alternative:</span>
            <span className="font-mono">{formatCurrency(currentData.opportunityCostETF)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border">
            <span className="text-muted-foreground">Opportunitätskosten:</span>
            <span className={`font-mono font-semibold ${opportunityCost > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {opportunityCost > 0 ? '+' : ''}{formatCurrency(opportunityCost)}
            </span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="font-semibold mb-1">📈 Entwicklung</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Immobilie:</span>
            <span className="font-mono">+{formatPercent(propertyAppreciationRate, 1)} p.a. (Wertsteigerung)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ETF:</span>
            <span className="font-mono">+{formatPercent(etfReturnRate, 1)} p.a. (Rendite)</span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="font-semibold mb-1">💰 Details Immobilie</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wert heute:</span>
            <span className="font-mono">{formatCurrency(currentData.propertyValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hypothek:</span>
            <span className="font-mono">{formatCurrency(currentData.mortgageBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eigenkapital:</span>
            <span className="font-mono">{formatCurrency(currentData.netEquity)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AffordabilityTooltipContent({ currentData, params }: { currentData: YearlyCalculation; params?: CalculationParams }) {
  if (!params) return null
  
  const monthlyIncome = params.quickStart.householdIncome / 12
  const totalMortgage = params.mortgage.firstMortgage + params.mortgage.secondMortgage
  
  // Calculate mortgage balance for this year
  const yearsAmortized = Math.min(currentData.year, params.mortgage.amortizationYears)
  const amortizedAmount = params.mortgage.secondMortgage * (yearsAmortized / params.mortgage.amortizationYears)
  const remainingMortgage = totalMortgage - amortizedAmount
  
  // Calculate with 5% calculation rate
  const AFFORDABILITY_CALC_RATE = 5.0
  const calculatedInterest = remainingMortgage * AFFORDABILITY_CALC_RATE / 100
  const annualAmortization = currentData.year <= params.mortgage.amortizationYears 
    ? params.mortgage.secondMortgage / params.mortgage.amortizationYears
    : 0
  
  // Apply inflation to running costs
  const inflationFactor = Math.pow(1 + params.additional.inflationRate / 100, currentData.year - 1)
  const annualCosts = calculatedInterest + annualAmortization + 
                      (params.runningCosts.utilities + 
                       (params.runningCosts.parkingCost || 0) +
                       (params.runningCosts.condominiumFees || 0)) * 12 * inflationFactor +
                      (params.runningCosts.insurance + 
                       (params.runningCosts.renovationReserve || 0)) * inflationFactor +
                      (params.purchase.purchasePrice * params.runningCosts.maintenanceSimple / 100) * inflationFactor
  
  const monthlyCosts = annualCosts / 12
  const utilizationPercent = (monthlyCosts / monthlyIncome) * 100
  const isAffordable = utilizationPercent <= 33.33
  
  return (
    <div className="space-y-3 text-xs">
      <div>
        <div className="font-semibold mb-1">📊 Tragbarkeit</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Auslastung:</span>
            <span className={`font-mono font-semibold ${isAffordable ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(utilizationPercent, 1)} (33% Grenze)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-semibold ${isAffordable ? 'text-green-600' : 'text-red-600'}`}>
              {isAffordable ? '✓ Tragbar' : '✗ Zu hoch'}
            </span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="font-semibold mb-1">💰 Monatliche Belastung</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kosten:</span>
            <span className="font-mono">{formatCurrency(monthlyCosts)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Einkommen:</span>
            <span className="font-mono">{formatCurrency(monthlyIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Verfügbar:</span>
            <span className="font-mono">{formatCurrency(monthlyIncome - monthlyCosts)}</span>
          </div>
        </div>
      </div>
      
      <div>
        <div className="font-semibold mb-1">🏠 Kostenberechnung (5% kalk. Zins)</div>
        <div className="space-y-1 ml-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Zins (5%):</span>
            <span className="font-mono">{formatCurrency(calculatedInterest / 12)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amortisation:</span>
            <span className="font-mono">{formatCurrency(annualAmortization / 12)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nebenkosten:</span>
            <span className="font-mono">{formatCurrency((annualCosts - calculatedInterest - annualAmortization) / 12)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
