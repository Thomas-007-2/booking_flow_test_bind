export const categories = [
  { id: 'standard', name: 'Standard Bike' },
  { id: 'mountain', name: 'Mountain Bike' },
  { id: 'ebike', name: 'E-Bike' },
  { id: 'tandem', name: 'Tandem' },
  { id: 'addon', name: 'Add-ons', hidden: true } // Hidden from main filters
]

export const sizes = ['S', 'M', 'L']

// Using verified Unsplash IDs per rules
const img = {
  tech: (w=800,h=600) => `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=${w}&h=${h}&fit=crop&q=80`,
  nature: (w=800,h=600) => `https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=${w}&h=${h}&fit=crop&q=80`,
  food: (w=800,h=600) => `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=${w}&h=${h}&fit=crop&q=80`,
  bag: (w=800,h=600) => `https://images.unsplash.com/photo-1566150905458-1bf1bc112f2d?w=${w}&h=${h}&fit=crop&q=80`,
  insurance: (w=800,h=600) => `https://images.unsplash.com/photo-1580820267682-426da823b514?w=${w}&h=${h}&fit=crop&q=80`
}

const PRODUCTS = [
  {
    id: 'std-1',
    title: 'Standard City Bike',
    category: 'standard',
    sizes,
    image: img.food(),
    description: 'Comfortable 7-speed city bike ideal for flat terrain and casual rides.',
    details: ['Aluminum frame', '7-speed', 'Rear rack', 'Kickstand'],
    dailyPrice: 25,
    stockByLocation: {
      'villach-city': { S: 3, M: 5, L: 2 }, // total 10
      'lake-faak': { S: 2, M: 4, L: 2 }     // total 8
    },
    recommendedAddons: ['addon-insurance', 'addon-bag']
  },
  {
    id: 'mtb-1',
    title: 'Hardtail Mountain Bike',
    category: 'mountain',
    sizes,
    image: img.nature(),
    description: 'Reliable hardtail with front suspension for trails around Lake Faak.',
    details: ['Front suspension', 'Hydraulic disc brakes', '29" wheels'],
    dailyPrice: 35,
    stockByLocation: {
      'villach-city': { S: 2, M: 3, L: 1 }, // total 6
      'lake-faak': { S: 3, M: 5, L: 2 }     // total 10
    },
    recommendedAddons: ['addon-insurance']
  },
  {
    id: 'eb-1',
    title: 'E-Bike Trekker',
    category: 'ebike',
    sizes,
    image: img.tech(),
    description: 'Pedal-assist e-bike with up to 80km range for long scenic routes.',
    details: ['Mid-drive motor', 'Hydraulic disc brakes', 'Integrated lights'],
    dailyPrice: 55,
    stockByLocation: {
      'villach-city': { S: 2, M: 2, L: 2 }, // total 6
      'lake-faak': { S: 2, M: 2, L: 2 }     // total 6
    },
    recommendedAddons: ['addon-insurance', 'addon-bag']
  },
  {
    id: 'tan-1',
    title: 'Tandem Adventure',
    category: 'tandem',
    sizes,
    image: img.nature(800,600),
    description: 'Two riders one bike—perfect for an unforgettable ride by the lake.',
    details: ['Shimano drivetrain', 'Dual saddles', 'Extra stable frame'],
    dailyPrice: 60,
    stockByLocation: {
      'villach-city': { S: 0, M: 2, L: 0 }, // total 2 (primarily M)
      'lake-faak': { S: 0, M: 3, L: 0 }     // total 3
    },
    recommendedAddons: ['addon-insurance']
  },
  // Add-on products
  {
    id: 'addon-insurance',
    title: 'Rental Insurance',
    category: 'addon',
    image: img.insurance(),
    description: 'Covers accidental damage and theft with a low deductible.',
    details: ['Theft protection', 'Accidental damage coverage', '24/7 support'],
    dailyPrice: 5,
    stockByLocation: {
      'villach-city': 100,
      'lake-faak': 100
    }
  },
  {
    id: 'addon-bag',
    title: 'Handlebar Bag',
    category: 'addon',
    image: img.bag(),
    description: 'Convenient waterproof bag for your essentials.',
    details: ['5L capacity', 'Waterproof material', 'Easy to attach/detach'],
    dailyPrice: 3,
    stockByLocation: {
      'villach-city': 20,
      'lake-faak': 20
    }
  }
]

export default PRODUCTS