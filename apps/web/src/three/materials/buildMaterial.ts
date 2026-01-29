/**
 * Material Builder
 * 
 * Deterministic Three.js material construction from presets and colors.
 * This is the single path for creating all materials in the application.
 * 
 * Architecture:
 * - Accepts preset + color → returns Three.js Material
 * - All PBR properties come from preset definitions
 * - Color is applied while preserving physical properties
 * - No magic values or inline material creation
 * 
 * Performance note: Materials created here should be cached by materialCache
 * to prevent per-frame allocation and GPU memory bloat.
 */

import * as THREE from 'three';
import { MaterialPreset, MaterialPresetId, getPreset } from './materialPresets';

/**
 * Material build configuration.
 * Combines preset properties with user selections.
 */
export interface MaterialBuildConfig {
  /**
   * Material preset defining physical properties.
   */
  preset: MaterialPreset;
  
  /**
   * Base color (user-selected, hex format).
   */
  color: string;
  
  /**
   * Optional opacity override (0-1).
   * Used for transparent materials or fade effects.
   */
  opacity?: number;
  
  /**
   * Optional color space override.
   * Defaults to SRGBColorSpace for accurate color display.
   */
  colorSpace?: THREE.ColorSpace;
  
  /**
   * Enable/disable shadows for this material.
   * Default: true
   */
  castShadow?: boolean;
  
  /**
   * Enable/disable receiving shadows.
   * Default: true
   */
  receiveShadow?: boolean;
}

/**
 * Material build result with metadata.
 */
export interface BuiltMaterial {
  /**
   * Ready-to-use Three.js material.
   */
  material: THREE.Material;
  
  /**
   * Preset used to build this material.
   */
  preset: MaterialPreset;
  
  /**
   * Applied color.
   */
  color: THREE.Color;
  
  /**
   * GPU memory cost estimate (bytes).
   * Used for memory management and debugging.
   */
  estimatedMemoryCost: number;
}

/**
 * Performance constants for material system.
 */
export const MATERIAL_PERFORMANCE = {
  /**
   * Estimated base memory cost per material (bytes).
   * Includes uniforms, state, and GPU resources.
   */
  BASE_MATERIAL_COST: 1024,
  
  /**
   * Additional cost per texture (bytes).
   * Placeholder for when textures are added.
   */
  TEXTURE_COST: 2048,
  
  /**
   * Maximum recommended material instances.
   * Above this, consider instancing or batching.
   */
  MAX_MATERIAL_INSTANCES: 100,
  
  /**
   * Warning threshold for material count.
   */
  WARNING_THRESHOLD: 50,
} as const;

/**
 * Builds a Three.js material from a preset and color.
 * 
 * This is the primary material construction function. All materials
 * should flow through this builder to ensure consistency and correctness.
 * 
 * Architecture note: This function is pure - same inputs always produce
 * equivalent materials. Caching should happen at a higher level.
 * 
 * @param config - Material build configuration
 * @returns Built material with metadata
 */
export function buildMaterial(config: MaterialBuildConfig): BuiltMaterial {
  const { preset, color: colorHex, opacity = 1.0 } = config;
  
  // Parse color
  const color = new THREE.Color(colorHex);
  
  // Build material based on preset properties
  const material = createMaterialFromPreset(preset, color, opacity);
  
  // Calculate memory cost
  const estimatedMemoryCost = estimateMaterialCost(preset);
  
  return {
    material,
    preset,
    color,
    estimatedMemoryCost,
  };
}

/**
 * Creates a Three.js material from preset properties.
 * 
 * This function translates preset data into actual Material instances.
 * All PBR properties are applied here based on physically accurate values.
 * 
 * Performance note: MeshPhysicalMaterial is more expensive than MeshStandardMaterial
 * but provides essential features (clearcoat, sheen, transmission). For mobile
 * optimization, consider a quality setting that downgrades to MeshStandardMaterial.
 * 
 * @param preset - Material preset with PBR properties
 * @param color - Base color to apply
 * @param opacity - Material opacity
 * @returns Configured Three.js material
 */
