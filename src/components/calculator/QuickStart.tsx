import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip'
import { useScenarioStore } from '../../stores/scenarioStore'
import { deriveFromQuickStart } from '../../lib/calculator'
import { formatCurrency } from '../../lib/utils'
import { Info } from 'lucide-react'
import type { QuickStartParams, PropertyType, LocationQuality } from '../../types'

interface QuickStartProps {
  setActiveTab: (tab: 'quickstart' | 'detailed' | 'charts' | 'scenarios') => void
}

export function QuickStart({ setActiveTab }: QuickStartProps) {
  const createScenario = useScenarioStore((state) => state.createScenario)
  const [scenarioName, setScenarioName] = useState('Neues Szenario')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [params, setParams] = useState<QuickStartParams>({
    purchasePrice: 1000000,
    propertyType: 'apartment',
    equity: 200000,
    householdIncome: 150000,
    location: 'good',
    annualLivingExpenses: 0,
    initialTotalWealth: undefined,
  })
  
  const [showResults, setShowResults] = useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation: Equity must be at least 20% of purchase price
    const minEquity = params.purchasePrice * 0.20
    if (params.equity < minEquity) {
      alert(`Eigenkapital muss mindestens 20% des Kaufpreises betragen (${formatCurrency(minEquity)})`)
      return
    }
    
    const derived = deriveFromQuickStart(params)
    createScenario(scenarioName, derived)
    setShowResults(true)
    setActiveTab('detailed')
  }
  
  const mortgageNeed = params.purchasePrice - params.equity
  const ltv = (mortgageNeed / params.purchasePrice * 100).toFixed(1)
  const equityRatio = (params.equity / params.purchasePrice * 100).toFixed(1)
  const isEquityTooLow = params.equity < params.purchasePrice * 0.20
  
  const handleSet65LTV = () => {
    setParams({ ...params, equity: Math.round(params.purchasePrice * 0.35) })
  }
  
  return (
    <TooltipProvider>
      <Card className="w-full">
      <CardHeader>
        <CardTitle>Schnellstart</CardTitle>
        <CardDescription>
          Geben Sie 5 Kernparameter ein für eine erste Einschätzung
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="scenarioName">Szenario-Name</Label>
              <Input
                id="scenarioName"
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="z.B. Wohnung in der Schweiz"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="purchasePrice">Kaufpreis</Label>
                <Tooltip>
                  <TooltipTrigger type="button">
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Der Kaufpreis der Immobilie ohne Kaufnebenkosten (Notar, Grundbuch, Makler)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="purchasePrice"
                type="number"
                value={params.purchasePrice}
                onChange={(e) => setParams({ ...params, purchasePrice: Number(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(params.purchasePrice)}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="propertyType">Immobilientyp</Label>
                <Tooltip>
                  <TooltipTrigger type="button">
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Wohnung = Mietwohnung zum Vergleich | Stockwerkeigentum = Eigentumswohnung | Haus = Einfamilienhaus</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <select
                id="propertyType"
                value={params.propertyType}
                onChange={(e) => setParams({ ...params, propertyType: e.target.value as PropertyType })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:text-foreground"
              >
                <option value="apartment">Wohnung</option>
                <option value="condo">Stockwerkeigentum</option>
                <option value="house">Haus</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="equity">Eigenkapital</Label>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Ihr verfügbares Kapital für den Kauf. Mindestens 20% des Kaufpreises erforderlich, 10% davon als 'hartes' Eigenkapital</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={handleSet65LTV}
                    >
                      Auf 65% LTV setzen
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Setzt das Eigenkapital so, dass keine 2. Hypothek erforderlich ist (35% Eigenkapital, 65% 1. Hypothek)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="equity"
                type="number"
                value={params.equity}
                onChange={(e) => setParams({ ...params, equity: Number(e.target.value) })}
                required
                className={isEquityTooLow ? "border-destructive" : ""}
              />
              <p className={`text-xs ${isEquityTooLow ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                {formatCurrency(params.equity)} ({equityRatio}%)
                {isEquityTooLow && " - Mindestens 20% erforderlich!"}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="householdIncome">Haushaltseinkommen (jährlich)</Label>
                <Tooltip>
                  <TooltipTrigger type="button">
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Jährliches Bruttoeinkommen aller im Haushalt lebenden Personen</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="householdIncome"
                type="number"
                value={params.householdIncome}
                onChange={(e) => setParams({ ...params, householdIncome: Number(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(params.householdIncome)}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="location">Wohnlage</Label>
                <Tooltip>
                  <TooltipTrigger type="button">
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Toplage = Stadtzentrum | Gute Lage = Nähe Zentrum | Durchschnittlich = Aussenquartiere | Randlage = Periphere Gemeinden</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <select
                id="location"
                value={params.location}
                onChange={(e) => setParams({ ...params, location: e.target.value as LocationQuality })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:text-foreground"
              >
                <option value="prime">Toplage</option>
                <option value="good">Gute Lage</option>
                <option value="average">Durchschnittliche Lage</option>
                <option value="peripheral">Randlage</option>
              </select>
            </div>
          </div>
          
          {/* Optional advanced fields */}
          <div className="space-y-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? '▼' : '▶'} Erweiterte Optionen (optional)
            </Button>
            
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="livingExpenses">Jährliche Lebenshaltungskosten</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Ausgaben für Essen, Kleidung, Transport etc. (ohne Wohnkosten). Für realistische Vermögensberechnung.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="livingExpenses"
                    type="number"
                    value={params.annualLivingExpenses || 0}
                    onChange={(e) => setParams({ ...params, annualLivingExpenses: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.annualLivingExpenses || 0)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="initialWealth">Gesamtvermögen zu Beginn</Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Ihr totales Vermögen. Standard: entspricht Eigenkapital. Erhöhen wenn Sie zusätzliches Kapital haben.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="initialWealth"
                    type="number"
                    value={params.initialTotalWealth || params.equity}
                    onChange={(e) => setParams({ ...params, initialTotalWealth: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(params.initialTotalWealth || params.equity)}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Automatische Ableitung:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Hypothekenbedarf:</span>
                <span className="ml-2 font-mono">{formatCurrency(mortgageNeed)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Belehnung (LTV):</span>
                <span className="ml-2 font-mono">{ltv}%</span>
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full" size="lg">
            Berechnung starten
          </Button>
        </form>
        
        {showResults && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Szenario erfolgreich erstellt! Sehen Sie sich die detaillierten Ergebnisse an.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}
