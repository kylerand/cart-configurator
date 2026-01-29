/**
 * Configuration management utilities.
 * 
 * This package provides functions for creating, validating, and manipulating
 * cart configurations. It ensures configurations remain consistent and valid.
 */

import {
  CartConfiguration,
  ConfigurationId,
  PlatformId,
  OptionId,
  MaterialSelection,
  MaterialZone
} from '@cart-configurator/types';

/**
 * Creates a new cart configuration with default values.
 * 
 * @param platformId - The base platform for this configuration
 * @returns A new, empty configuration
 */
export function createConfiguration(platformId: PlatformId): CartConfiguration {
  const now = new Date();
  
  return {
    id: generateConfigurationId(),
    platformId,
    selectedOptions: [],
    materialSelections: [],
    buildNotes: '',
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Adds an option to a configuration.
 * Returns a new configuration object (immutable update).
 * 
 * @param config - The current configuration
 * @param optionId - The option to add
 * @returns Updated configuration
 */
export function addOption(
  config: CartConfiguration,
  optionId: OptionId
): CartConfiguration {
  if (config.selectedOptions.includes(optionId)) {
    return config;
  }

  return {
    ...config,
    selectedOptions: [...config.selectedOptions, optionId],
    updatedAt: new Date()
  };
}

/**
 * Removes an option from a configuration.
 * Returns a new configuration object (immutable update).
 * 
 * @param config - The current configuration
 * @param optionId - The option to remove
 * @returns Updated configuration
 */
export function removeOption(
  config: CartConfiguration,
  optionId: OptionId
): CartConfiguration {
  return {
    ...config,
    selectedOptions: config.selectedOptions.filter(id => id !== optionId),
    updatedAt: new Date()
  };
}

/**
 * Sets a material selection for a zone.
 * Replaces any existing selection for that zone.
 * 
 * @param config - The current configuration
 * @param selection - The material selection to apply
 * @returns Updated configuration
 */
export function setMaterialSelection(
  config: CartConfiguration,
  selection: MaterialSelection
): CartConfiguration {
  const filtered = config.materialSelections.filter(
    s => s.zone !== selection.zone
  );

  return {
    ...config,
    materialSelections: [...filtered, selection],
    updatedAt: new Date()
  };
}

/**
 * Gets the material selection for a specific zone.
 * 
 * @param config - The configuration to query
 * @param zone - The material zone
 * @returns The material selection or undefined
 */
export function getMaterialSelection(
  config: CartConfiguration,
  zone: MaterialZone
): MaterialSelection | undefined {
  return config.materialSelections.find(s => s.zone === zone);
}

/**
 * Updates build notes on a configuration.
 * 
 * @param config - The current configuration
 * @param notes - The new build notes
 * @returns Updated configuration
 */
export function updateBuildNotes(
  config: CartConfiguration,
  notes: string
): CartConfiguration {
  return {
    ...config,
    buildNotes: notes,
    updatedAt: new Date()
  };
}

/**
 * Generates a unique configuration ID.
 * Uses timestamp + random suffix for uniqueness.
 */
function generateConfigurationId(): ConfigurationId {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `config-${timestamp}-${random}`;
}

/**
 * Serializes a configuration to JSON string.
 * Handles Date serialization.
 * 
 * @param config - The configuration to serialize
 * @returns JSON string
 */
export function serializeConfiguration(config: CartConfiguration): string {
  return JSON.stringify(config);
}

/**
 * Deserializes a configuration from JSON string.
 * Reconstructs Date objects.
 * 
 * @param json - The JSON string
 * @returns Parsed configuration
 */
export function deserializeConfiguration(json: string): CartConfiguration {
  const parsed = JSON.parse(json);
  
  return {
    ...parsed,
    createdAt: new Date(parsed.createdAt),
    updatedAt: new Date(parsed.updatedAt)
  };
}
