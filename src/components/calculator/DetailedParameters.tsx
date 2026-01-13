import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip'
import { useScenarioStore } from '../../stores/scenarioStore'
import { formatCurrency } from '../../lib/utils'
import { Info } from 'lucide-react'
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
    <TooltipProvider>
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
                          💡 Richtwert: CHF 150-300/Monat je nach Wohnungsgrösse und Energieeffizienz
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
                      <TooltipContent>
                        <p className="max-w-xs">Erwartete jährliche Erhöhung der Miete (Durchschnitt Schweiz ca. 1-2%)</p>
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
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Gesamtkosten Miete</h4>
                <p className="text-2xl font-mono">
                  {formatCurrency((params.rent.netRent + params.rent.utilities) * 12 + params.rent.insurance)}/Jahr
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          💡 Richtwert: 0-3% des Kaufpreises, je nach Vereinbarung
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
                          💡 Richtwert: 0.5-1.0% der Hypothekarsumme
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
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Gesamte Anfangsinvestition</h4>
                <p className="text-2xl font-mono">
                  {formatCurrency(
                    params.purchase.equity +
                    params.purchase.purchasePrice * 
                    (params.purchase.notaryFees + params.purchase.landRegistryFees + params.purchase.brokerFees) / 100 +
                    (params.mortgage.firstMortgage + params.mortgage.secondMortgage) * (params.purchase.mortgageProcessingFee || 0) / 100 +
                    (params.purchase.propertyValuationFee || 0)
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Eigenkapital + Kaufnebenkosten + Hypothekargebühren
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="firstMortgageRate">Zinssatz (%)</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Aktueller Zinssatz für die Hypothek (Stand 2024-2026: ca. 1.5-2.5%)</p>
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
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="firstMortgageTerm">Zinsfestschreibung (Jahre)</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold mb-1">Zinsfestschreibung (Informativ)</p>
                          <p className="text-sm mb-2">Zeitraum, für den der Hypothekarzins vertraglich fixiert ist.</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Hinweis:</strong> Dieser Wert wird NICHT in Berechnungen verwendet, dient nur als Notiz für Ihre Planung.
                          </p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💡 Typisch: 5, 10 oder 15 Jahre
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="firstMortgageTerm"
                      type="number"
                      value={params.mortgage.firstMortgageTerm}
                      onChange={(e) => handleUpdate({
                        mortgage: { ...params.mortgage, firstMortgageTerm: Number(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-muted-foreground italic">Nur zur Information, nicht in Berechnungen</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">2. Hypothek</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="secondMortgageTerm">Zinsfestschreibung (Jahre)</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold mb-1">Zinsfestschreibung (Informativ)</p>
                          <p className="text-sm mb-2">Zeitraum, für den der Hypothekarzins vertraglich fixiert ist.</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Hinweis:</strong> Dieser Wert wird NICHT in Berechnungen verwendet, dient nur als Notiz für Ihre Planung.
                          </p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            💡 Typisch: 5, 10 oder 15 Jahre
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="secondMortgageTerm"
                      type="number"
                      value={params.mortgage.secondMortgageTerm}
                      onChange={(e) => handleUpdate({
                        mortgage: { ...params.mortgage, secondMortgageTerm: Number(e.target.value) }
                      })}
                    />
                    <p className="text-xs text-muted-foreground italic">Nur zur Information, nicht in Berechnungen</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="amortizationYears">Amortisation (Jahre)</Label>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Zeitraum zur Rückzahlung der 2. Hypothek auf 65% Belehnung (gesetzlich innerhalb 15 Jahren oder bis Pensionierung)</p>
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
                          💡 Richtwert: CHF 200-400/Monat je nach Grösse, Energieeffizienz und Verbrauch
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
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="maintenanceSimple">Unterhalt (% vom Kaufpreis p.a.)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Unterhaltskosten</p>
                        <p className="text-sm mb-2">Jährliche Kosten für Reparaturen, Renovationen und Werterhaltung (Dach, Fassade, Heizung, Küche/Bad über Zeit).</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Wesentlicher laufender Kostenfaktor bei Eigentum. 1% des Kaufpreises ist Faustregel, ältere Objekte mehr.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 1.0-1.5% p.a. (Neubauten 0.8%, Altbauten 1.2-2.0%)
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
                          💡 Richtwert: CHF 0-200/Monat (0 wenn im Kaufpreis enthalten, CHF 100-200 bei separater Miete)
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
                          💡 Richtwert: CHF 0-5000/Jahr (bei älteren Objekten höher)
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
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Geschätzte jährliche Kosten</h4>
                <p className="text-2xl font-mono">
                  {formatCurrency(
                    params.runningCosts.utilities * 12 + 
                    params.runningCosts.insurance +
                    params.purchase.purchasePrice * params.runningCosts.maintenanceSimple / 100 +
                    (params.runningCosts.parkingCost || 0) * 12 +
                    (params.runningCosts.condominiumFees || 0) * 12 +
                    (params.runningCosts.renovationReserve || 0)
                  )}/Jahr
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nebenkosten + Versicherung + Unterhalt + Zusatzkosten
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
                          💡 Richtwert: 1-3% p.a. (historischer Durchschnitt Schweiz: ca. 2%)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
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
                          💡 Richtwert: 5-7% p.a. (historischer Durchschnitt globaler Aktienmarkt)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
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
                  <div className="flex items-center gap-2">
                    <Label htmlFor="inflation">Inflation (% p.a.)</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">Inflation</p>
                        <p className="text-sm mb-2">Allgemeine Teuerungsrate. Wird bei Mietsteigerung berücksichtigt und sollte zukünftig auch auf Nebenkosten und Unterhalt angewendet werden.</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Einfluss:</strong> Aktuell nur auf Miete angewendet (über "Jährliche Mietsteigerung"). Sollte idealerweise auch Nebenkosten/Unterhalt beeinflussen.
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          💡 Richtwert: 1.0-2.0% p.a. (langfristiger Durchschnitt Schweiz)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
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
    </TooltipProvider>
  )
}
