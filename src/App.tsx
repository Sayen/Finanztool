import { useState } from 'react'
import { QuickStart } from './components/calculator/QuickStart'
import { DetailedParameters } from './components/calculator/DetailedParameters'
import { ResultsOverview } from './components/calculator/KpiCards'
import { CostComparisonChart, WealthChart, AnnualCostBreakdown } from './components/charts/CostCharts'
import { ScenarioLibrary } from './components/scenario/ScenarioLibrary'
import { useScenarioStore } from './stores/scenarioStore'
import { Button } from './components/ui/Button'
import { exportToPDF, exportToExcel, generateShareableUrl, copyToClipboard } from './lib/export'
import { useTheme } from './hooks/useTheme'
import { Home, BarChart3, Settings, FileText, Download, Share2, Moon, Sun } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'detailed' | 'charts' | 'scenarios'>('quickstart')
  const [shareMessage, setShareMessage] = useState<string>('')
  const currentScenario = useScenarioStore((state) => state.getCurrentScenario())
  const scenarios = useScenarioStore((state) => state.scenarios)
  const { theme, toggleTheme } = useTheme()
  
  const handleExportPDF = () => {
    if (currentScenario) {
      exportToPDF(currentScenario)
    }
  }
  
  const handleExportExcel = () => {
    if (currentScenario) {
      exportToExcel(currentScenario)
    }
  }
  
  const handleShare = async () => {
    if (currentScenario) {
      const url = generateShareableUrl(currentScenario)
      try {
        await copyToClipboard(url)
        setShareMessage('Link in Zwischenablage kopiert!')
        setTimeout(() => setShareMessage(''), 3000)
      } catch {
        setShareMessage('Fehler beim Kopieren')
      }
    }
  }

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
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTheme}
                className="dark:ring-1 dark:ring-border"
                aria-label={theme === 'light' ? 'Zu Dark Mode wechseln' : 'Zu Light Mode wechseln'}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              {currentScenario && (
                <>
                  <Button variant="outline" size="sm" onClick={handleShare} aria-label="Szenario teilen">
                    <Share2 className="h-4 w-4 mr-2" />
                    Teilen
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExcel} aria-label="Als CSV exportieren">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF} aria-label="Als PDF exportieren">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setActiveTab('scenarios')} aria-label="Szenarien anzeigen">
                <FileText className="h-4 w-4 mr-2" />
                Szenarien: {scenarios.length}
              </Button>
            </div>
          </div>
          
          {shareMessage && (
            <div className="mt-2 text-sm text-green-600 text-right">
              {shareMessage}
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('quickstart')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'quickstart'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Schnellstart Tab"
            >
              <Home className="h-4 w-4 inline mr-2" />
              Schnellstart
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'detailed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Detailliert Tab"
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Detailliert
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'charts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Visualisierungen Tab"
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Visualisierungen
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'scenarios'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Szenarien Tab"
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Szenarien
            </button>
          </div>
        </div>
      </nav>

      {/* Current Scenario Name Display */}
      {currentScenario && (
        <div className="border-b bg-muted/50 py-3">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold text-primary">
              Aktuelles Szenario: {currentScenario.name}
            </h2>
          </div>
        </div>
      )}

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
            <AnnualCostBreakdown data={currentScenario.results.yearlyData} />
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