function createMaterialFromPreset(
  preset: MaterialPreset,
  color: THREE.Color,
  opacity: number
): THREE.Material {
  // Determine if we need advanced features (clearcoat, sheen, transmission)
  const needsPhysicalMaterial = 
    preset.clearcoat !== undefined ||
    preset.sheen !== undefined ||
    preset.transmission !== undefined;
  
  if (needsPhysicalMaterial) {
    return createPhysicalMaterial(preset, color, opacity);
  } else {
    return createStandardMaterial(preset, color, opacity);
  }
}

/**
 * Creates a MeshPhysicalMaterial with advanced PBR features.
 * 
 * Used when preset requires:
 * - Clearcoat (automotive paint)
 * - Sheen (fabric/vinyl)
 * - Transmission (glass)
 * 
 * GPU cost: Higher than MeshStandardMaterial due to additional shader complexity.
 * 
 * @param preset - Material preset
 * @param color - Base color
 * @param opacity - Opacity value
 * @returns MeshPhysicalMaterial instance
 */
function createPhysicalMaterial(
  preset: MaterialPreset,
  color: THREE.Color,
  opacity: number
): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    // Base properties
    color,
    metalness: preset.metalness,
    roughness: preset.roughness,
    
    // Transparency
    transparent: opacity < 1.0 || (preset.transmission !== undefined && preset.transmission > 0),
    opacity,
    
    // Clearcoat (automotive paint, protective layers)
    clearcoat: preset.clearcoat ?? 0.0,
    clearcoatRoughness: preset.clearcoatRoughness ?? 0.0,
    
    // Sheen (fabric, vinyl edge lighting)
    sheen: preset.sheen ?? 0.0,
    sheenRoughness: preset.sheen !== undefined ? 0.5 : undefined,
    sheenColor: preset.sheenColor 
      ? new THREE.Color(preset.sheenColor.r, preset.sheenColor.g, preset.sheenColor.b)
      : undefined,
    
    // Transmission (glass)
    transmission: preset.transmission ?? 0.0,
    ior: preset.ior ?? 1.5,
    thickness: preset.thickness ?? 1.0,
    
    // Attenuation (glass tinting)
    attenuationColor: preset.attenuationColor 
      ? new THREE.Color(preset.attenuationColor)
      : new THREE.Color(1, 1, 1),
    attenuationDistance: preset.attenuationDistance ?? Infinity,
    
    // Environment mapping
    envMapIntensity: preset.envMapIntensity ?? 1.0,
    
    // Rendering hints
    side: THREE.FrontSide,
    shadowSide: THREE.FrontSide,
  });
  
  return material;
}

/**
 * Creates a MeshStandardMaterial for simpler materials.
 * 
 * Used when preset doesn't require advanced features.
 * Lower GPU cost than MeshPhysicalMaterial.
 * 
 * @param preset - Material preset
 * @param color - Base color
 * @param opacity - Opacity value
 * @returns MeshStandardMaterial instance
 */
function createStandardMaterial(
  preset: MaterialPreset,
  color: THREE.Color,
  opacity: number
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    // Base properties
    color,
    metalness: preset.metalness,
    roughness: preset.roughness,
    
    // Transparency
    transparent: opacity < 1.0,
    opacity,
    
    // Environment mapping
    envMapIntensity: preset.envMapIntensity ?? 1.0,
    
    // Rendering hints
    side: THREE.FrontSide,
    shadowSide: THREE.FrontSide,
  });
  
  return material;
}

/**
 * Estimates GPU memory cost for a material.
 * 
 * Used for memory management and debugging material bloat.
 * Actual GPU usage varies by driver and hardware.
 * 
 * @param preset - Material preset
 * @returns Estimated memory cost in bytes
 */
