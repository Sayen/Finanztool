import { Link } from 'react-router-dom'
import { Calculator, PieChart, ArrowRight } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Willkommen</h1>
          <p className="text-xl text-muted-foreground">Wählen Sie ein Werkzeug für Ihre Finanzplanung</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/rent-vs-own"
            className="group block p-6 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Calculator className="h-8 w-8" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Miete vs. Eigentum</h2>
            <p className="text-muted-foreground">
              Vergleichen Sie die finanziellen Auswirkungen von Mieten und Kaufen über 50 Jahre. Inklusive detaillierter Cashflow- und Vermögensanalyse.
            </p>
          </Link>

          <Link
            to="/budget-planner"
            className="group block p-6 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <PieChart className="h-8 w-8" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Budget Planer</h2>
            <p className="text-muted-foreground">
              Erstellen Sie umfangreiche Sankey-Diagramme für Ihre Budgetplanung. Visualisieren Sie Einnahmen und Ausgabenflüsse im Detail.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
