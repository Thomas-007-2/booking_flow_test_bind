function getProductVariant(products, variantId) {
  for (const product of products) {
    const variant = product.product_variants.find(v => v.id === variantId)
    if (variant) return { product, variant }
  }
  return { product: null, variant: null }
}

function derivedPriceFromDaily(dp, durationId) {
  switch (durationId) {
    case '4h': return Math.round(dp * 0.6)
    case '6h': return Math.round(dp * 0.75)
    case '1d': return dp
    case '2d': return Math.round(dp * 2 * 0.95)
    case '3d': return Math.round(dp * 3 * 0.92)
    case '4d': return Math.round(dp * 4 * 0.90)
    case '5d': return Math.round(dp * 5 * 0.88)
    case '6d': return Math.round(dp * 6 * 0.86)
    case '1w': return Math.round(dp * 7 * 0.80)
    case '8d': return Math.round(dp * 8 * 0.80)
    case '9d': return Math.round(dp * 9 * 0.80)
    case '10d': return Math.round(dp * 10 * 0.80)
    case '2w': return Math.round(dp * 14 * 0.75)
    default: return dp
  }
}

function resolveIndexedPrice(productId, durationId, priceIndex, locationId) {
  if (!priceIndex) return null
  const baseKey = `${productId}:${durationId}`
  if (locationId) {
    const locKey = `${locationId}:${baseKey}`
    if (priceIndex.loc && Object.prototype.hasOwnProperty.call(priceIndex.loc, locKey)) {
      return priceIndex.loc[locKey]
    }
  }
  if (priceIndex.any && Object.prototype.hasOwnProperty.call(priceIndex.any, baseKey)) {
    return priceIndex.any[baseKey]
  }
  return null
}

function priceFor(product, durationId, priceIndex, locationId) {
  if (!product) return 0
  const indexed = resolveIndexedPrice(product.id, durationId, priceIndex, locationId)
  if (typeof indexed === 'number') return indexed
  const dp = product.daily_price || 0
  return derivedPriceFromDaily(dp, durationId)
}

export function buildPriceIndex(rows) {
  const idx = { any: {}, loc: {} }
  ;(rows || []).forEach(r => {
    const key = `${r.product_id}:${r.duration_id}`
    if (r.location_id) {
      idx.loc[`${r.location_id}:${key}`] = r.price_cents
    } else {
      idx.any[key] = r.price_cents
    }
  })
  return idx
}

export function computeTotals(basket, products, durationId, priceIndex = null, locationId = null, taxRate = 0.1) {
  if (!products || products.length === 0) return { subtotal: 0, tax: 0, total: 0 }

  let subtotal = 0
  for (const [variantId, qty] of Object.entries(basket || {})) {
    const { product } = getProductVariant(products, variantId)
    if (product) {
      const unit = priceFor(product, durationId, priceIndex, locationId)
      subtotal += unit * qty
    }
  }
  const tax = Math.round(subtotal * taxRate)
  const total = subtotal + tax
  return { subtotal, tax, total }
}

export function getLineItemPrice(variantId, products, durationId, priceIndex = null, locationId = null) {
  const { product } = getProductVariant(products, variantId)
  if (!product) return 0
  return priceFor(product, durationId, priceIndex, locationId)
}