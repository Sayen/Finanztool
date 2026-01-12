import type { CalculationParams, CalculationResults, YearlyCalculation } from '../types'

const CALCULATION_YEARS = 50
const AFFORDABILITY_CALC_RATE = 5.0 // 5% kalkulatorischer Zins
const AFFORDABILITY_MAX_RATIO = 33.33 // 33% rule

/**
 * Main calculation engine for rent vs ownership comparison
 */
export function calculateScenario(params: CalculationParams): CalculationResults {
  const yearlyData: YearlyCalculation[] = []
  
  // Calculate initial values
  const totalMortgage = params.mortgage.firstMortgage + params.mortgage.secondMortgage
  const closingCosts = params.purchase.purchasePrice * (
    (params.purchase.notaryFees + params.purchase.landRegistryFees + params.purchase.brokerFees) / 100
  )
  const initialInvestment = params.purchase.equity + closingCosts
  
  // Affordability check
  const affordabilityCheck = calculateAffordability(params)
  
  // Calculate yearly data
  let mortgageBalance = totalMortgage
  let propertyValue = params.purchase.purchasePrice
  let cumulativeRentCost = 0
  let cumulativeOwnershipCost = initialInvestment // Start with initial investment
  let currentRent = params.rent.netRent
  let breakEvenYear: number | null = null
  
  for (let year = 1; year <= CALCULATION_YEARS; year++) {
    // Rent calculations
    const rentCost = currentRent * 12
    const rentUtilities = params.rent.utilities * 12
    const rentInsurance = params.rent.insurance * 12
    const rentTotalAnnual = rentCost + rentUtilities + rentInsurance
    cumulativeRentCost += rentTotalAnnual
    
    // Update rent for next year
    currentRent = currentRent * (1 + params.rent.annualIncrease / 100)
    
    // Ownership calculations
    const mortgageInterest = mortgageBalance * (
      (params.mortgage.firstMortgage * params.mortgage.firstMortgageRate / 100 +
       params.mortgage.secondMortgage * params.mortgage.secondMortgageRate / 100) /
      totalMortgage
    )
    
    const annualAmortization = year <= params.mortgage.amortizationYears && params.mortgage.secondMortgage > 0
      ? params.mortgage.secondMortgage / params.mortgage.amortizationYears
      : 0
    
    mortgageBalance = Math.max(0, mortgageBalance - annualAmortization)
    
    const ownershipUtilities = params.runningCosts.utilities * 12
    const ownershipInsurance = params.runningCosts.insurance * 12
    const maintenanceCost = calculateMaintenanceCost(params, year)
    
    const ownershipTotalAnnual = mortgageInterest + annualAmortization + 
                                  ownershipUtilities + ownershipInsurance + maintenanceCost
    cumulativeOwnershipCost += ownershipTotalAnnual
    
    // Tax effects
    const taxSavingsInterestDeduction = params.tax.interestDeduction
      ? (mortgageInterest * params.tax.marginalTaxRate / 100)
      : 0
    
    const rentalValueTax = params.tax.rentalValueTaxation
      ? (propertyValue * params.tax.rentalValueRate / 100 * params.tax.marginalTaxRate / 100)
      : 0
    
    const netTaxEffect = taxSavingsInterestDeduction - rentalValueTax
    
    // Update property value
    propertyValue = propertyValue * (1 + params.propertyAppreciationRate / 100)
    
    // Wealth calculations
    const netEquity = propertyValue - mortgageBalance
    const opportunityCostETF = params.purchase.equity * Math.pow(1 + params.etfReturnRate / 100, year)
    const netWealthRent = opportunityCostETF - cumulativeRentCost
    const netWealthOwnership = netEquity - cumulativeOwnershipCost
    
    // Check for break-even
    if (breakEvenYear === null && cumulativeOwnershipCost < cumulativeRentCost) {
      breakEvenYear = year
    }
    
    yearlyData.push({
      year,
      rentCost,
      rentUtilities,
      rentInsurance,
      rentTotalAnnual,
      rentCumulativeCost: cumulativeRentCost,
      ownershipMortgageInterest: mortgageInterest,
      ownershipAmortization: annualAmortization,
      ownershipUtilities,
      ownershipInsurance,
      ownershipMaintenance: maintenanceCost,
      ownershipTotalAnnual,
      ownershipCumulativeCost: cumulativeOwnershipCost,
      taxSavingsInterestDeduction,
      rentalValueTax,
      netTaxEffect,
      propertyValue,
      mortgageBalance,
      netEquity,
      opportunityCostETF,
      netWealthRent,
      netWealthOwnership,
    })
  }
  
  return {
    affordabilityCheck,
    breakEvenYear,
    totalCostRent: {
      year10: yearlyData[9]?.rentCumulativeCost || 0,
      year20: yearlyData[19]?.rentCumulativeCost || 0,
      year30: yearlyData[29]?.rentCumulativeCost || 0,
    },
    totalCostOwnership: {
      year10: yearlyData[9]?.ownershipCumulativeCost || 0,
      year20: yearlyData[19]?.ownershipCumulativeCost || 0,
      year30: yearlyData[29]?.ownershipCumulativeCost || 0,
    },
    yearlyData,
    kpis: {
      monthlyRent: params.rent.netRent,
      monthlyOwnership: (yearlyData[0]?.ownershipTotalAnnual || 0) / 12,
      initialInvestment,
      totalMortgage,
      equityAfter10Years: yearlyData[9]?.netEquity || 0,
      equityAfter20Years: yearlyData[19]?.netEquity || 0,
    },
  }
}

/**
 * Calculate affordability based on 33% rule with 5% calculation rate
 */
