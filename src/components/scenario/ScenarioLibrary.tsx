import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useScenarioStore } from '../../stores/scenarioStore'
import { formatCurrency } from '../../lib/utils'
import { Star, Copy, Trash2, Download, Upload, Plus, Search, Filter } from 'lucide-react'

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
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'favorites' | 'affordable' | 'not-affordable'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price' | 'affordability'>('date')
  
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
  const handleResetFilters = () => {
    setSearchQuery('')
    setFilter('all')
  }
  
  // Filter scenarios based on search and filters
  let filteredScenarios = scenarios.filter(scenario => {
    // Search filter
    const matchesSearch = scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (scenario.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (!matchesSearch) return false
    
    // Other filters
    if (filter === 'favorites' && !scenario.isFavorite) return false
    if (filter === 'affordable' && scenario.results && !scenario.results.affordabilityCheck.isAffordable) return false
    if (filter === 'not-affordable' && scenario.results && scenario.results.affordabilityCheck.isAffordable) return false
    
    return true
  })
  
  // Sort scenarios
  const sortedScenarios = [...filteredScenarios].sort((a, b) => {
    // Favorites always first
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    
    // Then by selected sort
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price':
        return a.params.purchase.purchasePrice - b.params.purchase.purchasePrice
      case 'affordability':
        if (!a.results || !b.results) return 0
        return a.results.affordabilityCheck.utilizationPercent - b.results.affordabilityCheck.utilizationPercent
      case 'date':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Szenarien-Bibliothek</h2>
          <p className="text-muted-foreground">
            {scenarios.length} {scenarios.length === 1 ? 'Szenario' : 'Szenarien'}
            {filteredScenarios.length !== scenarios.length && ` (${filteredScenarios.length} angezeigt)`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleImport} aria-label="Szenarien importieren">
            <Upload className="h-4 w-4 mr-2" />
            Importieren
          </Button>
          <Button variant="outline" onClick={handleExport} aria-label="Szenarien exportieren">
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button onClick={() => createScenario('Neues Szenario')} aria-label="Neues Szenario erstellen">
            <Plus className="h-4 w-4 mr-2" />
            Neues Szenario
          </Button>
        </div>
      </div>
      
      {/* Search and Filter Controls */}
      {scenarios.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Szenarien durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Alle</option>
                <option value="favorites">Nur Favoriten</option>
                <option value="affordable">Tragbar</option>
                <option value="not-affordable">Nicht tragbar</option>
              </select>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="date">Nach Datum</option>
              <option value="name">Nach Name</option>
              <option value="price">Nach Kaufpreis</option>
              <option value="affordability">Nach Tragbarkeit</option>
            </select>
          </div>
        </div>
      )}
      
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
      ) : sortedScenarios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Keine Szenarien gefunden, die Ihren Filterkriterien entsprechen
            </p>
            <Button variant="outline" onClick={handleResetFilters}>
              Filter zurücksetzen
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
                    aria-label={scenario.isFavorite ? `${scenario.name} aus Favoriten entfernen` : `${scenario.name} zu Favoriten hinzufügen`}
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
                    aria-label={`${scenario.name} duplizieren`}
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
                    aria-label={`${scenario.name} löschen`}
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
