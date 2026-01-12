import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'
import { useScenarioStore } from '../../stores/scenarioStore'
import { formatCurrency } from '../../lib/utils'
import type { CalculationParams } from '../../types'

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
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="rent" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rent">Miete</TabsTrigger>
          <TabsTrigger value="purchase">Kauf</TabsTrigger>
          <TabsTrigger value="mortgage">Hypothek</TabsTrigger>
          <TabsTrigger value="costs">Kosten</TabsTrigger>
          <TabsTrigger value="taxes">Steuern</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mietparameter</CardTitle>
              <CardDescription>Kosten und Nebenkosten für das Mietszenario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="netRent">Netto-Miete (monatlich)</Label>
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
                  <Label htmlFor="rentUtilities">Nebenkosten (monatlich)</Label>
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
                  <Label htmlFor="rentInsurance">Hausratversicherung (monatlich)</Label>
                  <Input
                    id="rentInsurance"
                    type="number"
                    value={params.rent.insurance}
                    onChange={(e) => handleUpdate({
                      rent: { ...params.rent, insurance: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.rent.insurance)}/Monat</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rentIncrease">Jährliche Mietsteigerung (%)</Label>
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
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Gesamtkosten Miete</h4>
                <p className="text-2xl font-mono">
                  {formatCurrency((params.rent.netRent + params.rent.utilities + params.rent.insurance) * 12)}/Jahr
                </p>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Kaufpreis</Label>
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
                  <Label htmlFor="equity">Eigenkapital</Label>
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
                  <Label htmlFor="notaryFees">Notargebühren (%)</Label>
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
                  <Label htmlFor="landRegistry">Grundbuchgebühren (%)</Label>
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
                  <Label htmlFor="brokerFees">Maklergebühren (%)</Label>
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
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Nebenkosten beim Kauf</h4>
                <p className="text-2xl font-mono">
                  {formatCurrency(
                    params.purchase.purchasePrice * 
                    (params.purchase.notaryFees + params.purchase.landRegistryFees + params.purchase.brokerFees) / 100
                  )}
                </p>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstMortgage">Betrag</Label>
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
                    <Label htmlFor="firstMortgageRate">Zinssatz (%)</Label>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="firstMortgageTerm">Zinsfestschreibung (Jahre)</Label>
                    <Input
                      id="firstMortgageTerm"
                      type="number"
                      value={params.mortgage.firstMortgageTerm}
                      onChange={(e) => handleUpdate({
                        mortgage: { ...params.mortgage, firstMortgageTerm: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">2. Hypothek</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondMortgage">Betrag</Label>
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
                    <Label htmlFor="secondMortgageRate">Zinssatz (%)</Label>
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
                    <Label htmlFor="secondMortgageTerm">Zinsfestschreibung (Jahre)</Label>
                    <Input
                      id="secondMortgageTerm"
                      type="number"
                      value={params.mortgage.secondMortgageTerm}
                      onChange={(e) => handleUpdate({
                        mortgage: { ...params.mortgage, secondMortgageTerm: Number(e.target.value) }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amortizationYears">Amortisation (Jahre)</Label>
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
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Gesamthypothek</h4>
                <p className="text-2xl font-mono">
                  {formatCurrency(params.mortgage.firstMortgage + params.mortgage.secondMortgage)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Belehnung: {((params.mortgage.firstMortgage + params.mortgage.secondMortgage) / params.purchase.purchasePrice * 100).toFixed(1)}%
                </p>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownershipUtilities">Nebenkosten (monatlich)</Label>
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
                  <Label htmlFor="ownershipInsurance">Gebäudeversicherung (monatlich)</Label>
                  <Input
                    id="ownershipInsurance"
                    type="number"
                    value={params.runningCosts.insurance}
                    onChange={(e) => handleUpdate({
                      runningCosts: { ...params.runningCosts, insurance: Number(e.target.value) }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.runningCosts.insurance)}/Monat</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maintenanceSimple">Unterhalt (% vom Kaufpreis p.a.)</Label>
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
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Geschätzte jährliche Kosten</h4>
                <p className="text-2xl font-mono">
                  {formatCurrency(
                    (params.runningCosts.utilities + params.runningCosts.insurance) * 12 +
                    params.purchase.purchasePrice * params.runningCosts.maintenanceSimple / 100
                  )}/Jahr
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Steuerparameter</CardTitle>
              <CardDescription>Grenzsteuersatz und steuerliche Effekte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marginalTaxRate">Grenzsteuersatz (%)</Label>
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
                  <Label htmlFor="rentalValueRate">Eigenmietwert (% vom Immobilienwert)</Label>
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
                </div>
                
                <div className="space-y-2">
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
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyAppreciation">Wertsteigerung Immobilie (% p.a.)</Label>
                  <Input
                    id="propertyAppreciation"
                    type="number"
                    step="0.1"
                    value={params.propertyAppreciationRate}
                    onChange={(e) => handleUpdate({
                      propertyAppreciationRate: Number(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{params.propertyAppreciationRate}% pro Jahr</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="etfReturn">ETF-Rendite (% p.a.)</Label>
                  <Input
                    id="etfReturn"
                    type="number"
                    step="0.1"
                    value={params.etfReturnRate}
                    onChange={(e) => handleUpdate({
                      etfReturnRate: Number(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{params.etfReturnRate}% pro Jahr</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inflation">Inflation (% p.a.)</Label>
                  <Input
                    id="inflation"
                    type="number"
                    step="0.1"
                    value={params.inflationRate}
                    onChange={(e) => handleUpdate({
                      inflationRate: Number(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{params.inflationRate}% pro Jahr</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
