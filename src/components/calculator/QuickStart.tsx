import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { useScenarioStore } from '../../stores/scenarioStore'
import { deriveFromQuickStart } from '../../lib/calculator'
import { formatCurrency } from '../../lib/utils'
import type { QuickStartParams } from '../../types'

export function QuickStart() {
  const createScenario = useScenarioStore((state) => state.createScenario)
  const [params, setParams] = useState<QuickStartParams>({
    purchasePrice: 1000000,
    propertyType: 'apartment',
    equity: 200000,
    householdIncome: 150000,
    location: 'good',
  })
  
  const [showResults, setShowResults] = useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const derived = deriveFromQuickStart(params)
    createScenario('Neues Szenario', derived)
    setShowResults(true)
  }
  
  const mortgageNeed = params.purchasePrice - params.equity
  const ltv = (mortgageNeed / params.purchasePrice * 100).toFixed(1)
  
  return (
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
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Kaufpreis</Label>
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
              <Label htmlFor="propertyType">Immobilientyp</Label>
              <select
                id="propertyType"
                value={params.propertyType}
                onChange={(e) => setParams({ ...params, propertyType: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="apartment">Wohnung</option>
                <option value="condo">Stockwerkeigentum</option>
                <option value="house">Haus</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equity">Eigenkapital</Label>
              <Input
                id="equity"
                type="number"
                value={params.equity}
                onChange={(e) => setParams({ ...params, equity: Number(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(params.equity)}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="householdIncome">Haushaltseinkommen (jährlich)</Label>
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
              <Label htmlFor="location">Wohnlage</Label>
              <select
                id="location"
                value={params.location}
                onChange={(e) => setParams({ ...params, location: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="prime">Toplage</option>
                <option value="good">Gute Lage</option>
                <option value="average">Durchschnittliche Lage</option>
                <option value="peripheral">Randlage</option>
              </select>
            </div>
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
  )
}
