/**
 * Zentralisierte Tooltip-Definitionen für alle Parameter
 * Diese Tooltips werden sowohl in QuickStart als auch in DetailedParameters verwendet
 */

export interface TooltipDefinition {
  title: string
  description: string
  impact: string
  hint?: string
}

export const TOOLTIPS: Record<string, TooltipDefinition> = {
  purchasePrice: {
    title: "Kaufpreis",
    description: "Der reine Preis der Immobilie ohne Nebenkosten. Wichtigster Faktor für die Berechnung der Hypothek und des Eigenkapitalbedarfs.",
    impact: "Bestimmt die Höhe der Hypothek, des benötigten Eigenkapitals und der Kaufnebenkosten.",
    hint: undefined,
  },
  equity: {
    title: "Eigenkapital",
    description: "Ihre eigenen finanziellen Mittel (Ersparnisse, 3a, Erbvorbezug). Mindestens 20% des Kaufpreises sind in der Schweiz erforderlich.",
    impact: "Reduziert die benötigte Hypothek und damit die Zinskosten. Mehr Eigenkapital verbessert die Tragbarkeit.",
    hint: "💡 Richtwert: Mindestens 20% des Kaufpreises. 10% müssen \"hartes\" Eigenkapital sein (nicht aus Pensionskasse).",
  },
  householdIncome: {
    title: "Haushaltseinkommen",
    description: "Jährliches Bruttoeinkommen aller im Haushalt lebenden Personen. Wichtig für realistische Vermögensberechnung.",
    impact: "Ermöglicht Vermögensaufbau auch im Mietszenario durch Sparen der Differenz zum Eigentum.",
    hint: undefined,
  },
  propertyType: {
    title: "Immobilientyp",
    description: "Art der Immobilie: Wohnung (Mietwohnung), Haus (Einfamilienhaus), oder Eigentumswohnung.",
    impact: "Beeinflusst die Schätzung der Vergleichsmiete und die typischen Unterhaltskosten.",
    hint: undefined,
  },
  location: {
    title: "Lage",
    description: "Qualität der Lage bestimmt die Miethöhe für das Vergleichsszenario.",
    impact: "Prime Lagen haben höhere Mieten, periphere Lagen niedrigere Mieten.",
    hint: "💡 Prime: Stadtzentrum • Good: Gute Quartiere • Average: Standard • Peripheral: Randlage",
  },
  annualLivingExpenses: {
    title: "Jährliche Lebenshaltungskosten",
    description: "Ausgaben für Essen, Kleidung, Transport etc. (ohne Wohnkosten). Für realistische Vermögensberechnung.",
    impact: "Bestimmt wie viel vom Einkommen für Sparen und Investitionen verfügbar ist.",
    hint: undefined,
  },
  initialTotalWealth: {
    title: "Gesamtvermögen zu Beginn",
    description: "Ihr totales Vermögen. Standard: entspricht Eigenkapital. Erhöhen wenn Sie zusätzliches Kapital haben.",
    impact: "Basis für die Vermögensberechnung in beiden Szenarien.",
    hint: undefined,
  },
}
