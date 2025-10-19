import PRODUCTS, { sizes as ALL_SIZES } from '../data/products'
import { generateSlotsForDate } from './time'

// Deterministic pseudo-reservations per product, size, and start window.
function seededAvailabilityRatio(productId, size, startMs) {
  let hash = 0
  const seedStr = productId + size + String(Math.floor(startMs / (30 * 60 * 1000))) // bucket by 30-min
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0
  }
  // map to [0, 0.7) so we never fully sell out all products always
  return (hash % 700) / 1000
}

function getSizeStock(product, locationId, size) {
  const loc = product.stockByLocation?.[locationId]
  if (!loc) return 0
  if (typeof loc === 'number') return loc // fallback if defined as a number
  return loc[size] ?? 0
}

export function getProductSizeAvailability(product, locationId, start, end, size) {
  const stock = getSizeStock(product, locationId, size)
  const ratio = seededAvailabilityRatio(product.id, size, start.getTime())
  const reserved = Math.min(stock, Math.floor(stock * ratio))
  const available = Math.max(0, stock - reserved)
  return { stock, reserved, available }
}

export function summarizeAvailability(products, locationId, start, end, categoryFilter = 'all', sizeFilter = 'all') {
  let total = 0
  for (const p of products) {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) continue
    const sizes = p.sizes || ALL_SIZES
    if (sizeFilter === 'all') {
      for (const s of sizes) {
        const { available } = getProductSizeAvailability(p, locationId, start, end, s)
        total += available
      }
    } else {
      if (!sizes.includes(sizeFilter)) continue
      const { available } = getProductSizeAvailability(p, locationId, start, end, sizeFilter)
      total += available
    }
  }
  return total
}

// includeZero: when true, include slots with zero availability (for greyed-out display)
// Default false preserves existing DateStep behavior.
export function getSlotsWithAvailability(
  date,
  location,
  durationId,
  categoryFilter = 'all',
  sizeFilter = 'all',
  minStartDateTime = null,
  includeZero = false
) {
  const slots = generateSlotsForDate(date, location, durationId, undefined, minStartDateTime)
  const annotated = slots.map(s => {
    const count = summarizeAvailability(PRODUCTS, location.id, s.start, s.end, categoryFilter, sizeFilter)
    return { ...s, available: count }
  })
  return includeZero ? annotated : annotated.filter(s => s.available > 0)
}