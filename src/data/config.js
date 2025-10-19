export const merchantConfig = {
  id: 'demo-bike-rental',
  name: 'Alpine Bike Adventures',
  cancel_hours: 24,
  cancel_refund_percent: 100,
  notes_checkout: true,
  terms_url: 'https://example.com/terms',
  // Tax configuration
  tax_rate: 0.20, // 20% tax rate
  tax_included: false, // false = tax added to prices, true = tax included in prices
  tax_label: 'VAT' // Label for tax display
}

export const locations = [
  {
    id: 'salzburg-main',
    name: 'Salzburg Main Station',
    address: 'Südtiroler Platz 1, 5020 Salzburg',
    open_time: '08:00',
    close_time: '18:00'
  },
  {
    id: 'hallstatt-center', 
    name: 'Hallstatt Village Center',
    address: 'Seestraße 169, 4830 Hallstatt',
    open_time: '09:00',
    close_time: '17:00'
  },
  {
    id: 'vienna-central',
    name: 'Vienna Central Station',
    address: 'Am Hauptbahnhof 1, 1100 Vienna',
    open_time: '07:00',
    close_time: '19:00'
  }
]

export const durations = [
  { id: '4h', label: '4 hours', hours: 4 },
  { id: '6h', label: '6 hours', hours: 6 },
  { id: '1d', label: '1 day', hours: 24 },
  { id: '2d', label: '2 days', hours: 48 },
  { id: '3d', label: '3 days', hours: 72 },
  { id: '4d', label: '4 days', hours: 96 },
  { id: '5d', label: '5 days', hours: 120 },
  { id: '6d', label: '6 days', hours: 144 },
  { id: '1w', label: '1 week', hours: 168 },
  { id: '8d', label: '8 days', hours: 192 },
  { id: '9d', label: '9 days', hours: 216 },
  { id: '10d', label: '10 days', hours: 240 },
  { id: '2w', label: '2 weeks', hours: 336 }
]

export const categories = [
  { id: 'bikes', name: 'Bikes', is_addon: false, is_hidden: false },
  { id: 'accessories', name: 'Accessories', is_addon: true, is_hidden: false }
]

