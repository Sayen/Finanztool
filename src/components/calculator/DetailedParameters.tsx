import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip'
import { useScenarioStore } from '../../stores/scenarioStore'
import { formatCurrency } from '../../lib/utils'
import { Info } from 'lucide-react'
import type { CalculationParams, AdditionalParams } from '../../types'

// Helper to safely access additional params with defaults
const getAdditionalParam = <K extends keyof AdditionalParams>(
  params: CalculationParams,
  key: K,
  defaultValue: AdditionalParams[K]
): AdditionalParams[K] => {
  if (params.additional) {
    return params.additional[key] ?? defaultValue
  }
  // Backward compatibility: check old location
  if (key in params) {
    return (params as any)[key] ?? defaultValue
  }
  return defaultValue
}

export function DetailedParameters() {
  const currentScenario = useScenarioStore((state) => state.getCurrentScenario())
  const updateScenario = useScenarioStore((state) => state.updateScenario)
  
  if (!currentScenario) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Bitte erstellen Sie zuerst ein Szenario im Schnellstart-Modul
          </p>
        </CardContent>
      </Card>
    )
  }
  
  const params = currentScenario.params
  
  const handleUpdate = (updates: Partial<CalculationParams>) => {
    updateScenario(currentScenario.id, updates)
  }
  
  // Validation checks
  const equityRatio = (params.purchase.equity / params.purchase.purchasePrice) * 100
  const isEquityTooLow = equityRatio < 20
  const totalMortgage = params.mortgage.firstMortgage + params.mortgage.secondMortgage
  const loanToValue = (totalMortgage / params.purchase.purchasePrice) * 100
  const isLTVTooHigh = loanToValue > 80
  const isFirstMortgageTooHigh = (params.mortgage.firstMortgage / params.purchase.purchasePrice) > 0.65
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Validation Warnings */}
        {(isEquityTooLow || isLTVTooHigh || isFirstMortgageTooHigh) && (
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <CardContent className="py-4">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">⚠️ Validierungshinweise</h4>
              <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
                {isEquityTooLow && (
                  <li>• Eigenkapital unter 20% ({equityRatio.toFixed(1)}%) - Mindestens 20% erforderlich für Schweizer Hypotheken</li>
                )}
                {isLTVTooHigh && (
                  <li>• Gesamtbelehnung über 80% ({loanToValue.toFixed(1)}%) - Maximal 80% LTV in der Schweiz erlaubt</li>
                )}
                {isFirstMortgageTooHigh && (
                  <li>• 1. Hypothek über 65% - Standard ist max. 65% für die 1. Hypothek, Rest als 2. Hypothek</li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* Live Preview */}
        {currentScenario?.results && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <h4 className="font-semibold mb-3">📊 Live Berechnungsvorschau</h4>
              
              {/* Core Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground text-xs">Monatl. Miete</p>
                  <p className="font-mono font-semibold text-lg text-green-600 dark:text-green-500">
                    {formatCurrency(currentScenario.results.kpis.monthlyRent)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Monatl. Eigentum (Jahr 1)</p>
                  <p className="font-mono font-semibold text-lg text-orange-600 dark:text-orange-500">
                    {formatCurrency(currentScenario.results.kpis.monthlyOwnership)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Tragbarkeit</p>
                  <p className={`font-mono font-semibold text-lg ${currentScenario.results.affordabilityCheck.isAffordable ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {currentScenario.results.affordabilityCheck.utilizationPercent.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Anfangsinvestition</p>
                  <p className="font-mono font-semibold text-lg">
                    {formatCurrency(currentScenario.results.kpis.initialInvestment)}
                  </p>
                </div>
              </div>
              
              {/* Expandable Sections */}
              <details className="border-t pt-3">
                <summary className="cursor-pointer font-medium text-sm mb-3 hover:text-primary">
                  ▸ Break-Even Details
                </summary>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pl-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Break-Even Jahr</p>
                    <p className="font-mono font-semibold">
                      {currentScenario.results.breakEvenYear ? `Jahr ${currentScenario.results.breakEvenYear}` : 'Nicht erreicht'}
                    </p>
                  </div>
                  {currentScenario.results.breakEvenYear && (
                    <>
                      <div>
                        <p className="text-muted-foreground text-xs">Kum. Kosten Miete (BE)</p>
                        <p className="font-mono font-semibold text-green-600 dark:text-green-500">
                          {formatCurrency(currentScenario.results.yearlyData[currentScenario.results.breakEvenYear - 1]?.rentCumulativeCost || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Kum. Kosten Eigentum (BE)</p>
                        <p className="font-mono font-semibold text-orange-600 dark:text-orange-500">
                          {formatCurrency(currentScenario.results.yearlyData[currentScenario.results.breakEvenYear - 1]?.ownershipCumulativeCost || 0)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </details>
              
              <details className="border-t pt-3 mt-2">
                <summary className="cursor-pointer font-medium text-sm mb-3 hover:text-primary">
                  ▸ Investitions-Metriken
                </summary>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pl-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Eigenkapital nach 10 J.</p>
                    <p className="font-mono font-semibold">
                      {formatCurrency(currentScenario.results.kpis.equityAfter10Years)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Eigenkapital nach 20 J.</p>
                    <p className="font-mono font-semibold">
                      {formatCurrency(currentScenario.results.kpis.equityAfter20Years)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Immobilienwert nach 10 J.</p>
                    <p className="font-mono font-semibold">
                      {formatCurrency(currentScenario.results.yearlyData[9]?.propertyValue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Immobilienwert nach 20 J.</p>
                    <p className="font-mono font-semibold">
                      {formatCurrency(currentScenario.results.yearlyData[19]?.propertyValue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Hypothekensaldo nach 10 J.</p>
                    <p className="font-mono font-semibold">
                      {formatCurrency(currentScenario.results.yearlyData[9]?.mortgageBalance || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Hypothekensaldo nach 20 J.</p>
                    <p className="font-mono font-semibold">
                      {formatCurrency(currentScenario.results.yearlyData[19]?.mortgageBalance || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Gesamthypothek</p>
                    <p className="font-mono font-semibold">
                      {formatCurrency(currentScenario.results.kpis.totalMortgage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Netto-Steuereffekt (J1)</p>
                    <p className={`font-mono font-semibold ${currentScenario.results.yearlyData[0].netTaxEffect > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                      {formatCurrency(currentScenario.results.yearlyData[0].netTaxEffect)}
                    </p>
                  </div>
                </div>
              </details>
              
              <details className="border-t pt-3 mt-2">
                <summary className="cursor-pointer font-medium text-sm mb-3 hover:text-primary">
                  ▸ ROI-Analyse
                </summary>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pl-4">
                  {[10, 20, 30].map(years => {
                    const results = currentScenario.results
                    if (!results) return null
                    const yearData = results.yearlyData[years - 1]
                    if (!yearData) return null
                    const roi = ((yearData.netEquity - results.kpis.initialInvestment) / results.kpis.initialInvestment) * 100
                    return (
                      <div key={years}>
                        <p className="text-muted-foreground text-xs">ROI nach {years} Jahren</p>
                        <p className={`font-mono font-semibold ${roi > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                          {roi.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(yearData.netEquity - results.kpis.initialInvestment)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </details>
            </CardContent>
          </Card>
        )}
      <Tabs defaultValue="rent" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="rent">Miete</TabsTrigger>
          <TabsTrigger value="purchase">Kauf</TabsTrigger>
          <TabsTrigger value="mortgage">Hypothek</TabsTrigger>
          <TabsTrigger value="costs">Kosten</TabsTrigger>
          <TabsTrigger value="taxes">Steuern</TabsTrigger>
          <TabsTrigger value="additional">Weitere</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mietparameter</CardTitle>
              <CardDescription>Kosten und Nebenkosten für das Mietszenario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="netRent">Netto-Miete (monatlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Monatliche Kaltmiete ohne Nebenkosten</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="netRent"
                    type="number"
                    value={params.rent.netRent}
                    onChange={(e) => handleUpdate({
                      rent: { ...params.rent, netRent: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.rent.netRent)}/Monat</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rentUtilities">Nebenkosten (monatlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Nebenkosten bei Miete</p>
                        <p className="text-sm mb-2">Umfasst Heizkosten, Warmwasser, Hauswartung, Abfallentsorgung und Allgemeinstrom.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Direkte monatliche Zusatzkosten zur Kaltmiete, erhöhen die Gesamtmietkosten.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: CHF 150-300/Monat • 2 Zimmer: CHF 150-200 • 3-4 Zimmer: CHF 200-250 • 5+ Zimmer: CHF 250-300
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          Standard: Berechnet als ca. 15% der Nettomiete
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="rentUtilities"
                    type="number"
                    value={params.rent.utilities}
                    onChange={(e) => handleUpdate({
                      rent: { ...params.rent, utilities: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.rent.utilities)}/Monat</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rentInsurance">Hausratversicherung (jährlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Hausratversicherung</p>
                        <p className="text-sm mb-2">Versichert Ihren persönlichen Besitz (Möbel, Elektronik, Kleider) gegen Schäden durch Feuer, Wasser, Einbruch, etc.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Kleine jährliche Fixkosten, unabhängig von Miete oder Eigentum notwendig.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: CHF 300-600/Jahr für durchschnittlichen Haushalt
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="rentInsurance"
                    type="number"
                    value={params.rent.insurance}
                    onChange={(e) => handleUpdate({
                      rent: { ...params.rent, insurance: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.rent.insurance)}/Jahr</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rentIncrease">Jährliche Mietsteigerung (%)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Jährliche Mietsteigerung</p>
                        <p className="text-sm mb-2">Erwartete jährliche Erhöhung der Miete über die Zeit.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht die kumulierten Mietkosten über die Jahre. In der Schweiz an Referenzzinssatz gekoppelt.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 1.0-2.0% p.a. (historisch CH ~1-1.5%, bei Wohnungswechsel oft höher ~2%)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="rentIncrease"
                    type="number"
                    step="0.1"
                    value={params.rent.annualIncrease}
                    onChange={(e) => handleUpdate({
                      rent: { ...params.rent, annualIncrease: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{params.rent.annualIncrease}% pro Jahr</p>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kaufparameter</CardTitle>
              <CardDescription>Details zum Immobilienkauf</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="purchasePrice">Kaufpreis</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Kaufpreis</p>
                        <p className="text-sm mb-2">Der reine Preis der Immobilie ohne Nebenkosten. Wichtigster Faktor für die Berechnung der Hypothek und des Eigenkapitalbedarfs.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Bestimmt die Höhe der Hypothek, des benötigten Eigenkapitals und der Kaufnebenkosten.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={params.purchase.purchasePrice}
                    onChange={(e) => handleUpdate({
                      purchase: { ...params.purchase, purchasePrice: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.purchase.purchasePrice)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="equity">Eigenkapital</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Eigenkapital</p>
                        <p className="text-sm mb-2">Ihre eigenen finanziellen Mittel (Ersparnisse, 3a, Erbvorbezug). Mindestens 20% des Kaufpreises sind in der Schweiz erforderlich.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Reduziert die benötigte Hypothek und damit die Zinskosten. Mehr Eigenkapital verbessert die Tragbarkeit.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: Mindestens 20% des Kaufpreises. 10% müssen "hartes" Eigenkapital sein (nicht aus Pensionskasse).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="equity"
                    type="number"
                    value={params.purchase.equity}
                    onChange={(e) => handleUpdate({
                      purchase: { ...params.purchase, equity: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.purchase.equity)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="notaryFees">Notargebühren (%)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Notargebühren</p>
                        <p className="text-sm mb-2">Kosten für die notarielle Beurkundung des Kaufvertrags und die rechtliche Abwicklung.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht die Anfangsinvestition beim Kauf. Einmalige Kosten, die sofort beim Kauf anfallen.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 0.4-0.7% des Kaufpreises (Kanton Zürich)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="notaryFees"
                    type="number"
                    step="0.1"
                    value={params.purchase.notaryFees}
                    onChange={(e) => handleUpdate({
                      purchase: { ...params.purchase, notaryFees: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(params.purchase.purchasePrice * params.purchase.notaryFees / 100)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="landRegistry">Grundbuchgebühren (%)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Grundbuchgebühren</p>
                        <p className="text-sm mb-2">Gebühren für die Eintragung des Eigentümerwechsels und der Hypothek im Grundbuch.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht die Anfangsinvestition. Gesetzlich vorgeschrieben, Höhe variiert nach Kanton.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 0.2-0.4% des Kaufpreises (Kanton Zürich)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="landRegistry"
                    type="number"
                    step="0.1"
                    value={params.purchase.landRegistryFees}
                    onChange={(e) => handleUpdate({
                      purchase: { ...params.purchase, landRegistryFees: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(params.purchase.purchasePrice * params.purchase.landRegistryFees / 100)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="brokerFees">Maklergebühren (%)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Maklergebühren</p>
                        <p className="text-sm mb-2">Provision für den Immobilienmakler. In der Schweiz oft vom Verkäufer getragen, aber nicht immer.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Kann die Anfangsinvestition erheblich erhöhen. Optional - auf 0% setzen wenn nicht anwendbar.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 0-3% des Kaufpreises. ⚠️ In der Schweiz üblicherweise vom Verkäufer bezahlt, nicht vom Käufer.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="brokerFees"
                    type="number"
                    step="0.1"
                    value={params.purchase.brokerFees}
                    onChange={(e) => handleUpdate({
                      purchase: { ...params.purchase, brokerFees: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(params.purchase.purchasePrice * params.purchase.brokerFees / 100)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="mortgageProcessingFee">Hypothekar-Bearbeitungsgebühr (%)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Hypothekar-Bearbeitungsgebühr</p>
                        <p className="text-sm mb-2">Einmalige Gebühr der Bank für die Prüfung und Abwicklung des Hypothekarantrags.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht die Anfangsinvestition. Wird auf Basis der Hypothekarsumme berechnet.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 0.5-1.0% der Hypothekarsumme (einmalig, bei kleineren Banken oft verhandelbar)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="mortgageProcessingFee"
                    type="number"
                    step="0.1"
                    value={params.purchase.mortgageProcessingFee || 0}
                    onChange={(e) => handleUpdate({
                      purchase: { ...params.purchase, mortgageProcessingFee: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency((params.mortgage.firstMortgage + params.mortgage.secondMortgage) * (params.purchase.mortgageProcessingFee || 0) / 100)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="propertyValuationFee">Schätzungsgebühr (CHF)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Schätzungsgebühr</p>
                        <p className="text-sm mb-2">Kosten für die professionelle Bewertung der Immobilie durch einen Experten. Von der Bank vorgeschrieben.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht die Anfangsinvestition. Einmalige Fixkosten unabhängig vom Kaufpreis.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: CHF 500-2000 je nach Objektgrösse und Komplexität
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="propertyValuationFee"
                    type="number"
                    value={params.purchase.propertyValuationFee || 0}
                    onChange={(e) => handleUpdate({
                      purchase: { ...params.purchase, propertyValuationFee: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(params.purchase.propertyValuationFee || 0)}
                  </p>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mortgage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hypothekenstruktur</CardTitle>
              <CardDescription>1. und 2. Hypothek mit Zinsen und Amortisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">1. Hypothek</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="firstMortgage">Betrag</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold mb-1">1. Hypothek</p>
                          <p className="text-sm mb-2">Der erste Teil der Hypothek, bis maximal 65% des Kaufpreises. Normalerweise nicht amortisationspflichtig.</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Einfluss:</strong> Hauptteil der Finanzierung. Bestimmt zusammen mit dem Zinssatz die monatlichen Zinskosten.
                          </p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💡 Richtwert: Max. 65% des Kaufpreises
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="firstMortgage"
                      type="number"
                      value={params.mortgage.firstMortgage}
                      onChange={(e) => handleUpdate({
                        mortgage: { ...params.mortgage, firstMortgage: Number(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">{formatCurrency(params.mortgage.firstMortgage)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="firstMortgageRate">Zinssatz (%)</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Aktueller Zinssatz für die Hypothek (Stand 2026: ca. 2.0-3.0%)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="firstMortgageRate"
                      type="number"
                      step="0.1"
                      value={params.mortgage.firstMortgageRate}
                      onChange={(e) => handleUpdate({
                        mortgage: { ...params.mortgage, firstMortgageRate: Number(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">{params.mortgage.firstMortgageRate}% p.a.</p>
                  </div>
                  
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">2. Hypothek</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="secondMortgage">Betrag</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold mb-1">2. Hypothek</p>
                          <p className="text-sm mb-2">Der zweite Teil der Hypothek, von 65% bis max. 80% des Kaufpreises. Muss innerhalb von 15 Jahren amortisiert werden.</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Einfluss:</strong> Erhöht die monatlichen Kosten durch Zins und obligatorische Amortisation.
                          </p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💡 Richtwert: Max. 15% des Kaufpreises (Differenz zwischen Eigenkapital und 65% LTV)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="secondMortgage"
                      type="number"
                      value={params.mortgage.secondMortgage}
                      onChange={(e) => handleUpdate({
                        mortgage: { ...params.mortgage, secondMortgage: Number(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">{formatCurrency(params.mortgage.secondMortgage)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="secondMortgageRate">Zinssatz (%)</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold mb-1">Zinssatz 2. Hypothek</p>
                          <p className="text-sm mb-2">Zinssatz für die 2. Hypothek. Oft gleich wie die 1. Hypothek, kann aber bei einigen Anbietern leicht höher sein.</p>
                           <p className="text-sm text-muted-foreground">
                            <strong>Einfluss:</strong> Direkte Auswirkung auf monatliche Zinskosten.
                          </p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💡 Richtwert: 2.0-3.0% p.a. (10-jährige Festhypothek, Stand 2026)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="secondMortgageRate"
                      type="number"
                      step="0.1"
                      value={params.mortgage.secondMortgageRate}
                      onChange={(e) => handleUpdate({
                        mortgage: { ...params.mortgage, secondMortgageRate: Number(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">{params.mortgage.secondMortgageRate}% p.a.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="amortizationYears">Amortisation (Jahre)</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold mb-1">Amortisationszeitraum</p>
                          <p className="text-sm mb-2">Zeitraum zur Rückzahlung der 2. Hypothek auf 65% Belehnung (gesetzlich innerhalb 15 Jahren oder bis Pensionierung)</p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💡 Richtwert: Max. 15 Jahre (gesetzlich vorgeschrieben), empfohlen ~6.7% p.a. Amortisation
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="amortizationYears"
                      type="number"
                      value={params.mortgage.amortizationYears}
                      onChange={(e) => handleUpdate({
                        mortgage: { ...params.mortgage, amortizationYears: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laufende Kosten Eigentum</CardTitle>
              <CardDescription>Nebenkosten, Versicherungen und Unterhalt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Maintenance Mode Toggle */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Label>Unterhaltsmodell</Label>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-1">⚠️ Wichtig: Entweder/Oder</p>
                      <p className="text-sm mb-2">Wählen Sie ENTWEDER das einfache Modell ODER das detaillierte zyklische Modell.</p>
                      <p className="text-sm mb-2">
                        <strong>Einfach:</strong> Pauschaler Prozentsatz vom Kaufpreis pro Jahr (z.B. 1%).
                      </p>
                      <p className="text-sm">
                        <strong>Detailliert:</strong> Spezifische Renovationen zu definierten Zeitpunkten (Dach, Fassade, etc.).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate({
                      runningCosts: { ...params.runningCosts, maintenanceMode: 'simple' }
                    })}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                      (params.runningCosts.maintenanceMode || 'simple') === 'simple'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Einfaches Modell
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate({
                      runningCosts: { ...params.runningCosts, maintenanceMode: 'detailed' }
                    })}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                      params.runningCosts.maintenanceMode === 'detailed'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Detailliertes Modell
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(params.runningCosts.maintenanceMode || 'simple') === 'simple' 
                    ? '✓ Nutzt pauschalen Prozentsatz für jährlichen Unterhalt'
                    : '✓ Nutzt spezifische Renovationskosten nach Intervallen'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ownershipUtilities">Nebenkosten (monatlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Nebenkosten bei Eigentum</p>
                        <p className="text-sm mb-2">Umfasst Heizkosten, Warmwasser, Strom, Wasser, Abwasser und ggf. Hauswartung (bei Stockwerkeigentum).</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Laufende monatliche Kosten. Bei Eigentum oft leicht höher als bei Miete durch direkten Verbrauch.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: CHF 200-400/Monat • Wohnung: CHF 150-250 • Stockwerkeigentum: CHF 200-300 • Einfamilienhaus: CHF 250-400
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          Standard: Berechnet als ca. 15% der Vergleichsmiete
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="ownershipUtilities"
                    type="number"
                    value={params.runningCosts.utilities}
                    onChange={(e) => handleUpdate({
                      runningCosts: { ...params.runningCosts, utilities: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.runningCosts.utilities)}/Monat</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ownershipInsurance">Gebäudeversicherung (jährlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Gebäudeversicherung</p>
                        <p className="text-sm mb-2">Versichert das Gebäude selbst (nicht den Hausrat) gegen Feuer, Elementarschäden, etc. In Zürich obligatorisch über kantonale Gebäudeversicherung.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Pflichtversicherung für Eigentümer, höhere Kosten als Hausratversicherung bei Miete.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: CHF 800-1500/Jahr, abhängig von Gebäudewert und -alter
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="ownershipInsurance"
                    type="number"
                    value={params.runningCosts.insurance}
                    onChange={(e) => handleUpdate({
                      runningCosts: { ...params.runningCosts, insurance: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.runningCosts.insurance)}/Jahr</p>
                </div>
                
                {/* Only show simple maintenance when in simple mode */}
                {(params.runningCosts.maintenanceMode || 'simple') === 'simple' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="maintenanceSimple">Unterhalt (% vom Kaufpreis p.a.)</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold mb-1">Unterhaltskosten (Einfaches Modell)</p>
                          <p className="text-sm mb-2">Jährliche Kosten für Reparaturen, Renovationen und Werterhaltung als pauschaler Prozentsatz.</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Einfluss:</strong> Wesentlicher laufender Kostenfaktor bei Eigentum. 1% des Kaufpreises ist Faustregel, ältere Objekte mehr.
                          </p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💡 Richtwert: 1.0-1.5% p.a. • Neubau (0-10 Jahre): 0.5-0.8% • Standard (10-30 Jahre): 1.0-1.5% • Altbau (30+ Jahre): 1.5-2.5%
                          </p>
                          <p className="text-xs mt-1 font-semibold text-muted-foreground">
                            Standard: 1.0% p.a.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="maintenanceSimple"
                      type="number"
                      step="0.1"
                      value={params.runningCosts.maintenanceSimple}
                      onChange={(e) => handleUpdate({
                        runningCosts: { ...params.runningCosts, maintenanceSimple: Number(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(params.purchase.purchasePrice * params.runningCosts.maintenanceSimple / 100)}/Jahr
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="parkingCost">Parkplatzkosten (monatlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Parkplatzkosten</p>
                        <p className="text-sm mb-2">Monatliche Kosten für Garage oder Aussenparkplatz, falls nicht im Kaufpreis enthalten.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Zusätzliche laufende Kosten bei Eigentum, falls Parkplatz separat gemietet.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: CHF 0-200/Monat • Zürich Innenstadt: CHF 150-300 • Agglomeration: CHF 80-150 • Ländlich: CHF 50-100
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="parkingCost"
                    type="number"
                    value={params.runningCosts.parkingCost || 0}
                    onChange={(e) => handleUpdate({
                      runningCosts: { ...params.runningCosts, parkingCost: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.runningCosts.parkingCost || 0)}/Monat</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="condominiumFees">Verwaltungskosten Stockwerkeigentum (monatlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Verwaltungskosten (Stockwerkeigentum)</p>
                        <p className="text-sm mb-2">Bei Eigentumswohnungen: Kosten für Hausverwaltung, Gemeinschaftsflächen, Liftunterhalt, Rückstellungen der Eigentümergemeinschaft.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Nur bei Stockwerkeigentum relevant. Wird von der Eigentümergemeinschaft festgelegt.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: CHF 0-400/Monat (0 bei Einfamilienhaus, CHF 200-400 bei Stockwerkeigentum)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="condominiumFees"
                    type="number"
                    value={params.runningCosts.condominiumFees || 0}
                    onChange={(e) => handleUpdate({
                      runningCosts: { ...params.runningCosts, condominiumFees: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.runningCosts.condominiumFees || 0)}/Monat</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="renovationReserve">Renovationsrücklagen (jährlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Renovationsrücklagen</p>
                        <p className="text-sm mb-2">Zusätzliche jährliche Rückstellungen für grössere Renovationen (zusätzlich zum normalen Unterhalt).</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht laufende Kosten, baut aber Reserven für grosse Sanierungen auf. Optional - kann auf 0 gesetzt werden wenn im Unterhalt enthalten.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: CHF 0-5000/Jahr • Neubau: CHF 0-1000 • 10-30 Jahre: CHF 2000-4000 • Altbau: CHF 4000-8000
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="renovationReserve"
                    type="number"
                    value={params.runningCosts.renovationReserve || 0}
                    onChange={(e) => handleUpdate({
                      runningCosts: { ...params.runningCosts, renovationReserve: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.runningCosts.renovationReserve || 0)}/Jahr</p>
                </div>
              </div>
              
            </CardContent>
          </Card>
          {/* Only show detailed cyclical maintenance when in detailed mode */}
          {params.runningCosts.maintenanceMode === 'detailed' && (
            <Card>
              <CardHeader>
                <CardTitle>Zyklischer Unterhalt (Detailliertes Modell)</CardTitle>
                <CardDescription>
                  Geplante, grössere Renovationen basierend auf dem Kaufpreis. Kosten fallen erstmalig nach "Initialintervall" an, danach wiederholend gemäss "Folgeintervall".
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              {['Dach', 'Fassade', 'Heizung', 'Küche/Bad'].map((item) => {
                const key = item === 'Küche/Bad' ? 'kitchenBath' : item.toLowerCase();
                const renovation = `${key}Renovation` as keyof typeof params.runningCosts;
                const initialInterval = `${key}InitialInterval` as keyof typeof params.runningCosts;
                const interval = `${key}Interval` as keyof typeof params.runningCosts;

                // Calculate standard values based on purchase price
                const purchasePrice = params.purchase.purchasePrice;
                let standardCost = 0;
                let standardInitial = 0;
                let standardInterval = 0;
                let tooltipText = '';
                
                switch(key) {
                  case 'dach':
                    standardCost = Math.round(purchasePrice * 0.05);
                    standardInitial = 25;
                    standardInterval = 25;
                    tooltipText = `Typisch ~5% des Kaufpreises (${formatCurrency(standardCost)}). Intervall: 25 Jahre.`;
                    break;
                  case 'fassade':
                    standardCost = Math.round(purchasePrice * 0.04);
                    standardInitial = 20;
                    standardInterval = 20;
                    tooltipText = `Typisch ~4% des Kaufpreises (${formatCurrency(standardCost)}). Intervall: 20 Jahre.`;
                    break;
                  case 'heizung':
                    standardCost = Math.round(purchasePrice * 0.02);
                    standardInitial = 18;
                    standardInterval = 18;
                    tooltipText = `Typisch ~2% des Kaufpreises (${formatCurrency(standardCost)}). Intervall: 18 Jahre.`;
                    break;
                  case 'kitchenBath':
                    standardCost = Math.round(purchasePrice * 0.08);
                    standardInitial = 15;
                    standardInterval = 15;
                    tooltipText = `Typisch ~8% des Kaufpreises (${formatCurrency(standardCost)}). Intervall: 15 Jahre.`;
                    break;
                }

                return (
                  <div key={key} className="space-y-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold">{item}</h5>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold mb-1">{item} Renovation</p>
                          <p className="text-sm mb-2">{tooltipText}</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Einfluss:</strong> Grosse einmalige Kosten, die zyklisch auftreten und das Nettovermögen beeinflussen.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${key}Cost`}>Kosten (CHF)</Label>
                        <Input
                          id={`${key}Cost`}
                          type="number"
                          value={params.runningCosts[renovation] as number || 0}
                          onChange={(e) => handleUpdate({
                            runningCosts: { ...params.runningCosts, [renovation]: Number(e.target.value) }
                          })}
                          placeholder={standardCost.toString()}
                        />
                        <p className="text-xs text-muted-foreground">Standard: {formatCurrency(standardCost)}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${key}InitialInterval`}>Initialintervall (Jahre)</Label>
                        <Input
                          id={`${key}InitialInterval`}
                          type="number"
                          value={params.runningCosts[initialInterval] as number || 0}
                          onChange={(e) => handleUpdate({
                            runningCosts: { ...params.runningCosts, [initialInterval]: Number(e.target.value) }
                          })}
                          placeholder={standardInitial.toString()}
                        />
                        <p className="text-xs text-muted-foreground">Standard: {standardInitial} Jahre</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${key}Interval`}>Folgeintervall (Jahre)</Label>
                        <Input
                          id={`${key}Interval`}
                          type="number"
                          value={params.runningCosts[interval] as number || 0}
                          onChange={(e) => handleUpdate({
                            runningCosts: { ...params.runningCosts, [interval]: Number(e.target.value) }
                          })}
                          placeholder={standardInterval.toString()}
                        />
                        <p className="text-xs text-muted-foreground">Standard: {standardInterval} Jahre</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
          )}
        </TabsContent>
        
        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Steuerparameter</CardTitle>
              <CardDescription>Grenzsteuersatz und steuerliche Effekte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="marginalTaxRate">Grenzsteuersatz (%)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Grenzsteuersatz</p>
                        <p className="text-sm mb-2">Der Steuersatz auf Ihr zusätzliches Einkommen (Bund + Kanton + Gemeinde). Bestimmt die Steuerersparnis durch Zinsabzug und die Steuerlast durch Eigenmietwert.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Je höher der Grenzsteuersatz, desto grösser die Steuerersparnis durch Hypothekarzinsen, aber auch höhere Eigenmietwert-Besteuerung.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 20-35% für mittlere Einkommen in Zürich (Stadt/Kanton)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="marginalTaxRate"
                    type="number"
                    step="0.1"
                    value={params.tax.marginalTaxRate}
                    onChange={(e) => handleUpdate({
                      tax: { ...params.tax, marginalTaxRate: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{params.tax.marginalTaxRate}%</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rentalValueRate">Eigenmietwert (% vom Immobilienwert)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Eigenmietwert (Schweizer Spezialität)</p>
                        <p className="text-sm mb-2">Fiktives Einkommen aus selbstgenutztem Wohneigentum, das als Einkommen versteuert werden muss. Schweizweite Besonderheit, die Wohneigentum steuerlich belastet.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht die Steuerlast bei Eigentum. Typischerweise ca. 60-70% der Marktmiete. Wird mit Grenzsteuersatz multipliziert.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 3.0-4.0% des Verkehrswerts (je nach Kanton)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="rentalValueRate"
                    type="number"
                    step="0.1"
                    value={params.tax.rentalValueRate}
                    onChange={(e) => handleUpdate({
                      tax: { ...params.tax, rentalValueRate: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{params.tax.rentalValueRate}%</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="interestDeduction" className="flex items-center gap-2">
                      <input
                        id="interestDeduction"
                        type="checkbox"
                        checked={params.tax.interestDeduction}
                        onChange={(e) => handleUpdate({
                          tax: { ...params.tax, interestDeduction: e.target.checked }
                        })}
                        className="h-4 w-4"
                      />
                      Zinsabzug berücksichtigen
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Zinsabzug (Schuldzinsabzug)</p>
                        <p className="text-sm mb-2">Hypothekarzinsen können vom steuerbaren Einkommen abgezogen werden - bedeutende Steuerersparnis für Eigentümer.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Reduziert die effektiven Kosten des Eigentums durch Steuerersparnis. Höhe = Hypothekarzinsen × Grenzsteuersatz.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 In der Schweiz bei Wohneigentum üblich und sollte berücksichtigt werden
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rentalValueTaxation" className="flex items-center gap-2">
                      <input
                        id="rentalValueTaxation"
                        type="checkbox"
                        checked={params.tax.rentalValueTaxation}
                        onChange={(e) => handleUpdate({
                          tax: { ...params.tax, rentalValueTaxation: e.target.checked }
                        })}
                        className="h-4 w-4"
                      />
                      Eigenmietwert besteuern
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Eigenmietwert-Besteuerung</p>
                        <p className="text-sm mb-2">Gesetzlich vorgeschrieben in der Schweiz: Der kalkulatorische Mietwert der selbst bewohnten Immobilie muss als Einkommen versteuert werden.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht die Steuerlast bei Eigentum. Wird teilweise durch Zinsabzug kompensiert.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Sollte aktiviert sein für realistische Schweizer Verhältnisse
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="additional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Haushaltseinkommen und Lebenshaltungskosten</CardTitle>
              <CardDescription>Für realistische Vermögensberechnung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="householdIncome">Haushaltseinkommen (jährlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Haushaltseinkommen</p>
                        <p className="text-sm mb-2">Jährliches Bruttoeinkommen aller im Haushalt lebenden Personen. Wichtig für realistische Vermögensberechnung.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Ermöglicht Vermögensaufbau auch im Mietszenario durch Sparen der Differenz zum Eigentum.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="householdIncome"
                    type="number"
                    value={params.quickStart.householdIncome}
                    onChange={(e) => handleUpdate({
                      quickStart: { ...params.quickStart, householdIncome: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.quickStart.householdIncome)}/Jahr</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="livingExpenses">Lebenshaltungskosten (jährlich)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Jährliche Lebenshaltungskosten</p>
                        <p className="text-sm mb-2">Ausgaben für Essen, Kleidung, Transport, Versicherungen, Freizeit etc. (ohne Wohnkosten).</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Reduziert das verfügbare Einkommen für Vermögensaufbau. Wichtig für realistische Nettovermögensberechnung.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: CHF 30'000-60'000/Jahr für durchschnittlichen Haushalt (ohne Wohnkosten)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="livingExpenses"
                    type="number"
                    value={params.quickStart.annualLivingExpenses || 0}
                    onChange={(e) => handleUpdate({
                      quickStart: { ...params.quickStart, annualLivingExpenses: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.quickStart.annualLivingExpenses || 0)}/Jahr</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="initialTotalWealth">Gesamtvermögen zu Beginn</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Gesamtvermögen zu Beginn</p>
                        <p className="text-sm mb-2">Ihr totales Vermögen vor Kaufentscheid oder Mietbeginn. Im Kaufszenario wird das Eigenkapital abgezogen, der Rest kann investiert werden.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Ermöglicht realistischere Vermögensvergleiche, da auch übriges Kapital verzinst wird.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Standardwert: Entspricht dem Eigenkapital. Erhöhen Sie den Wert, wenn Sie zusätzliches Vermögen haben.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="initialTotalWealth"
                    type="number"
                    value={params.quickStart.initialTotalWealth || params.purchase.equity}
                    onChange={(e) => handleUpdate({
                      quickStart: { ...params.quickStart, initialTotalWealth: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.quickStart.initialTotalWealth || params.purchase.equity)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Weitere Parameter</CardTitle>
              <CardDescription>Wertsteigerung, Rendite und Inflation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="propertyAppreciation">Wertsteigerung Immobilie (% p.a.)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Wertsteigerung der Immobilie</p>
                        <p className="text-sm mb-2">Erwartete jährliche Wertsteigerung der Immobilie über die Zeit. Beeinflusst den Vermögensaufbau und das Eigenkapital.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht das Nettovermögen bei Eigentum. Historisch zwischen Inflation und leicht darüber in der Schweiz.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 1.0-2.5% p.a. (historisch langfristig ~2%, konservativ 1-1.5%, Toplagen Zürich 2-2.5%)
                        </p>
                        <p className="text-xs mt-1 font-semibold text-muted-foreground">
                          Standard: 2.0% p.a.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="propertyAppreciation"
                    type="number"
                    step="0.1"
                    value={getAdditionalParam(params, 'propertyAppreciationRate', 2.0)}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (params.additional) {
                        handleUpdate({
                          additional: { ...params.additional, propertyAppreciationRate: value }
                        })
                      } else {
                        handleUpdate({ propertyAppreciationRate: value })
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">{getAdditionalParam(params, 'propertyAppreciationRate', 2.0)}% pro Jahr</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="etfReturn">ETF-Rendite (% p.a.)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">ETF-Rendite (Opportunitätskosten)</p>
                        <p className="text-sm mb-2">Erwartete Rendite bei Anlage des Eigenkapitals in ETFs statt in die Immobilie. Zeigt alternative Verwendung des Kapitals.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Berechnet das "entgangene" Vermögen, wenn Eigenkapital in Aktien-ETFs investiert würde. Wichtig für Vermögensvergleich.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 5-7% p.a. (MSCI World historisch ~7%, nach Steuern &amp; Gebühren ~5-6%. ⚠️ Mit Volatilität verbunden)
                        </p>
                        <p className="text-xs mt-1 font-semibold text-muted-foreground">
                          Standard: 6.0% p.a.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="etfReturn"
                    type="number"
                    step="0.1"
                    value={getAdditionalParam(params, 'etfReturnRate', 6.0)}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (params.additional) {
                        handleUpdate({
                          additional: { ...params.additional, etfReturnRate: value }
                        })
                      } else {
                        handleUpdate({ etfReturnRate: value })
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">{getAdditionalParam(params, 'etfReturnRate', 6.0)}% pro Jahr</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="inflation">Inflation (% p.a.)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Inflation</p>
                        <p className="text-sm mb-2">Allgemeine Teuerungsrate. Wird auf Nebenkosten, Unterhalt und Lebenshaltungskosten angewendet.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Erhöht alle laufenden Kosten über die Zeit und reduziert die Kaufkraft.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 1.0-1.5% p.a. (langfristiger CH-Durchschnitt, 2021-2023 temporär 2-3%, langfristig stabil ~1%)
                        </p>
                        <p className="text-xs mt-1 font-semibold text-muted-foreground">
                          Standard: 1.5% p.a.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="inflation"
                    type="number"
                    step="0.1"
                    value={getAdditionalParam(params, 'inflationRate', 1.5)}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (params.additional) {
                        handleUpdate({
                          additional: { ...params.additional, inflationRate: value }
                        })
                      } else {
                        handleUpdate({ inflationRate: value })
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">{getAdditionalParam(params, 'inflationRate', 1.5)}% pro Jahr</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Kapitalanlage-Optionen</CardTitle>
              <CardDescription>Konfiguration ob Barvermögen investiert wird</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="investCashInRent" className="flex items-center gap-2">
                      <input
                        id="investCashInRent"
                        type="checkbox"
                        checked={getAdditionalParam(params, 'investCashInRent', true)}
                        onChange={(e) => {
                          if (params.additional) {
                            handleUpdate({
                              additional: { ...params.additional, investCashInRent: e.target.checked }
                            })
                          } else {
                            handleUpdate({
                              additional: {
                                propertyAppreciationRate: params.propertyAppreciationRate || 2.0,
                                etfReturnRate: params.etfReturnRate || 6.0,
                                inflationRate: params.inflationRate || 1.5,
                                investCashInRent: e.target.checked,
                                investCashInOwnership: false,
                              }
                            })
                          }
                        }}
                        className="h-4 w-4"
                      />
                      Barvermögen in Mietszenario investieren
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Barvermögen investieren (Mietszenario)</p>
                        <p className="text-sm mb-2">Wenn aktiviert, wird übriges Kapital (Gesamtvermögen minus Eigenkapital) in ETFs investiert und verzinst.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Ermöglicht Vermögensaufbau auch beim Mieten durch Kapitalanlage.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Empfohlen: Aktiviert für realistischen Vergleich
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="investCashInOwnership" className="flex items-center gap-2">
                      <input
                        id="investCashInOwnership"
                        type="checkbox"
                        checked={getAdditionalParam(params, 'investCashInOwnership', false)}
                        onChange={(e) => {
                          if (params.additional) {
                            handleUpdate({
                              additional: { ...params.additional, investCashInOwnership: e.target.checked }
                            })
                          } else {
                            handleUpdate({
                              additional: {
                                propertyAppreciationRate: params.propertyAppreciationRate || 2.0,
                                etfReturnRate: params.etfReturnRate || 6.0,
                                inflationRate: params.inflationRate || 1.5,
                                investCashInRent: true,
                                investCashInOwnership: e.target.checked,
                              }
                            })
                          }
                        }}
                        className="h-4 w-4"
                      />
                      Barvermögen in Eigentumsszenario investieren
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Barvermögen investieren (Eigentumsszenario)</p>
                        <p className="text-sm mb-2">Wenn aktiviert, wird übriges Kapital nach Kauf (Gesamtvermögen minus Anfangsinvestition) in ETFs investiert.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Zusätzlicher Vermögensaufbau neben der Immobilie.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Standard: Deaktiviert (Kapital ist in Immobilie gebunden)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  )
}
