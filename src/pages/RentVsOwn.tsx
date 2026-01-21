import { useState } from 'react'
import { QuickStart } from '../components/calculator/QuickStart'
import { DetailedParameters } from '../components/calculator/DetailedParameters'
import { ResultsOverview } from '../components/calculator/KpiCards'
import { CostComparisonChart, WealthChart, AnnualCostBreakdown } from '../components/charts/CostCharts'
import { CashflowChart } from '../components/charts/CashflowChart'
import { AffordabilityChart } from '../components/charts/AffordabilityChart'
import { TaxChart } from '../components/charts/TaxChart'
import { BreakEvenChart } from '../components/charts/BreakEvenChart'
import { TotalAssetsBreakEvenChart } from '../components/charts/TotalAssetsBreakEvenChart'
import { OpportunityCostChart } from '../components/charts/OpportunityCostChart'
import { ScenarioLibrary } from '../components/scenario/ScenarioLibrary'
import { useScenarioStore } from '../stores/scenarioStore'
import { Button } from '../components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { exportToPDF, exportToExcel, generateShareableUrl, copyToClipboard } from '../lib/export'
import { Home, BarChart3, Settings, FileText, Download, Share2 } from 'lucide-react'

export function RentVsOwn() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'detailed' | 'charts' | 'scenarios'>('quickstart')
  const [shareMessage, setShareMessage] = useState<string>('')
  const [timeHorizon, setTimeHorizon] = useState<number>(30) // Default 30 years
  const currentScenario = useScenarioStore((state) => state.getCurrentScenario())

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
    <div className="container mx-auto px-4 py-8">
      {/* Tool Header Actions */}
      <div className="flex justify-end mb-4 gap-2">
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
      </div>

      {shareMessage && (
        <div className="mb-4 text-sm text-green-600 text-right">
          {shareMessage}
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b bg-card mb-6">
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
      </nav>

      {/* Current Scenario Name Display */}
      {currentScenario && (
        <div className="bg-muted/50 py-3 px-4 mb-6 rounded-md">
            <h2 className="text-xl font-semibold text-primary">
              Aktuelles Szenario: {currentScenario.name}
            </h2>
        </div>
      )}

      {/* Main Content */}
        {activeTab === 'quickstart' && (
          <div className="space-y-6">
            <QuickStart setActiveTab={setActiveTab} />

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
          </div>
        )}

        {activeTab === 'charts' && currentScenario?.results && (
          <div className="space-y-4">
            {/* Time Horizon Slider */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="timeHorizon" className="font-medium">
                  Zeithorizont: <span className="text-primary">{timeHorizon} Jahre</span>
                </label>
                <span className="text-xs text-muted-foreground">5-50 Jahre</span>
              </div>
              <input
                id="timeHorizon"
                type="range"
                min="5"
                max="50"
                step="1"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="overview">Übersicht</TabsTrigger>
                <TabsTrigger value="cashflow">Cashflow</TabsTrigger>
                <TabsTrigger value="affordability">Tragbarkeit</TabsTrigger>
                <TabsTrigger value="taxes">Steuern</TabsTrigger>
                <TabsTrigger value="breakeven">Break-Even</TabsTrigger>
                <TabsTrigger value="opportunity">Opportunität</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <CostComparisonChart data={currentScenario.results.yearlyData} maxYears={timeHorizon} params={currentScenario.params} />
                <WealthChart data={currentScenario.results.yearlyData} maxYears={timeHorizon} params={currentScenario.params} />
                <AnnualCostBreakdown data={currentScenario.results.yearlyData} maxYears={timeHorizon} />
              </TabsContent>

              <TabsContent value="cashflow" className="space-y-6 mt-6">
                <CashflowChart data={currentScenario.results.yearlyData} maxYears={timeHorizon} />
                <AnnualCostBreakdown data={currentScenario.results.yearlyData} displayYears={[1, 2, 3, 5, 10]} maxYears={timeHorizon} />
              </TabsContent>

              <TabsContent value="affordability" className="space-y-6 mt-6">
                <AffordabilityChart params={currentScenario.params} maxYears={timeHorizon} />
              </TabsContent>

              <TabsContent value="taxes" className="space-y-6 mt-6">
                <TaxChart data={currentScenario.results.yearlyData} maxYears={timeHorizon} />
              </TabsContent>

              <TabsContent value="breakeven" className="space-y-6 mt-6">
                <BreakEvenChart
                  data={currentScenario.results.yearlyData}
                  breakEvenYear={currentScenario.results.breakEvenYear}
                  maxYears={timeHorizon}
                  params={currentScenario.params}
                />
                <TotalAssetsBreakEvenChart
                  data={currentScenario.results.yearlyData}
                  breakEvenYear={currentScenario.results.netWealthBreakEvenYear}
                  maxYears={timeHorizon}
                  params={currentScenario.params}
                />
              </TabsContent>

              <TabsContent value="opportunity" className="space-y-6 mt-6">
                <OpportunityCostChart data={currentScenario.results.yearlyData} maxYears={timeHorizon} params={currentScenario.params} />
                <WealthChart data={currentScenario.results.yearlyData} maxYears={timeHorizon} params={currentScenario.params} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <ScenarioLibrary />
        )}
    </div>
  )
}