function estimateMaterialCost(preset: MaterialPreset): number {
  let cost = MATERIAL_PERFORMANCE.BASE_MATERIAL_COST;
  
  // Add cost for textures (when implemented)
  if (preset.textures) {
    const textureCount = Object.values(preset.textures).filter(Boolean).length;
    cost += textureCount * MATERIAL_PERFORMANCE.TEXTURE_COST;
  }
  
  // Advanced features add shader complexity (estimated cost)
  if (preset.clearcoat !== undefined) cost += 256;
  if (preset.sheen !== undefined) cost += 256;
  if (preset.transmission !== undefined) cost += 512; // Transmission is expensive
  
  return cost;
}

/**
 * Builds multiple materials from a preset with color variations.
 * 
 * Useful for generating material palettes or option previews.
 * 
 * @param presetId - Preset to use
 * @param colors - Array of colors to apply
 * @returns Array of built materials
 */
export function buildMaterialVariants(
  presetId: MaterialPresetId,
  colors: string[]
): BuiltMaterial[] {
  const preset = getPreset(presetId);
  if (!preset) {
    throw new Error(`Material preset not found: ${presetId}`);
  }
  
  return colors.map(color => buildMaterial({ preset, color }));
}

/**
 * Updates an existing material's color without recreating it.
 * 
 * Performance optimization: Avoids material recreation when only color changes.
 * Only use when you're certain the preset hasn't changed.
 * 
 * @param material - Existing Three.js material
 * @param newColor - New color to apply (hex)
 */
export function updateMaterialColor(
  material: THREE.Material,
  newColor: string
): void {
  if ('color' in material) {
    (material as THREE.MeshStandardMaterial).color.set(newColor);
    material.needsUpdate = true;
  }
}

/**
 * Validates that a material configuration is valid.
 * 
 * @param config - Material build configuration
 * @returns Validation result
 */
export function validateMaterialConfig(config: MaterialBuildConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate preset
  if (!config.preset) {
    errors.push('Material preset is required');
  }
  
  // Validate color
  try {
    new THREE.Color(config.color);
  } catch (e) {
    errors.push(`Invalid color format: ${config.color}`);
  }
  
  // Validate opacity
  if (config.opacity !== undefined) {
    if (config.opacity < 0 || config.opacity > 1) {
      errors.push('Opacity must be between 0 and 1');
    }
  }
  
  // Validate PBR values are in valid ranges
  if (config.preset) {
    const p = config.preset;
    
    if (p.metalness < 0 || p.metalness > 1) {
      errors.push(`Invalid metalness: ${p.metalness} (must be 0-1)`);
    }
    
    if (p.roughness < 0 || p.roughness > 1) {
      errors.push(`Invalid roughness: ${p.roughness} (must be 0-1)`);
    }
    
    if (p.clearcoat !== undefined && (p.clearcoat < 0 || p.clearcoat > 1)) {
      errors.push(`Invalid clearcoat: ${p.clearcoat} (must be 0-1)`);
    }
    
    if (p.transmission !== undefined && (p.transmission < 0 || p.transmission > 1)) {
      errors.push(`Invalid transmission: ${p.transmission} (must be 0-1)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Disposes a material and frees GPU resources.
 * 
 * @param material - Material to dispose
 */
export function disposeMaterial(material: THREE.Material): void {
  material.dispose();
  
  // Dispose textures if present (for future use)
  const materialWithTextures = material as THREE.MeshStandardMaterial;
  if (materialWithTextures.map) materialWithTextures.map.dispose();
  if (materialWithTextures.normalMap) materialWithTextures.normalMap.dispose();
  if (materialWithTextures.roughnessMap) materialWithTextures.roughnessMap.dispose();
  if (materialWithTextures.metalnessMap) materialWithTextures.metalnessMap.dispose();
  if (materialWithTextures.aoMap) materialWithTextures.aoMap.dispose();
}
