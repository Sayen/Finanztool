import type { CalculationParams, YearlyCalculation } from '../types'

/**
 * Calculate Year 0 data point for charts
 * Year 0 represents the initial state before any housing costs are incurred
 */
export function calculateYear0Data(params: CalculationParams): YearlyCalculation {
  const totalMortgage = params.mortgage.firstMortgage + params.mortgage.secondMortgage
  
  // Calculate initial investment for ownership
  const closingCosts = params.purchase.purchasePrice * (
    (params.purchase.notaryFees + params.purchase.landRegistryFees + params.purchase.brokerFees) / 100
  )
  const mortgageProcessingCost = params.purchase.mortgageProcessingFee 
    ? (totalMortgage * params.purchase.mortgageProcessingFee / 100) 
    : 0
  const propertyValuationCost = params.purchase.propertyValuationFee || 0
  const initialInvestment = params.purchase.equity + closingCosts + mortgageProcessingCost + propertyValuationCost
  
  // Initial wealth
  const initialTotalWealth = params.quickStart.initialTotalWealth || params.purchase.equity
  
  return {
    year: 0,
    // Rent scenario - no costs yet
    rentCost: 0,
    rentUtilities: 0,
    rentInsurance: 0,
    rentTotalAnnual: 0,
    rentCumulativeCost: 0,
    // Ownership scenario - starts with initial investment
    ownershipMortgageInterest: 0,
    ownershipAmortization: 0,
    ownershipUtilities: 0,
    ownershipInsurance: 0,
    ownershipMaintenance: 0,
    ownershipTotalAnnual: 0,
    ownershipCumulativeCost: initialInvestment,
    // Tax effects
    taxSavingsInterestDeduction: 0,
    rentalValueTax: 0,
    netTaxEffect: 0,
    // Wealth
    propertyValue: params.purchase.purchasePrice,
    mortgageBalance: totalMortgage,
    netEquity: params.purchase.equity,
    opportunityCostETF: params.purchase.equity, // Starting capital
    netWealthRent: initialTotalWealth,
    netWealthOwnership: initialTotalWealth,
    // Income and expenses
    annualIncome: params.quickStart.householdIncome,
    annualLivingExpenses: params.quickStart.annualLivingExpenses || 0,
    netAnnualSavings: 0,
  }
}