function calculateAffordability(params: CalculationParams) {
  const monthlyIncome = params.quickStart.householdIncome / 12
  const totalMortgage = params.mortgage.firstMortgage + params.mortgage.secondMortgage
  
  // Calculate with 5% calculation rate
  const calculatedInterest = totalMortgage * AFFORDABILITY_CALC_RATE / 100
  const annualAmortization = params.mortgage.secondMortgage / params.mortgage.amortizationYears
  const annualCosts = calculatedInterest + annualAmortization + 
                      (params.runningCosts.utilities + params.runningCosts.insurance) * 12 +
                      (params.purchase.purchasePrice * params.runningCosts.maintenanceSimple / 100)
  
  const requiredMonthlyIncome = (annualCosts / 12) / (AFFORDABILITY_MAX_RATIO / 100)
  const utilizationPercent = (annualCosts / 12) / monthlyIncome * 100
  
  return {
    monthlyIncome,
    requiredMonthlyIncome,
    isAffordable: utilizationPercent <= AFFORDABILITY_MAX_RATIO,
    utilizationPercent,
  }
}

/**
 * Calculate maintenance costs (simple or detailed cyclical model)
 */
function calculateMaintenanceCost(params: CalculationParams, year: number): number {
  // Simple model: percentage of purchase price annually
  let maintenanceCost = params.purchase.purchasePrice * params.runningCosts.maintenanceSimple / 100
  
  // Add detailed cyclical costs if defined
  if (params.runningCosts.roofRenovation && params.runningCosts.roofInterval) {
    if (year % params.runningCosts.roofInterval === 0) {
      maintenanceCost += params.runningCosts.roofRenovation
    }
  }
  
  if (params.runningCosts.facadeRenovation && params.runningCosts.facadeInterval) {
    if (year % params.runningCosts.facadeInterval === 0) {
      maintenanceCost += params.runningCosts.facadeRenovation
    }
  }
  
  if (params.runningCosts.heatingRenovation && params.runningCosts.heatingInterval) {
    if (year % params.runningCosts.heatingInterval === 0) {
      maintenanceCost += params.runningCosts.heatingRenovation
    }
  }
  
  if (params.runningCosts.kitchenBathRenovation && params.runningCosts.kitchenBathInterval) {
    if (year % params.runningCosts.kitchenBathInterval === 0) {
      maintenanceCost += params.runningCosts.kitchenBathRenovation
    }
  }
  
  return maintenanceCost
}

/**
 * Auto-derive parameters from quick start inputs
 */
export function deriveFromQuickStart(quickStart: import('../types').QuickStartParams): Partial<CalculationParams> {
  const mortgageNeed = quickStart.purchasePrice - quickStart.equity
  
  // Derive comparison rent based on location and property type
  const baseRentPerSqm = getBaseRent(quickStart.location, quickStart.propertyType)
  const estimatedSize = getEstimatedSize(quickStart.propertyType, quickStart.purchasePrice)
  const comparisonRent = baseRentPerSqm * estimatedSize
  
  // Standard mortgage structure: 65% first, 15% second
  const firstMortgageRatio = Math.min(0.65, mortgageNeed / quickStart.purchasePrice)
  const secondMortgageRatio = Math.min(0.15, (mortgageNeed - quickStart.purchasePrice * firstMortgageRatio) / quickStart.purchasePrice)
  
  return {
    quickStart,
    rent: {
      netRent: comparisonRent,
      utilities: comparisonRent * 0.15, // Estimate 15% of rent
      insurance: 50, // Standard monthly estimate
      annualIncrease: 2.0, // 2% per year
    },
    purchase: {
      propertyType: quickStart.propertyType,
      purchasePrice: quickStart.purchasePrice,
      equity: quickStart.equity,
      notaryFees: 0.5,
      landRegistryFees: 0.3,
      brokerFees: 3.0,
    },
    mortgage: {
      firstMortgage: quickStart.purchasePrice * firstMortgageRatio,
      firstMortgageRate: 2.5,
      firstMortgageTerm: 10,
      secondMortgage: quickStart.purchasePrice * secondMortgageRatio,
      secondMortgageRate: 3.0,
      secondMortgageTerm: 5,
      amortizationYears: 15,
    },
    runningCosts: {
      utilities: comparisonRent * 0.15, // Same as rent estimate
      insurance: 100, // Monthly estimate for ownership
      maintenanceSimple: 1.0, // 1% of purchase price annually
    },
    tax: {
      marginalTaxRate: 25, // Estimated for middle income in Zurich
      interestDeduction: true,
      rentalValueTaxation: true,
      rentalValueRate: 3.5, // 3.5% of property value
    },
    propertyAppreciationRate: 2.0, // 2% annually
    etfReturnRate: 6.0, // 6% annually for opportunity cost
    inflationRate: 1.5, // 1.5% annually
  }
}

/**
 * Get base rent per square meter based on location quality
 */
function getBaseRent(location: import('../types').LocationQuality, propertyType: import('../types').PropertyType): number {
  const baseRates = {
    apartment: { prime: 35, good: 28, average: 22, peripheral: 18 },
    house: { prime: 40, good: 32, average: 25, peripheral: 20 },
    condo: { prime: 38, good: 30, average: 24, peripheral: 19 },
  }
  return baseRates[propertyType][location]
}

/**
 * Estimate property size based on type and price
 */
function getEstimatedSize(propertyType: import('../types').PropertyType, price: number): number {
  // Price per sqm estimates for Canton Zurich
  const pricePerSqm = propertyType === 'house' ? 8000 : 10000
  return Math.round(price / pricePerSqm)
}
