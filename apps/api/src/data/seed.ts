/**
 * Seed data for platforms, options, and materials.
 * 
 * This data serves as the product catalog for the configurator.
 * In production, this would likely come from a CMS or admin interface.
 */

import {
  Platform,
  ConfigOption,
  Material,
  OptionCategory,
  MaterialZone,
  MaterialType,
  MaterialFinish
} from '@cart-configurator/types';

/**
 * Base platform definition.
 */
export const PLATFORM: Platform = {
  id: 'standard-cart-v1',
  name: 'Standard Golf Cart',
  description: 'Our classic 4-passenger golf cart platform with electric drive',
  basePrice: 8500,
  defaultAssetPath: '/models/platform-standard.glb'
};

/**
 * Available configuration options.
 */
export const OPTIONS: ConfigOption[] = [
  // Seating
  {
    id: 'seat-standard',
    category: OptionCategory.SEATING,
    name: 'Standard Bench Seats',
    description: '4-passenger bench seating with basic padding',
    partPrice: 0,
    laborHours: 0,
    requires: [],
    excludes: ['seat-captain', 'seat-premium'],
    assetPath: '/models/seats-standard.glb'
  },
  {
    id: 'seat-captain',
    category: OptionCategory.SEATING,
    name: 'Captain Seats',
    description: 'Individual bucket seats with armrests',
    partPrice: 1200,
    laborHours: 4,
    requires: [],
    excludes: ['seat-standard', 'seat-premium'],
    assetPath: '/models/seats-captain.glb'
  },
  {
    id: 'seat-premium',
    category: OptionCategory.SEATING,
    name: 'Premium Suspension Seats',
    description: 'High-back seats with lumbar support and suspension',
    partPrice: 2400,
    laborHours: 6,
    requires: [],
    excludes: ['seat-standard', 'seat-captain'],
    assetPath: '/models/seats-premium.glb'
  },

  // Roof
  {
    id: 'roof-standard',
    category: OptionCategory.ROOF,
    name: 'Standard Roof',
    description: 'Basic hard top roof',
    partPrice: 0,
    laborHours: 0,
    requires: [],
    excludes: ['roof-extended', 'roof-solar'],
    assetPath: '/models/roof-standard.glb'
  },
  {
    id: 'roof-extended',
    category: OptionCategory.ROOF,
    name: 'Extended Roof',
    description: 'Extended roof with rear overhang',
    partPrice: 800,
    laborHours: 3,
    requires: [],
    excludes: ['roof-standard', 'roof-solar'],
    assetPath: '/models/roof-extended.glb'
  },
  {
    id: 'roof-solar',
    category: OptionCategory.ROOF,
    name: 'Solar Panel Roof',
    description: 'Integrated solar panels for battery charging',
    partPrice: 3500,
    laborHours: 8,
    requires: [],
    excludes: ['roof-standard', 'roof-extended'],
    assetPath: '/models/roof-solar.glb'
  },

  // Wheels
  {
    id: 'wheels-standard',
    category: OptionCategory.WHEELS,
    name: 'Standard Wheels',
    description: '12" steel wheels with all-terrain tires',
    partPrice: 0,
    laborHours: 0,
    requires: [],
    excludes: ['wheels-chrome', 'wheels-offroad'],
    assetPath: '/models/wheels-standard.glb'
  },
  {
    id: 'wheels-chrome',
    category: OptionCategory.WHEELS,
    name: 'Chrome Wheels',
    description: '14" chrome wheels with low-profile tires',
    partPrice: 1600,
    laborHours: 2,
    requires: [],
    excludes: ['wheels-standard', 'wheels-offroad'],
    assetPath: '/models/wheels-chrome.glb'
  },
  {
    id: 'wheels-offroad',
    category: OptionCategory.WHEELS,
    name: 'Off-Road Wheels',
    description: '14" matte black wheels with aggressive tread',
    partPrice: 2000,
    laborHours: 2,
    requires: [],
    excludes: ['wheels-standard', 'wheels-chrome'],
    assetPath: '/models/wheels-offroad.glb'
  },

  // Lighting
  {
    id: 'light-basic',
    category: OptionCategory.LIGHTING,
    name: 'Basic Lighting',
    description: 'Headlights and taillights',
    partPrice: 0,
    laborHours: 0,
    requires: [],
    excludes: ['light-premium'],
    assetPath: '/models/lights-basic.glb'
  },
  {
    id: 'light-premium',
    category: OptionCategory.LIGHTING,
    name: 'Premium LED Package',
    description: 'LED headlights, taillights, underbody lighting',
    partPrice: 1800,
    laborHours: 6,
    requires: [],
    excludes: ['light-basic'],
    assetPath: '/models/lights-premium.glb'
  },
  {
    id: 'light-bar',
    category: OptionCategory.LIGHTING,
    name: 'Roof Light Bar',
    description: '40" LED light bar mounted to roof',
    partPrice: 600,
    laborHours: 3,
    requires: [],
    excludes: [],
    assetPath: '/models/light-bar.glb'
  },

  // Storage
  {
    id: 'storage-rear-basket',
    category: OptionCategory.STORAGE,
    name: 'Rear Basket',
    description: 'Folding rear cargo basket',
    partPrice: 400,
    laborHours: 2,
    requires: [],
    excludes: [],
    assetPath: '/models/storage-basket.glb'
  },
  {
    id: 'storage-under-seat',
    category: OptionCategory.STORAGE,
    name: 'Under-Seat Storage',
    description: 'Lockable storage compartments under seats',
    partPrice: 300,
    laborHours: 4,
    requires: [],
    excludes: [],
    assetPath: '/models/storage-under-seat.glb'
  },

  // Electronics
  {
    id: 'audio-basic',
    category: OptionCategory.ELECTRONICS,
    name: 'Basic Audio',
    description: 'Bluetooth speaker system',
    partPrice: 500,
    laborHours: 3,
    requires: [],
    excludes: ['audio-premium'],
    assetPath: '/models/audio-basic.glb'
  },
  {
    id: 'audio-premium',
    category: OptionCategory.ELECTRONICS,
    name: 'Premium Audio',
    description: '1000W system with subwoofer and amplifier',
    partPrice: 2500,
    laborHours: 8,
    requires: [],
    excludes: ['audio-basic'],
    assetPath: '/models/audio-premium.glb'
  },
  {
    id: 'electronics-usb',
    category: OptionCategory.ELECTRONICS,
    name: 'USB Charging Ports',
    description: '4x USB-C charging ports',
    partPrice: 200,
    laborHours: 2,
    requires: [],
    excludes: [],
    assetPath: '/models/usb-ports.glb'
  },

  // Suspension
  {
    id: 'suspension-lift-3',
    category: OptionCategory.SUSPENSION,
    name: '3" Lift Kit',
    description: '3-inch suspension lift',
    partPrice: 1200,
    laborHours: 6,
    requires: [],
    excludes: ['suspension-lift-6'],
    assetPath: '/models/suspension-lift-3.glb'
  },
  {
    id: 'suspension-lift-6',
    category: OptionCategory.SUSPENSION,
    name: '6" Lift Kit',
    description: '6-inch suspension lift for extreme off-road',
    partPrice: 2400,
    laborHours: 10,
    requires: ['wheels-offroad'],
    excludes: ['suspension-lift-3'],
    assetPath: '/models/suspension-lift-6.glb'
  },

  // Custom Fabrication
  {
    id: 'fab-custom-bumper',
    category: OptionCategory.FABRICATION,
    name: 'Custom Front Bumper',
    description: 'Heavy-duty steel front bumper with winch mount',
    partPrice: 800,
    laborHours: 12,
    requires: [],
    excludes: [],
    assetPath: '/models/bumper-custom.glb'
  },
  {
    id: 'fab-bed-liner',
    category: OptionCategory.FABRICATION,
    name: 'Spray-In Bed Liner',
    description: 'Professional spray-in protective bed liner',
    partPrice: 600,
    laborHours: 8,
    requires: [],
    excludes: [],
    assetPath: '/models/bed-liner.glb'
  }
];

