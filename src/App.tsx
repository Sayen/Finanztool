import { useState } from 'react'
import { QuickStart } from './components/calculator/QuickStart'
import { DetailedParameters } from './components/calculator/DetailedParameters'
import { ResultsOverview } from './components/calculator/KpiCards'
import { CostComparisonChart, WealthChart } from './components/charts/CostCharts'
import { ScenarioLibrary } from './components/scenario/ScenarioLibrary'
import { useScenarioStore } from './stores/scenarioStore'
import { Button } from './components/ui/Button'
import { Home, BarChart3, Settings, FileText } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'detailed' | 'charts' | 'scenarios'>('quickstart')
  const currentScenario = useScenarioStore((state) => state.getCurrentScenario())
  const scenarios = useScenarioStore((state) => state.scenarios)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Miete vs. Eigentum</h1>
              <p className="text-sm text-muted-foreground">Vergleichstool für Kanton Zürich</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Szenarien: {scenarios.length}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('quickstart')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'quickstart'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="h-4 w-4 inline mr-2" />
              Schnellstart
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'detailed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Detailliert
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'charts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Visualisierungen
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'scenarios'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Szenarien
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'quickstart' && (
          <div className="space-y-6">
            <QuickStart />
            
            {currentScenario?.results && (
              <div className="space-y-6">
                <ResultsOverview
                  monthlyRent={currentScenario.results.kpis.monthlyRent}
                  monthlyOwnership={currentScenario.results.kpis.monthlyOwnership}
                  isAffordable={currentScenario.results.affordabilityCheck.isAffordable}
                  utilizationPercent={currentScenario.results.affordabilityCheck.utilizationPercent}
                  breakEvenYear={currentScenario.results.breakEvenYear}
                  equityAfter10Years={currentScenario.results.kpis.equityAfter10Years}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-6">
            <DetailedParameters />
            
            {currentScenario?.results && (
              <ResultsOverview
                monthlyRent={currentScenario.results.kpis.monthlyRent}
                monthlyOwnership={currentScenario.results.kpis.monthlyOwnership}
                isAffordable={currentScenario.results.affordabilityCheck.isAffordable}
                utilizationPercent={currentScenario.results.affordabilityCheck.utilizationPercent}
                breakEvenYear={currentScenario.results.breakEvenYear}
                equityAfter10Years={currentScenario.results.kpis.equityAfter10Years}
              />
            )}
          </div>
        )}

        {activeTab === 'charts' && currentScenario?.results && (
          <div className="space-y-6">
            <CostComparisonChart data={currentScenario.results.yearlyData} />
            <WealthChart data={currentScenario.results.yearlyData} />
          </div>
        )}

        {activeTab === 'scenarios' && (
          <ScenarioLibrary />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Miete vs. Eigentum Vergleichstool © 2026 | Kanton Zürich</p>
        </div>
      </footer>
    </div>
  )
}

export default App
