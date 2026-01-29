/**
 * Zustand store for global application state.
 * 
 * Manages:
 * - Current cart configuration
 * - Available options and materials from API
 * - Pricing breakdown
 */

import { create } from 'zustand';
import {
  CartConfiguration,
  ConfigOption,
  Material,
  Platform,
  PricingBreakdown,
  OptionId,
  MaterialSelection
} from '@cart-configurator/types';
import {
  createConfiguration,
  addOption,
  removeOption,
  setMaterialSelection as setMaterialSelectionUtil,
  updateBuildNotes
} from '@cart-configurator/config';
import { calculatePricing } from '@cart-configurator/pricing';
import { validateOptionAddition, validateOptionRemoval } from '@cart-configurator/rules';

interface ConfiguratorState {
  // Catalog data
  platform: Platform | null;
  allOptions: ConfigOption[];
  allMaterials: Material[];

  // Current configuration
  configuration: CartConfiguration | null;
  pricing: PricingBreakdown | null;

  // Actions
  setPlatform: (platform: Platform) => void;
  setOptions: (options: ConfigOption[]) => void;
  setMaterials: (materials: Material[]) => void;
  initializeConfiguration: (platformId: string) => void;
  switchPlatform: (platform: Platform) => void;
  addOption: (optionId: OptionId) => boolean;
  removeOption: (optionId: OptionId) => boolean;
  setMaterialSelection: (selection: MaterialSelection) => void;
  updateBuildNotes: (notes: string) => void;
  loadConfiguration: (config: CartConfiguration) => void;
  recalculatePricing: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  platform: null,
  allOptions: [],
  allMaterials: [],
  configuration: null,
  pricing: null,

  setPlatform: (platform) => set({ platform }),

  setOptions: (options) => set({ allOptions: options }),

  setMaterials: (materials) => set({ allMaterials: materials }),

  initializeConfiguration: (platformId) => {
    const config = createConfiguration(platformId);
    set({ configuration: config });
    get().recalculatePricing();
  },

  switchPlatform: (platform) => {
    // Create new configuration for the new platform
    const config = createConfiguration(platform.id);
    set({ 
      platform, 
      configuration: config 
    });
    get().recalculatePricing();
  },

  addOption: (optionId) => {
    const { configuration, allOptions } = get();
    if (!configuration) return false;

    const option = allOptions.find(opt => opt.id === optionId);
    if (!option) return false;

    const validation = validateOptionAddition(configuration, option, allOptions);
    if (!validation.valid) {
      console.error('Cannot add option:', validation.errors);
      return false;
    }

    const updated = addOption(configuration, optionId);
    set({ configuration: updated });
    get().recalculatePricing();
    return true;
  },

  removeOption: (optionId) => {
    const { configuration, allOptions } = get();
    if (!configuration) return false;

    const validation = validateOptionRemoval(configuration, optionId, allOptions);
    if (!validation.valid) {
      console.error('Cannot remove option:', validation.errors);
      return false;
    }

    const updated = removeOption(configuration, optionId);
    set({ configuration: updated });
    get().recalculatePricing();
    return true;
  },

  setMaterialSelection: (selection) => {
    const { configuration } = get();
    if (!configuration) return;

    const updated = setMaterialSelectionUtil(configuration, selection);
    set({ configuration: updated });
    get().recalculatePricing();
  },

  updateBuildNotes: (notes) => {
    const { configuration } = get();
    if (!configuration) return;

    const updated = updateBuildNotes(configuration, notes);
    set({ configuration: updated });
  },

  loadConfiguration: (config) => {
    set({ configuration: config });
    get().recalculatePricing();
  },

  recalculatePricing: () => {
    const { configuration, platform, allOptions, allMaterials } = get();
    if (!configuration || !platform) return;

    const pricing = calculatePricing(configuration, platform, allOptions, allMaterials);
    set({ pricing });
  }
}));
