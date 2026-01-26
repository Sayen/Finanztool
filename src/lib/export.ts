import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
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
 * Export scenario to Excel (.xlsx) using exceljs
 * Generates a clean, formatted report with multiple sheets
 */
export async function exportToExcel(scenario: Scenario) {
  if (!scenario.results) return

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Miete vs. Eigentum Tool'
  workbook.created = new Date()

  // --- SHEET 1: ZUSAMMENFASSUNG ---
  const summarySheet = workbook.addWorksheet('Zusammenfassung', {
    properties: { tabColor: { argb: 'FF2086BE' } },
    views: [{ showGridLines: false }]
  })

  // Set column widths
  summarySheet.columns = [
    { width: 35 }, // Label
    { width: 25 }, // Value
    { width: 5 },  // Spacer
    { width: 35 }, // Label 2
    { width: 25 }, // Value 2
  ]

  // Title
  summarySheet.mergeCells('A1:E1')
  const titleCell = summarySheet.getCell('A1')
  titleCell.value = 'Miete vs. Eigentum Vergleich'
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF2086BE' } }
  titleCell.alignment = { horizontal: 'center' }

  // Subtitle
  summarySheet.mergeCells('A2:E2')
  const subTitleCell = summarySheet.getCell('A2')
  subTitleCell.value = `Szenario: ${scenario.name} | Erstellt am: ${new Date(scenario.createdAt).toLocaleDateString('de-CH')}`
  subTitleCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF666666' } }
  subTitleCell.alignment = { horizontal: 'center' }

  // Section: Eckdaten (Key Figures)
  summarySheet.getCell('A4').value = 'Wichtige Eckdaten'
  summarySheet.getCell('A4').font = { size: 12, bold: true, underline: true }

  const keyFigures = [
    ['Kaufpreis', scenario.params.purchase.purchasePrice, 'Eigenkapital', scenario.params.purchase.equity],
    ['Hypothek', scenario.results.kpis.totalMortgage, 'Zinssatz (Mix)', (scenario.params.mortgage.firstMortgageRate + scenario.params.mortgage.secondMortgageRate) / 2 / 100], // Approximation
    ['Monatliche Miete', scenario.results.kpis.monthlyRent, 'Monatliche Kosten Eigentum', scenario.results.kpis.monthlyOwnership],
  ]

  let currentRow = 6
  keyFigures.forEach(row => {
    // Left side
    summarySheet.getCell(`A${currentRow}`).value = row[0]
    summarySheet.getCell(`B${currentRow}`).value = row[1]

    // Right side
    summarySheet.getCell(`D${currentRow}`).value = row[2]
    summarySheet.getCell(`E${currentRow}`).value = row[3]

    // Styling
    summarySheet.getRow(currentRow).font = { size: 11 }
    currentRow++
  })

  // Formatting Numbers
  summarySheet.getColumn(2).numFmt = '#,##0 "CHF"'
  summarySheet.getColumn(5).numFmt = '#,##0 "CHF"'
  // Fix percentage format for interest rate
  summarySheet.getCell(`E${currentRow - 2}`).numFmt = '0.00%'

  // Section: Resultat (Results)
  currentRow += 2
  summarySheet.getCell(`A${currentRow}`).value = 'Analyse Ergebnis'
  summarySheet.getCell(`A${currentRow}`).font = { size: 12, bold: true, underline: true }
  currentRow += 2

  const resultData = [
    ['Tragbarkeit', scenario.results.affordabilityCheck.isAffordable ? 'Gegeben' : 'Nicht gegeben'],
    ['Auslastung', scenario.results.affordabilityCheck.utilizationPercent / 100],
    ['Break-Even', scenario.results.breakEvenYear ? `Nach ${scenario.results.breakEvenYear} Jahren` : 'Nie'],
  ]

  resultData.forEach((row, index) => {
    const r = currentRow + index
    summarySheet.getCell(`A${r}`).value = row[0]
    summarySheet.getCell(`B${r}`).value = row[1]
    summarySheet.getCell(`A${r}`).font = { bold: true }

    if (index === 0) {
      // Color code Affordability
      summarySheet.getCell(`B${r}`).font = {
        color: { argb: scenario.results!.affordabilityCheck.isAffordable ? 'FF00AA00' : 'FFAA0000' },
        bold: true
      }
    }
    if (index === 1) summarySheet.getCell(`B${r}`).numFmt = '0.0%'
  })


  // --- SHEET 2: DETAILLIERTE DATEN ---
  const detailSheet = workbook.addWorksheet('Detaillierte Daten', {
    properties: { tabColor: { argb: 'FF2086BE' } },
    views: [{ state: 'frozen', ySplit: 1 }] // Freeze header
  })

  // Headers
  const headers = [
    'Jahr',
    'Miete (Jahr)',
    'Kum. Kosten Miete',
    'Zinsen',
    'Amortisation',
    'Nebenkosten',
    'Unterhalt',
    'Kosten Eigentum (Jahr)',
    'Kum. Kosten Eigentum',
    'Immobilienwert',
    'Hypothek',
    'Eigenkapital',
    'Nettovermögen Miete',
    'Nettovermögen Eigentum',
  ]

  const headerRow = detailSheet.getRow(1)
  headerRow.values = headers
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2086BE' }
  }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  
  // Data Rows
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

  detailSheet.addRows(rows)

  // Formatting Detail Sheet
  detailSheet.columns.forEach((column, i) => {
    column.width = i === 0 ? 10 : 20 // Year column narrower
    if (i > 0) {
      column.numFmt = '#,##0' // Number format for money
    }
  })

  // Stripe rows
  detailSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F8FF' } // Light AliceBlue
      }
    }
  })


  // Generate Buffer and Trigger Download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${scenario.name.replace(/\s+/g, '-')}-Analyse.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
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