/**
 * Available materials for customization.
 */
export const MATERIALS: Material[] = [
  // Body Paint
  {
    id: 'paint-white-gloss',
    zone: MaterialZone.BODY,
    type: MaterialType.PAINT,
    name: 'Gloss White',
    description: 'Classic gloss white automotive paint',
    color: '#FFFFFF',
    finish: MaterialFinish.GLOSS,
    priceMultiplier: 1.0
  },
  {
    id: 'paint-black-matte',
    zone: MaterialZone.BODY,
    type: MaterialType.PAINT,
    name: 'Matte Black',
    description: 'Stealthy matte black finish',
    color: '#1a1a1a',
    finish: MaterialFinish.MATTE,
    priceMultiplier: 1.3
  },
  {
    id: 'paint-red-metallic',
    zone: MaterialZone.BODY,
    type: MaterialType.PAINT,
    name: 'Metallic Red',
    description: 'Deep metallic red with pearl effect',
    color: '#c41e3a',
    finish: MaterialFinish.METALLIC,
    priceMultiplier: 1.5
  },
  {
    id: 'paint-blue-gloss',
    zone: MaterialZone.BODY,
    type: MaterialType.PAINT,
    name: 'Ocean Blue',
    description: 'Vibrant gloss blue',
    color: '#0077be',
    finish: MaterialFinish.GLOSS,
    priceMultiplier: 1.2
  },

  // Seat Materials
  {
    id: 'vinyl-black',
    zone: MaterialZone.SEATS,
    type: MaterialType.VINYL,
    name: 'Black Vinyl',
    description: 'Durable black vinyl upholstery',
    color: '#2b2b2b',
    finish: MaterialFinish.MATTE,
    priceMultiplier: 1.0
  },
  {
    id: 'vinyl-tan',
    zone: MaterialZone.SEATS,
    type: MaterialType.VINYL,
    name: 'Tan Vinyl',
    description: 'Classic tan vinyl upholstery',
    color: '#d2b48c',
    finish: MaterialFinish.MATTE,
    priceMultiplier: 1.0
  },
  {
    id: 'fabric-gray',
    zone: MaterialZone.SEATS,
    type: MaterialType.FABRIC,
    name: 'Gray Performance Fabric',
    description: 'Weather-resistant performance fabric',
    color: '#808080',
    finish: MaterialFinish.MATTE,
    priceMultiplier: 1.4
  },

  // Roof Materials
  {
    id: 'roof-black',
    zone: MaterialZone.ROOF,
    type: MaterialType.PAINT,
    name: 'Black Roof',
    description: 'Black painted roof',
    color: '#1a1a1a',
    finish: MaterialFinish.GLOSS,
    priceMultiplier: 1.0
  },
  {
    id: 'roof-body-match',
    zone: MaterialZone.ROOF,
    type: MaterialType.PAINT,
    name: 'Body-Matched Roof',
    description: 'Roof painted to match body color',
    color: '#FFFFFF',
    finish: MaterialFinish.GLOSS,
    priceMultiplier: 1.3
  },

  // Metal Accents
  {
    id: 'metal-chrome',
    zone: MaterialZone.METAL,
    type: MaterialType.POWDERCOAT,
    name: 'Chrome',
    description: 'Polished chrome finish',
    color: '#e5e5e5',
    finish: MaterialFinish.GLOSS,
    priceMultiplier: 1.5
  },
  {
    id: 'metal-black',
    zone: MaterialZone.METAL,
    type: MaterialType.POWDERCOAT,
    name: 'Black Powdercoat',
    description: 'Durable black powdercoat',
    color: '#1a1a1a',
    finish: MaterialFinish.MATTE,
    priceMultiplier: 1.0
  },

  // Glass Tint
  {
    id: 'glass-clear',
    zone: MaterialZone.GLASS,
    type: MaterialType.TINT,
    name: 'Clear Glass',
    description: 'No tint',
    color: '#f0f0f0',
    finish: MaterialFinish.GLOSS,
    priceMultiplier: 1.0
  },
  {
    id: 'glass-tint-light',
    zone: MaterialZone.GLASS,
    type: MaterialType.TINT,
    name: 'Light Tint',
    description: '35% light transmission',
    color: '#808080',
    finish: MaterialFinish.GLOSS,
    priceMultiplier: 1.2
  },
  {
    id: 'glass-tint-dark',
    zone: MaterialZone.GLASS,
    type: MaterialType.TINT,
    name: 'Dark Tint',
    description: '20% light transmission',
    color: '#404040',
    finish: MaterialFinish.GLOSS,
    priceMultiplier: 1.4
  }
];
