import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// Note: xlsx package has known vulnerabilities (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9)
// Using CSV export as a safer alternative until a patched version is available
import type { Scenario } from '../types'
import { formatCurrency, formatPercent } from './utils'

/**
 * Export scenario to PDF report
 */
export function exportToPDF(scenario: Scenario) {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Miete vs. Eigentum Vergleich', 14, 20)
  
  doc.setFontSize(12)
  doc.text(`Szenario: ${scenario.name}`, 14, 30)
  doc.setFontSize(10)
  doc.text(`Erstellt am: ${new Date(scenario.createdAt).toLocaleDateString('de-CH')}`, 14, 36)
  
  // Summary section
  let yPos = 45
  doc.setFontSize(14)
  doc.text('Zusammenfassung', 14, yPos)
  yPos += 8
  
  if (scenario.results) {
    const summaryData = [
      ['Kaufpreis', formatCurrency(scenario.params.purchase.purchasePrice)],
      ['Eigenkapital', formatCurrency(scenario.params.purchase.equity)],
      ['Hypothek', formatCurrency(scenario.results.kpis.totalMortgage)],
      ['', ''],
      ['Monatliche Miete', formatCurrency(scenario.results.kpis.monthlyRent)],
      ['Monatliche Kosten Eigentum', formatCurrency(scenario.results.kpis.monthlyOwnership)],
      ['', ''],
      ['Tragbarkeit', scenario.results.affordabilityCheck.isAffordable ? 'Ja ✓' : 'Nein ✗'],
      ['Auslastung', formatPercent(scenario.results.affordabilityCheck.utilizationPercent, 1)],
      ['Break-Even Jahr', scenario.results.breakEvenYear ? `Jahr ${scenario.results.breakEvenYear}` : 'Nicht erreicht'],
    ]
    
    autoTable(doc, {
      startY: yPos,
      head: [['Parameter', 'Wert']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [32, 134, 190] },
    })
    
    // Cost comparison table
    yPos = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(14)
    doc.text('Kostenvergleich über Zeit', 14, yPos)
    yPos += 8
    
    const costData = [5, 10, 15, 20, 25, 30]
      .filter(year => year <= scenario.results!.yearlyData.length)
      .map((year) => {
        const data = scenario.results!.yearlyData[year - 1]
        return [
          `Jahr ${year}`,
          formatCurrency(data.rentCumulativeCost),
          formatCurrency(data.ownershipCumulativeCost),
          formatCurrency(data.ownershipCumulativeCost - data.rentCumulativeCost),
        ]
      })
    
    autoTable(doc, {
      startY: yPos,
      head: [['Jahr', 'Kum. Kosten Miete', 'Kum. Kosten Eigentum', 'Differenz']],
      body: costData,
      theme: 'striped',
      headStyles: { fillColor: [32, 134, 190] },
    })
    
    // Wealth comparison
    yPos = (doc as any).lastAutoTable.finalY + 10
    
    // Add new page if needed
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(14)
    doc.text('Vermögensentwicklung', 14, yPos)
    yPos += 8
    
    const wealthData = [10, 20, 30]
      .filter(year => year <= scenario.results!.yearlyData.length)
      .map((year) => {
        const data = scenario.results!.yearlyData[year - 1]
        return [
          `Jahr ${year}`,
          formatCurrency(data.netWealthRent),
          formatCurrency(data.netWealthOwnership),
          formatCurrency(data.netEquity),
        ]
      })
    
    autoTable(doc, {
      startY: yPos,
      head: [['Jahr', 'Nettovermögen Miete', 'Nettovermögen Eigentum', 'Eigenkapital']],
      body: wealthData,
      theme: 'striped',
      headStyles: { fillColor: [32, 134, 190] },
    })
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Seite ${i} von ${pageCount} | Miete vs. Eigentum Tool © 2026`,
      14,
      doc.internal.pageSize.height - 10
    )
  }
  
  // Save
  doc.save(`${scenario.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`)
}

/**
 * Export scenario to CSV (safer alternative to Excel with xlsx vulnerabilities)
 */
export function exportToExcel(scenario: Scenario) {
  if (!scenario.results) return
  
  // Create CSV content
  const headers = [
    'Jahr',
    'Miete (Jahr)',
    'Kum. Kosten Miete',
    'Hypothekarzins',
    'Amortisation',
    'Nebenkosten',
    'Unterhalt',
    'Kosten Eigentum (Jahr)',
    'Kum. Kosten Eigentum',
    'Immobilienwert',
    'Hypothekensaldo',
    'Eigenkapital',
    'Nettovermögen Miete',
    'Nettovermögen Eigentum',
  ]
  
  const rows = scenario.results.yearlyData.slice(0, 30).map((item) => [
    item.year,
    item.rentTotalAnnual,
    item.rentCumulativeCost,
    item.ownershipMortgageInterest,
    item.ownershipAmortization,
    item.ownershipUtilities + item.ownershipInsurance,
    item.ownershipMaintenance,
    item.ownershipTotalAnnual,
    item.ownershipCumulativeCost,
    item.propertyValue,
    item.mortgageBalance,
    item.netEquity,
    item.netWealthRent,
    item.netWealthOwnership,
  ])
  
  // Add summary header
  const summary = [
    ['Miete vs. Eigentum Vergleich'],
    ['Szenario:', scenario.name],
    ['Erstellt:', new Date(scenario.createdAt).toLocaleDateString('de-CH')],
    [],
    ['Kaufpreis', scenario.params.purchase.purchasePrice],
    ['Eigenkapital', scenario.params.purchase.equity],
    ['Hypothek', scenario.results.kpis.totalMortgage],
    ['Monatliche Miete', scenario.results.kpis.monthlyRent],
    ['Monatliche Kosten Eigentum', scenario.results.kpis.monthlyOwnership],
    ['Tragbar', scenario.results.affordabilityCheck.isAffordable ? 'Ja' : 'Nein'],
    ['Auslastung %', scenario.results.affordabilityCheck.utilizationPercent],
    ['Break-Even Jahr', scenario.results.breakEvenYear || 'Nicht erreicht'],
    [],
  ]
  
  // Combine all data
  const csvContent = [
    ...summary.map(row => row.join(',')),
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${scenario.name.replace(/\s+/g, '-')}-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Generate shareable URL with scenario parameters
 */
export function generateShareableUrl(scenario: Scenario): string {
  const baseUrl = window.location.origin + window.location.pathname
  const params = new URLSearchParams()
  
  // Encode key parameters
  params.set('name', scenario.name)
  params.set('price', scenario.params.purchase.purchasePrice.toString())
  params.set('equity', scenario.params.purchase.equity.toString())
  params.set('income', scenario.params.quickStart.householdIncome.toString())
  params.set('rent', scenario.params.rent.netRent.toString())
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * Copy text to clipboard
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
