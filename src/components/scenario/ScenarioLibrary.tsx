import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { useScenarioStore } from '../../stores/scenarioStore'
import { formatCurrency } from '../../lib/utils'
import { Star, Copy, Trash2, Download, Upload, Plus } from 'lucide-react'

export function ScenarioLibrary() {
  const scenarios = useScenarioStore((state) => state.scenarios)
  const currentScenarioId = useScenarioStore((state) => state.currentScenarioId)
  const setCurrentScenario = useScenarioStore((state) => state.setCurrentScenario)
  const duplicateScenario = useScenarioStore((state) => state.duplicateScenario)
  const deleteScenario = useScenarioStore((state) => state.deleteScenario)
  const toggleFavorite = useScenarioStore((state) => state.toggleFavorite)
  const createScenario = useScenarioStore((state) => state.createScenario)
  const exportScenarios = useScenarioStore((state) => state.exportScenarios)
  const importScenarios = useScenarioStore((state) => state.importScenarios)
  
  const handleExport = () => {
    const json = exportScenarios()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finanztool-szenarien-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const json = e.target?.result as string
          importScenarios(json)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }
  
  const sortedScenarios = [...scenarios].sort((a, b) => {
    // Favorites first
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    // Then by update date
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Szenarien-Bibliothek</h2>
          <p className="text-muted-foreground">Verwalten Sie alle Ihre Berechnungen</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Importieren
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button onClick={() => createScenario('Neues Szenario')}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Szenario
          </Button>
        </div>
      </div>
      
      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Sie haben noch keine Szenarien erstellt
            </p>
            <Button onClick={() => createScenario('Mein erstes Szenario')}>
              <Plus className="h-4 w-4 mr-2" />
              Erstes Szenario erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedScenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={`cursor-pointer transition-all ${
                currentScenarioId === scenario.id
                  ? 'ring-2 ring-primary'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setCurrentScenario(scenario.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(scenario.id)
                    }}
                    className="text-muted-foreground hover:text-highlight"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        scenario.isFavorite ? 'fill-highlight text-highlight' : ''
                      }`}
                    />
                  </button>
                </div>
                {scenario.description && (
                  <CardDescription>{scenario.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {scenario.results && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kaufpreis:</span>
                      <span className="font-mono">
                        {formatCurrency(scenario.params.purchase.purchasePrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monatl. Miete:</span>
                      <span className="font-mono text-rent">
                        {formatCurrency(scenario.results.kpis.monthlyRent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monatl. Eigentum:</span>
                      <span className="font-mono text-ownership">
                        {formatCurrency(scenario.results.kpis.monthlyOwnership)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tragbar:</span>
                      <span className={scenario.results.affordabilityCheck.isAffordable ? 'text-green-600' : 'text-red-600'}>
                        {scenario.results.affordabilityCheck.isAffordable ? '✓ Ja' : '✗ Nein'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Aktualisiert: {new Date(scenario.updatedAt).toLocaleDateString('de-CH')}
                </div>
                
                <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => duplicateScenario(scenario.id)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplizieren
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Möchten Sie dieses Szenario wirklich löschen?')) {
                        deleteScenario(scenario.id)
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
