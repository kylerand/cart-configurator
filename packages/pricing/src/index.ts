/**
 * Pricing engine for cart configurations.
 * 
 * This package calculates itemized pricing based on:
 * - Base platform cost
 * - Selected options (parts + labor)
 * - Material selections
 * 
 * Architecture note: All functions are pure and deterministic.
 * Given the same inputs, they always produce the same output.
 * This enables reliable testing and ensures pricing consistency.
 */

import {
  CartConfiguration,
  ConfigOption,
  Material,
  Platform,
  PricingBreakdown,
  PriceLineItem,
  MaterialPriceLineItem,
  MaterialZone
} from '@cart-configurator/types';

/**
 * Standard labor rate in USD per hour.
 * This is configurable but centralized here for consistency.
 */
export const LABOR_RATE_PER_HOUR = 125;

/**
 * Base material costs per zone in USD.
 * These are multiplied by the material's priceMultiplier.
 */
const BASE_MATERIAL_COSTS: Record<MaterialZone, number> = {
  [MaterialZone.BODY]: 800,
  [MaterialZone.SEATS]: 400,
  [MaterialZone.ROOF]: 300,
  [MaterialZone.METAL]: 500,
  [MaterialZone.GLASS]: 200
};

/**
 * Calculates complete pricing breakdown for a configuration.
 * 
 * This is the primary pricing function. It:
 * 1. Starts with base platform price
 * 2. Adds itemized option costs (parts + labor)
 * 3. Adds material costs
 * 4. Computes totals
 * 
 * @param config - The cart configuration
 * @param platform - The base platform definition
 * @param allOptions - Complete option catalog
 * @param allMaterials - Complete material catalog
 * @returns Complete pricing breakdown
 */
export function calculatePricing(
  config: CartConfiguration,
  platform: Platform,
  allOptions: ConfigOption[],
  allMaterials: Material[]
): PricingBreakdown {
  // Calculate option line items
  const optionLineItems = config.selectedOptions
    .map(optionId => {
      const option = allOptions.find(opt => opt.id === optionId);
      if (!option) {
        return null;
      }
      return calculateOptionLineItem(option);
    })
    .filter((item): item is PriceLineItem => item !== null);

  // Calculate material line items
  const materialLineItems = config.materialSelections
    .map(selection => {
      const material = allMaterials.find(mat => mat.id === selection.materialId);
      if (!material) {
        return null;
      }
      return calculateMaterialLineItem(material);
    })
    .filter((item): item is MaterialPriceLineItem => item !== null);

  // Sum up costs
  const optionsCost = optionLineItems.reduce(
    (sum, item) => sum + item.partsCost,
    0
  );

  const laborCost = optionLineItems.reduce(
    (sum, item) => sum + item.laborCost,
    0
  );

  const materialsCost = materialLineItems.reduce(
    (sum, item) => sum + item.cost,
    0
  );

  const subtotal = platform.basePrice + optionsCost + materialsCost;
  const grandTotal = subtotal + laborCost;

  return {
    configurationId: config.id,
    basePlatformPrice: platform.basePrice,
    optionLineItems,
    materialLineItems,
    subtotal,
    laborTotal: laborCost,
    grandTotal
  };
}

/**
 * Calculates pricing for a single option.
 * 
 * @param option - The option to price
 * @returns Itemized line item
 */
export function calculateOptionLineItem(option: ConfigOption): PriceLineItem {
  const laborCost = option.laborHours * LABOR_RATE_PER_HOUR;
  const totalCost = option.partPrice + laborCost;

  return {
    optionId: option.id,
    optionName: option.name,
    category: option.category,
    partsCost: option.partPrice,
    laborCost,
    totalCost
  };
}

/**
 * Calculates pricing for a material selection.
 * 
 * @param material - The material definition
 * @returns Itemized material cost
 */
export function calculateMaterialLineItem(
  material: Material
): MaterialPriceLineItem {
  const baseCost = BASE_MATERIAL_COSTS[material.zone];
  const cost = baseCost * material.priceMultiplier;

  return {
    zone: material.zone,
    materialId: material.id,
    materialName: material.name,
    cost
  };
}

/**
 * Formats a price as USD currency string.
 * 
 * @param amount - Dollar amount
 * @returns Formatted string like "$1,234.56"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Calculates estimated delivery time in weeks based on options.
 * 
 * Uses total labor hours as a proxy for build complexity.
 * 
 * @param config - The cart configuration
 * @param allOptions - Complete option catalog
 * @returns Estimated weeks
 */
export function estimateDeliveryWeeks(
  config: CartConfiguration,
  allOptions: ConfigOption[]
): number {
  const totalLaborHours = config.selectedOptions.reduce((sum, optionId) => {
    const option = allOptions.find(opt => opt.id === optionId);
    return sum + (option?.laborHours || 0);
  }, 0);

  // Base build time: 4 weeks
  // Additional: 1 week per 40 labor hours
  const baseWeeks = 4;
  const additionalWeeks = Math.ceil(totalLaborHours / 40);

  return baseWeeks + additionalWeeks;
}
