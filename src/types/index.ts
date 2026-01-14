export type LocationQuality = 'prime' | 'good' | 'average' | 'peripheral'

export interface QuickStartParams {
  purchasePrice: number
  equity: number
  householdIncome: number
  location: LocationQuality
  annualLivingExpenses?: number // Annual living expenses for realistic wealth calculation
  initialTotalWealth?: number // Total wealth before purchase/rent start
}

export interface RentParams {
  netRent: number
  utilities: number
  insurance: number
  annualIncrease: number // as percentage
}

export interface PurchaseParams {
  purchasePrice: number
  equity: number
  notaryFees: number // as percentage
  landRegistryFees: number // as percentage
  brokerFees: number // as percentage
  mortgageProcessingFee?: number // as percentage (typically 0.5-1%)
  propertyValuationFee?: number // fixed amount (typically CHF 500-2000)
}

export interface MortgageParams {
  firstMortgage: number // amount
  firstMortgageRate: number // as percentage
  secondMortgage: number // amount
  secondMortgageRate: number // as percentage
  amortizationYears: number
}

export interface RunningCostsParams {
  utilities: number
  insurance: number
  maintenanceMode?: 'simple' | 'detailed' // Mode for maintenance calculation (default: 'simple')
  maintenanceSimple: number // as percentage of purchase price
  parkingCost?: number // monthly parking costs
  condominiumFees?: number // monthly condominium management fees
  renovationReserve?: number // annual renovation reserve
  // Detailed maintenance (optional)
  roofRenovation?: number
  roofInitialInterval?: number
  roofInterval?: number
  facadeRenovation?: number
  facadeInitialInterval?: number
  facadeInterval?: number
  heatingRenovation?: number
  heatingInitialInterval?: number
  heatingInterval?: number
  kitchenBathRenovation?: number
  kitchenBathInitialInterval?: number
  kitchenBathInterval?: number
}

export interface TaxParams {
  marginalTaxRate: number // as percentage
  interestDeduction: boolean
  rentalValueTaxation: boolean
  rentalValueRate: number // as percentage of property value
}

export interface AdditionalParams {
  propertyAppreciationRate: number // annual % increase
  etfReturnRate: number // annual % return for opportunity cost
  inflationRate: number
  investCashInRent: boolean // Whether cash assets are invested in rent scenario
  investCashInOwnership: boolean // Whether cash assets are invested in ownership scenario
}

export interface CalculationParams {
  quickStart: QuickStartParams
  rent: RentParams
  purchase: PurchaseParams
  mortgage: MortgageParams
  runningCosts: RunningCostsParams
  tax: TaxParams
  additional: AdditionalParams
  // Legacy fields for backward compatibility
  propertyAppreciationRate?: number
  etfReturnRate?: number
  inflationRate?: number
}

export interface YearlyCalculation {
  year: number
  // Rent scenario
  rentCost: number
  rentUtilities: number
  rentInsurance: number
  rentTotalAnnual: number
  rentCumulativeCost: number
  // Ownership scenario
  ownershipMortgageInterest: number
  ownershipAmortization: number
  ownershipUtilities: number
  ownershipInsurance: number
  ownershipMaintenance: number
  ownershipTotalAnnual: number
  ownershipCumulativeCost: number
  // Tax effects
  taxSavingsInterestDeduction: number
  rentalValueTax: number
  netTaxEffect: number
  // Wealth
  propertyValue: number
  mortgageBalance: number
  netEquity: number
  opportunityCostETF: number
  netWealthRent: number
  netWealthOwnership: number
  // Income and expenses
  annualIncome: number
  annualLivingExpenses: number
  netAnnualSavings: number // Income - living expenses - housing costs
}

export interface CalculationResults {
  affordabilityCheck: {
    monthlyIncome: number
    requiredMonthlyIncome: number
    isAffordable: boolean
    utilizationPercent: number
  }
  breakEvenYear: number | null
  netWealthBreakEvenYear: number | null
  totalCostRent: {
    year10: number
    year20: number
    year30: number
  }
  totalCostOwnership: {
    year10: number
    year20: number
    year30: number
  }
  yearlyData: YearlyCalculation[]
  kpis: {
    monthlyRent: number
    monthlyOwnership: number
    initialInvestment: number
    totalMortgage: number
    equityAfter10Years: number
    equityAfter20Years: number
  }
}

export interface Scenario {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  params: CalculationParams
  results?: CalculationResults
}

export interface ScenarioComparison {
  scenarios: Scenario[]
  comparisonMetrics: {
    scenarioId: string
    totalCostDifference: number
    netWealthDifference: number
    affordabilityScore: number
  }[]
}
