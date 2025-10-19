import { merchantConfig } from '../data/config'

/**
 * Calculate tax amount based on merchant configuration
 * @param {number} amount - Amount in cents
 * @returns {number} Tax amount in cents
 */
export function calculateTax(amount) {
  const taxRate = merchantConfig.tax_rate || 0
  if (merchantConfig.tax_included) {
    // Tax is included in the price - calculate the tax portion
    return Math.round(amount * taxRate / (1 + taxRate))
  } else {
    // Tax is added to the price
    return Math.round(amount * taxRate)
  }
}

/**
 * Calculate subtotal (pre-tax amount) based on merchant configuration
 * @param {number} amount - Amount in cents
 * @returns {number} Subtotal in cents
 */
export function calculateSubtotal(amount) {
  if (merchantConfig.tax_included) {
    // Price includes tax - subtract tax to get subtotal
    return amount - calculateTax(amount)
  } else {
    // Price is pre-tax - amount is already subtotal
    return amount
  }
}

/**
 * Calculate total amount including tax based on merchant configuration
 * @param {number} amount - Amount in cents
 * @returns {number} Total amount in cents
 */
export function calculateTotal(amount) {
  if (merchantConfig.tax_included) {
    // Price already includes tax
    return amount
  } else {
    // Add tax to the price
    return amount + calculateTax(amount)
  }
}

/**
 * Get the tax label for display
 * @returns {string} Tax label (e.g., 'VAT', 'Tax', etc.)
 */
export function getTaxLabel() {
  return merchantConfig.tax_label || 'Tax'
}

/**
 * Get the tax rate as a percentage string
 * @returns {string} Tax rate formatted as percentage (e.g., '20%')
 */
export function getTaxRateDisplay() {
  const rate = (merchantConfig.tax_rate || 0) * 100
  return `${rate}%`
}

/**
 * Check if tax is included in displayed prices
 * @returns {boolean} True if tax is included in prices
 */
export function isTaxIncluded() {
  return merchantConfig.tax_included || false
}