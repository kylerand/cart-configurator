/**
 * Rules engine for validating configuration constraints.
 * 
 * This package enforces option dependencies (requires/excludes) and ensures
 * configurations remain valid throughout the customization process.
 * 
 * Architecture note: This is a pure, deterministic system. Given the same
 * configuration and option catalog, it always produces the same validation result.
 */

import {
  CartConfiguration,
  ConfigOption,
  OptionId,
  ValidationResult
} from '@cart-configurator/types';

/**
 * Validates whether adding an option would violate constraints.
 * 
 * Checks:
 * 1. Required dependencies are already selected
 * 2. No excluded options are currently selected
 * 
 * @param config - Current configuration
 * @param option - Option to validate
 * @param allOptions - Complete option catalog
 * @returns Validation result with specific error messages
 */
export function validateOptionAddition(
  config: CartConfiguration,
  option: ConfigOption,
  allOptions: ConfigOption[]
): ValidationResult {
  const errors: string[] = [];

  // Check if option is already selected
  if (config.selectedOptions.includes(option.id)) {
    errors.push(`Option "${option.name}" is already selected`);
    return { valid: false, errors };
  }

  // Check required dependencies
  for (const requiredId of option.requires) {
    if (!config.selectedOptions.includes(requiredId)) {
      const requiredOption = allOptions.find(opt => opt.id === requiredId);
      const requiredName = requiredOption?.name || requiredId;
      errors.push(
        `Option "${option.name}" requires "${requiredName}" to be selected first`
      );
    }
  }

  // Check exclusions
  for (const excludedId of option.excludes) {
    if (config.selectedOptions.includes(excludedId)) {
      const excludedOption = allOptions.find(opt => opt.id === excludedId);
      const excludedName = excludedOption?.name || excludedId;
      errors.push(
        `Option "${option.name}" cannot be combined with "${excludedName}"`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates whether removing an option would break dependencies.
 * 
 * Checks if any currently selected options require the option being removed.
 * 
 * @param config - Current configuration
 * @param optionId - Option to remove
 * @param allOptions - Complete option catalog
 * @returns Validation result with dependent options listed
 */
export function validateOptionRemoval(
  config: CartConfiguration,
  optionId: OptionId,
  allOptions: ConfigOption[]
): ValidationResult {
  const errors: string[] = [];

  // Find options that depend on the one being removed
  const dependentOptions = config.selectedOptions
    .map(id => allOptions.find(opt => opt.id === id))
    .filter((opt): opt is ConfigOption => opt !== undefined)
    .filter(opt => opt.requires.includes(optionId));

  if (dependentOptions.length > 0) {
    const optionBeingRemoved = allOptions.find(opt => opt.id === optionId);
    const removedName = optionBeingRemoved?.name || optionId;
    
    for (const dependent of dependentOptions) {
      errors.push(
        `Cannot remove "${removedName}" because "${dependent.name}" depends on it`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates an entire configuration for consistency.
 * 
 * Ensures all selected options have their dependencies met and
 * no conflicting options are selected together.
 * 
 * @param config - Configuration to validate
 * @param allOptions - Complete option catalog
 * @returns Validation result with all errors
 */
export function validateConfiguration(
  config: CartConfiguration,
  allOptions: ConfigOption[]
): ValidationResult {
  const errors: string[] = [];

  for (const selectedId of config.selectedOptions) {
    const option = allOptions.find(opt => opt.id === selectedId);
    
    if (!option) {
      errors.push(`Unknown option ID: ${selectedId}`);
      continue;
    }

    // Check requirements
    for (const requiredId of option.requires) {
      if (!config.selectedOptions.includes(requiredId)) {
        const requiredOption = allOptions.find(opt => opt.id === requiredId);
        const requiredName = requiredOption?.name || requiredId;
        errors.push(
          `Option "${option.name}" requires "${requiredName}" but it is not selected`
        );
      }
    }

    // Check exclusions
    for (const excludedId of option.excludes) {
      if (config.selectedOptions.includes(excludedId)) {
        const excludedOption = allOptions.find(opt => opt.id === excludedId);
        const excludedName = excludedOption?.name || excludedId;
        errors.push(
          `Option "${option.name}" conflicts with "${excludedName}"`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Gets all options that can be legally added to the current configuration.
 * 
 * Filters out options that:
 * - Are already selected
 * - Have unmet dependencies
 * - Conflict with selected options
 * 
 * @param config - Current configuration
 * @param allOptions - Complete option catalog
 * @returns List of valid options
 */
export function getAvailableOptions(
  config: CartConfiguration,
  allOptions: ConfigOption[]
): ConfigOption[] {
  return allOptions.filter(option => {
    const validation = validateOptionAddition(config, option, allOptions);
    return validation.valid;
  });
}
