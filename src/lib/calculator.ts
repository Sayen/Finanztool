import type { CalculationParams, CalculationResults, YearlyCalculation } from '../types'

const CALCULATION_YEARS = 50
const AFFORDABILITY_CALC_RATE = 5.0 // 5% kalkulatorischer Zins
const AFFORDABILITY_MAX_RATIO = 33.33 // 33% rule

/**
 * Main calculation engine for rent vs ownership comparison
 */
export function calculateScenario(params: CalculationParams): CalculationResults {
  const yearlyData: YearlyCalculation[] = []
  
  // Handle backward compatibility for old params structure
  const additional = params.additional || {
    propertyAppreciationRate: params.propertyAppreciationRate || 2.0,
    etfReturnRate: params.etfReturnRate || 6.0,
    inflationRate: params.inflationRate || 1.5,
    investCashInRent: true,
    investCashInOwnership: false,
  }
  
  // Calculate initial values
  const totalMortgage = params.mortgage.firstMortgage + params.mortgage.secondMortgage
  const closingCosts = params.purchase.purchasePrice * (
    (params.purchase.notaryFees + params.purchase.landRegistryFees + params.purchase.brokerFees) / 100
  )
  const mortgageProcessingCost = params.purchase.mortgageProcessingFee 
    ? (totalMortgage * params.purchase.mortgageProcessingFee / 100) 
    : 0
  const propertyValuationCost = params.purchase.propertyValuationFee || 0
  const initialInvestment = params.purchase.equity + closingCosts + mortgageProcessingCost + propertyValuationCost
  
  // Initial wealth calculations
  const initialTotalWealth = params.quickStart.initialTotalWealth || params.purchase.equity
  const annualLivingExpenses = params.quickStart.annualLivingExpenses || 0
  const annualIncome = params.quickStart.householdIncome
  
  // Affordability check
  const affordabilityCheck = calculateAffordability(params)
  
  // Calculate yearly data
  let mortgageBalance = totalMortgage
  let propertyValue = params.purchase.purchasePrice
  let cumulativeRentCost = 0
  let cumulativeOwnershipCost = initialInvestment // Start with initial investment
  let currentRent = params.rent.netRent
  let breakEvenYear: number | null = null
  let netWealthBreakEvenYear: number | null = null
  
  // Wealth tracking with income
  let rentScenarioWealth = initialTotalWealth - params.purchase.equity // Remaining cash after not buying
  let ownershipScenarioWealth = initialTotalWealth - initialInvestment // Remaining cash after buying
  
  for (let year = 1; year <= CALCULATION_YEARS; year++) {
    // Calculate inflation factor for this year
    // Note: year - 1 because year 1 is the base year (inflationFactor = 1.0, no inflation)
    // Year 2 has inflationFactor = 1 + rate, Year 3 = (1 + rate)^2, etc.
    const inflationFactor = Math.pow(1 + additional.inflationRate / 100, year - 1)
    
    // Rent calculations
    const rentCost = currentRent * 12
    const rentUtilities = params.rent.utilities * 12 * inflationFactor
    const rentInsurance = params.rent.insurance * inflationFactor
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
    
    // Apply inflation to running costs
    const ownershipUtilities = params.runningCosts.utilities * 12 * inflationFactor
    const ownershipInsurance = params.runningCosts.insurance * inflationFactor
    const maintenanceCost = calculateMaintenanceCost(params, year) * inflationFactor
    const parkingCost = (params.runningCosts.parkingCost || 0) * 12 * inflationFactor
    const condominiumFees = (params.runningCosts.condominiumFees || 0) * 12 * inflationFactor
    const renovationReserve = (params.runningCosts.renovationReserve || 0) * inflationFactor
    
    const ownershipTotalAnnual = mortgageInterest + annualAmortization + 
                                  ownershipUtilities + ownershipInsurance + maintenanceCost +
                                  parkingCost + condominiumFees + renovationReserve
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
    propertyValue = propertyValue * (1 + additional.propertyAppreciationRate / 100)
    
    // Income and expenses for realistic wealth calculation
    const livingExpenses = annualLivingExpenses * inflationFactor
    
    // Net savings from income after living expenses and housing costs
    const netSavingsRent = annualIncome - livingExpenses - rentTotalAnnual
    const netSavingsOwnership = annualIncome - livingExpenses - ownershipTotalAnnual + netTaxEffect
    
    // Accumulate wealth over time
    // For rent scenario: start with remaining cash, add net savings, invest if enabled
    if (additional.investCashInRent && rentScenarioWealth > 0) {
      rentScenarioWealth = rentScenarioWealth * (1 + additional.etfReturnRate / 100)
    }
    rentScenarioWealth += netSavingsRent
    
    // For ownership scenario: start with remaining cash, add net savings, invest if enabled
    if (additional.investCashInOwnership && ownershipScenarioWealth > 0) {
      ownershipScenarioWealth = ownershipScenarioWealth * (1 + additional.etfReturnRate / 100)
    }
    ownershipScenarioWealth += netSavingsOwnership
    
    // Wealth calculations
    const netEquity = propertyValue - mortgageBalance
    const opportunityCostETF = params.purchase.equity * Math.pow(1 + additional.etfReturnRate / 100, year)
    const netWealthRent = rentScenarioWealth
    const netWealthOwnership = netEquity + ownershipScenarioWealth
    
    // Check for break-even
    if (breakEvenYear === null && cumulativeOwnershipCost < cumulativeRentCost) {
      breakEvenYear = year
    }

    if (netWealthBreakEvenYear === null && netWealthOwnership > netWealthRent) {
      netWealthBreakEvenYear = year
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
      annualIncome,
      annualLivingExpenses: livingExpenses,
      netAnnualSavings: netSavingsRent, // Net savings in rent scenario (income - living - housing)
    })
  }
  
  return {
    affordabilityCheck,
    breakEvenYear,
    netWealthBreakEvenYear,
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
                      (params.runningCosts.utilities + (params.runningCosts.parkingCost || 0) + 
                       (params.runningCosts.condominiumFees || 0)) * 12 +
                      params.runningCosts.insurance +
                      (params.runningCosts.renovationReserve || 0) +
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
 * IMPORTANT: Either simple OR detailed model is used, never both together
 */
function calculateMaintenanceCost(params: CalculationParams, year: number): number {
  // Get maintenance mode (default to 'simple' for backward compatibility)
  const mode = params.runningCosts.maintenanceMode || 'simple'
  
  let maintenanceCost = 0

  if (mode === 'simple') {
    // Simple model: percentage of purchase price annually
    maintenanceCost = params.purchase.purchasePrice * params.runningCosts.maintenanceSimple / 100
  } else if (mode === 'detailed') {
    // Detailed cyclical model: specific renovation costs at intervals
    const {
      roofRenovation, roofInitialInterval, roofInterval,
      facadeRenovation, facadeInitialInterval, facadeInterval,
      heatingRenovation, heatingInitialInterval, heatingInterval,
      kitchenBathRenovation, kitchenBathInitialInterval, kitchenBathInterval,
    } = params.runningCosts;

    // Helper for cyclical cost calculation
    const checkAndAddCost = (cost?: number, initial?: number, interval?: number) => {
      if (cost && initial && interval && year >= initial) {
        if ((year - initial) % interval === 0) {
          maintenanceCost += cost;
        }
      }
    };

    checkAndAddCost(roofRenovation, roofInitialInterval, roofInterval);
    checkAndAddCost(facadeRenovation, facadeInitialInterval, facadeInterval);
    checkAndAddCost(heatingRenovation, heatingInitialInterval, heatingInterval);
    checkAndAddCost(kitchenBathRenovation, kitchenBathInitialInterval, kitchenBathInterval);
  }
  
  return maintenanceCost
}

/**
 * Auto-derive parameters from quick start inputs
 */
export function deriveFromQuickStart(quickStart: import('../types').QuickStartParams): Partial<CalculationParams> {
  const mortgageNeed = quickStart.purchasePrice - quickStart.equity
  
  // Derive comparison rent based on location and property type
  const baseRentPerSqm = getBaseRent()
  const estimatedSize = getEstimatedSize(quickStart.purchasePrice)
  const comparisonRent = baseRentPerSqm * estimatedSize
  
  // Standard mortgage structure: 65% first, 15% second
  const firstMortgageRatio = Math.min(0.65, mortgageNeed / quickStart.purchasePrice)
  const secondMortgageRatio = Math.min(0.15, (mortgageNeed - quickStart.purchasePrice * firstMortgageRatio) / quickStart.purchasePrice)
  
  // Calculate standard maintenance values based on purchase price
  const purchasePrice = quickStart.purchasePrice
  const roofCost = Math.round(purchasePrice * 0.05) // 5% of purchase price
  const facadeCost = Math.round(purchasePrice * 0.04) // 4% of purchase price
  const heatingCost = Math.round(purchasePrice * 0.02) // 2% of purchase price
  const kitchenBathCost = Math.round(purchasePrice * 0.08) // 8% of purchase price
  
  return {
    quickStart,
    rent: {
      netRent: comparisonRent,
      utilities: comparisonRent * 0.15, // Estimate 15% of rent
      insurance: 600, // Annual estimate
      annualIncrease: 1.0, // 1% per year
    },
    purchase: {
      purchasePrice: quickStart.purchasePrice,
      equity: quickStart.equity,
      notaryFees: 0.5,
      landRegistryFees: 0.3,
      brokerFees: 1.0,
      mortgageProcessingFee: 0.5, // Default 0.5%
      propertyValuationFee: 1000, // Default CHF 1000
    },
    mortgage: {
      firstMortgage: quickStart.purchasePrice * firstMortgageRatio,
      firstMortgageRate: 1.5,
      secondMortgage: quickStart.purchasePrice * secondMortgageRatio,
      secondMortgageRate: 1.5,
      amortizationYears: 15,
    },
    runningCosts: {
      utilities: comparisonRent * 0.15, // Same as rent estimate
      insurance: 1200, // Annual estimate for ownership
      maintenanceMode: 'simple', // Default to simple model
      maintenanceSimple: 1.0, // 1% of purchase price annually
      parkingCost: 0,
      condominiumFees: 0,
      renovationReserve: 0,
      roofRenovation: roofCost,
      roofInitialInterval: 25,
      roofInterval: 25,
      facadeRenovation: facadeCost,
      facadeInitialInterval: 20,
      facadeInterval: 20,
      heatingRenovation: heatingCost,
      heatingInitialInterval: 18,
      heatingInterval: 18,
      kitchenBathRenovation: kitchenBathCost,
      kitchenBathInitialInterval: 15,
      kitchenBathInterval: 15,
    },
    tax: {
      marginalTaxRate: 25, // Estimated for middle income in Zurich
      interestDeduction: false,
      rentalValueTaxation: false,
      rentalValueRate: 3.5, // 3.5% of property value
    },
    additional: {
      propertyAppreciationRate: 2.0, // 2% annually
      etfReturnRate: 6.0, // 6% annually for opportunity cost
      inflationRate: 1.5, // 1.5% annually
      investCashInRent: true, // Invest remaining cash in rent scenario
      investCashInOwnership: false, // Don't invest in ownership (cash is in property)
    },
  }
}

/**
 * Get base rent per square meter based on location quality
 */
function getBaseRent(): number {
  const baseRates = {
    apartment: { prime: 35, good: 28, average: 22, peripheral: 18 },
  }
  return baseRates['apartment']['good']
}

/**
 * Estimate property size based on type and price
 */
function getEstimatedSize(price: number): number {
  // Price per sqm estimates for Canton Zurich
  const pricePerSqm = 10000
  return Math.round(price / pricePerSqm)
}
