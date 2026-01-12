import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency in Swiss format: CHF 1'300'000
 */
export function formatCurrency(amount: number, decimals = 0): string {
  const parts = amount.toFixed(decimals).split('.')
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'")
  return decimals > 0 && parts[1] 
    ? `CHF ${integerPart}.${parts[1]}`
    : `CHF ${integerPart}`
}

/**
 * Format percentage: 2.5%
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Parse Swiss currency format to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[CHF'\s]/g, '').replace(',', '.'))
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