export const products = [
  {
    id: 'city-bike',
    title: 'City Comfort Bike',
    description: 'Perfect for leisurely city tours and comfortable rides on paved paths.',
    details: ['7-speed gear system', 'Comfortable upright position', 'Built-in lights', 'Basket included'],
    category_id: 'bikes',
    daily_price: 2500, // 25.00 € (in cents)
    image_url: 'https://images.unsplash.com/photo-1544191696-15693072d17b?w=400&h=300&fit=crop&q=80',
    product_variants: [
      { id: 'city-s-salzburg', location_id: 'salzburg-main', size: 'S' },
      { id: 'city-m-salzburg', location_id: 'salzburg-main', size: 'M' },
      { id: 'city-l-salzburg', location_id: 'salzburg-main', size: 'L' },
      { id: 'city-s-hallstatt', location_id: 'hallstatt-center', size: 'S' },
      { id: 'city-m-hallstatt', location_id: 'hallstatt-center', size: 'M' },
      { id: 'city-l-hallstatt', location_id: 'hallstatt-center', size: 'L' },
      { id: 'city-s-vienna', location_id: 'vienna-central', size: 'S' },
      { id: 'city-m-vienna', location_id: 'vienna-central', size: 'M' },
      { id: 'city-l-vienna', location_id: 'vienna-central', size: 'L' }
    ]
  },
  {
    id: 'mountain-bike',
    title: 'Mountain Explorer',
    description: 'Rugged mountain bike designed for off-road adventures and challenging trails.',
    details: ['21-speed gear system', 'Front suspension', 'All-terrain tires', 'Water bottle holder'],
    category_id: 'bikes',
    daily_price: 3500, // 35.00 € (in cents)
    image_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&q=80',
    product_variants: [
      { id: 'mountain-s-salzburg', location_id: 'salzburg-main', size: 'S' },
      { id: 'mountain-m-salzburg', location_id: 'salzburg-main', size: 'M' },
      { id: 'mountain-l-salzburg', location_id: 'salzburg-main', size: 'L' },
      { id: 'mountain-s-hallstatt', location_id: 'hallstatt-center', size: 'S' },
      { id: 'mountain-m-hallstatt', location_id: 'hallstatt-center', size: 'M' },
      { id: 'mountain-l-hallstatt', location_id: 'hallstatt-center', size: 'L' },
      { id: 'mountain-s-vienna', location_id: 'vienna-central', size: 'S' },
      { id: 'mountain-m-vienna', location_id: 'vienna-central', size: 'M' },
      { id: 'mountain-l-vienna', location_id: 'vienna-central', size: 'L' }
    ]
  },
  {
    id: 'ebike',
    title: 'Electric City Bike',
    description: 'Effortlessly cruise through the city with electric assistance.',
    details: ['Electric motor assistance', 'Up to 80km range', '5 assistance levels', 'Removable battery'],
    category_id: 'bikes',
    daily_price: 4500, // 45.00 € (in cents)
    image_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&q=80',
    product_variants: [
      { id: 'ebike-s-salzburg', location_id: 'salzburg-main', size: 'S' },
      { id: 'ebike-m-salzburg', location_id: 'salzburg-main', size: 'M' },
      { id: 'ebike-l-salzburg', location_id: 'salzburg-main', size: 'L' },
      { id: 'ebike-s-hallstatt', location_id: 'hallstatt-center', size: 'S' },
      { id: 'ebike-m-hallstatt', location_id: 'hallstatt-center', size: 'M' },
      { id: 'ebike-l-hallstatt', location_id: 'hallstatt-center', size: 'L' },
      { id: 'ebike-s-vienna', location_id: 'vienna-central', size: 'S' },
      { id: 'ebike-m-vienna', location_id: 'vienna-central', size: 'M' },
      { id: 'ebike-l-vienna', location_id: 'vienna-central', size: 'L' }
    ]
  },
  {
    id: 'helmet',
    title: 'Safety Helmet',
    description: 'Lightweight, comfortable helmet for safe cycling.',
    details: ['CE certified', 'Adjustable fit', 'Ventilation system', 'Multiple colors available'],
    category_id: 'accessories',
    daily_price: 500, // 5.00 € (in cents)
    image_url: 'https://images.unsplash.com/photo-1558618854-a2fe720d6c1d?w=400&h=300&fit=crop&q=80',
    product_variants: [
      { id: 'helmet-std-salzburg', location_id: 'salzburg-main', size: 'std' },
      { id: 'helmet-std-hallstatt', location_id: 'hallstatt-center', size: 'std' },
      { id: 'helmet-std-vienna', location_id: 'vienna-central', size: 'std' }
    ]
  },
  {
    id: 'lock',
    title: 'Security Lock',
    description: 'Heavy-duty chain lock for securing your bike.',
    details: ['Hardened steel chain', 'Weather resistant', 'Key included', '120cm length'],
    category_id: 'accessories',
    daily_price: 300, // 3.00 € (in cents)
    image_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&q=80',
    product_variants: [
      { id: 'lock-std-salzburg', location_id: 'salzburg-main', size: 'std' },
      { id: 'lock-std-hallstatt', location_id: 'hallstatt-center', size: 'std' },
      { id: 'lock-std-vienna', location_id: 'vienna-central', size: 'std' }
    ]
  },
  {
    id: 'child-seat',
    title: 'Child Seat',
    description: 'Safe and comfortable rear-mounted child seat.',
    details: ['For children 9-22kg', 'Adjustable footrests', 'Safety harness', 'Quick release mounting'],
    category_id: 'accessories',
    daily_price: 800, // 8.00 € (in cents)
    image_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&q=80',
    product_variants: [
      { id: 'child-seat-std-salzburg', location_id: 'salzburg-main', size: 'std' },
      { id: 'child-seat-std-hallstatt', location_id: 'hallstatt-center', size: 'std' },
      { id: 'child-seat-std-vienna', location_id: 'vienna-central', size: 'std' }
    ]
  }
]

// Mock availability data - in a real app, this would come from an API
export const mockAvailability = {
  'city-s-salzburg': 3,
  'city-m-salzburg': 5,
  'city-l-salzburg': 2,
  'city-s-hallstatt': 4,
  'city-m-hallstatt': 6,
  'city-l-hallstatt': 3,
  'city-s-vienna': 2,
  'city-m-vienna': 4,
  'city-l-vienna': 1,
  'mountain-s-salzburg': 2,
  'mountain-m-salzburg': 4,
  'mountain-l-salzburg': 3,
  'mountain-s-hallstatt': 3,
  'mountain-m-hallstatt': 2,
  'mountain-l-hallstatt': 4,
  'mountain-s-vienna': 1,
  'mountain-m-vienna': 3,
  'mountain-l-vienna': 2,
  'ebike-s-salzburg': 1,
  'ebike-m-salzburg': 2,
  'ebike-l-salzburg': 1,
  'ebike-s-hallstatt': 2,
  'ebike-m-hallstatt': 1,
  'ebike-l-hallstatt': 2,
  'ebike-s-vienna': 1,
  'ebike-m-vienna': 1,
  'ebike-l-vienna': 0,
  'helmet-std-salzburg': 15,
  'helmet-std-hallstatt': 12,
  'helmet-std-vienna': 10,
  'lock-std-salzburg': 20,
  'lock-std-hallstatt': 15,
  'lock-std-vienna': 18,
  'child-seat-std-salzburg': 5,
  'child-seat-std-hallstatt': 3,
  'child-seat-std-vienna': 4
}

// Mock price index for specific location/duration combinations
export const mockPriceIndex = {
  loc: {
    // Location-specific pricing overrides
    'hallstatt-center:mountain-bike:1d': 4000, // Mountain bikes cost more in Hallstatt
    'vienna-central:ebike:1d': 4200, // E-bikes slightly more expensive in Vienna
  },
  any: {
    // General pricing overrides for specific duration combinations
    'helmet:1w': 2500, // Weekly helmet rental discount
    'lock:2w': 4000, // Two-week lock rental discount
  }
}