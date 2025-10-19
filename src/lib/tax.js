/**
     * Calculate tax amount based on merchant configuration
     * @param {object} merchantConfig - The merchant's configuration object
     * @param {number} amount - Amount in cents
     * @returns {number} Tax amount in cents
     */
    export function calculateTax(merchantConfig, amount) {
      if (!merchantConfig) return 0;
      const taxRate = merchantConfig.tax_rate || 0;
      if (merchantConfig.tax_included) {
        return Math.round(amount * taxRate / (1 + taxRate));
      } else {
        return Math.round(amount * taxRate);
      }
    }
    
    /**
     * Calculate subtotal (pre-tax amount) based on merchant configuration
     * @param {object} merchantConfig - The merchant's configuration object
     * @param {number} amount - Amount in cents
     * @returns {number} Subtotal in cents
     */
    export function calculateSubtotal(merchantConfig, amount) {
      if (!merchantConfig) return amount;
      if (merchantConfig.tax_included) {
        return amount - calculateTax(merchantConfig, amount);
      } else {
        return amount;
      }
    }
    
    /**
     * Calculate total amount including tax based on merchant configuration
     * @param {object} merchantConfig - The merchant's configuration object
     * @param {number} amount - Amount in cents
     * @returns {number} Total amount in cents
     */
    export function calculateTotal(merchantConfig, amount) {
      if (!merchantConfig) return amount;
      if (merchantConfig.tax_included) {
        return amount;
      } else {
        return amount + calculateTax(merchantConfig, amount);
      }
    }
    
    /**
     * Get the tax label for display
     * @param {object} merchantConfig - The merchant's configuration object
     * @returns {string} Tax label (e.g., 'VAT', 'Tax', etc.)
     */
    export function getTaxLabel(merchantConfig) {
      return merchantConfig?.tax_label || 'Tax';
    }
    
    /**
     * Check if tax is included in displayed prices
     * @param {object} merchantConfig - The merchant's configuration object
     * @returns {boolean} True if tax is included in prices
     */
    export function isTaxIncluded(merchantConfig) {
      return merchantConfig?.tax_included || false;
    }