/**
 * Material Preset System
 * 
 * Defines physically-based rendering (PBR) presets for golf cart finishes.
 * Each preset captures real-world material properties (roughness, metalness,
 * clearcoat, sheen, etc.) that combine with user-selected colors to create
 * realistic finishes.
 * 
 * Architecture:
 * - Presets are data-driven, not hardcoded in components
 * - User color is applied to the preset's base properties
 * - Presets declare compatible material zones
 * - Future texture maps can be added without refactoring
 * 
 * Physics note: Values are based on PBR references for real materials.
 * - Roughness: 0 = perfect mirror, 1 = completely diffuse
 * - Metalness: 0 = dielectric (paint), 1 = metal
 * - IOR: Index of refraction (1.0 = air, 1.5 = glass, 2.4 = diamond)
 */

import { MaterialZone, MaterialType, MaterialFinish } from '@cart-configurator/types';

/**
 * Unique identifier for material presets.
 * Presets define the physical properties; colors are applied separately.
 */
export type MaterialPresetId = string;

/**
 * Physically-based material preset definition.
 * 
 * These values are based on real-world material measurements and PBR standards.
 * When user selects a color, it's applied to the preset's base properties.
 */
export interface MaterialPreset {
  /**
   * Unique identifier for this preset.
   */
  id: MaterialPresetId;
  
  /**
   * Human-readable name for UI display.
   */
  name: string;
  
  /**
   * Description of the finish quality and appearance.
   */
  description: string;
  
  /**
   * Material type for categorization and pricing.
   */
  type: MaterialType;
  
  /**
   * Finish category (maps to legacy MaterialFinish enum).
   */
  finish: MaterialFinish;
  
  /**
   * Which zones this preset can be applied to.
   * Prevents invalid combinations (e.g., paint on seats).
   */
  compatibleZones: MaterialZone[];
  
  /**
   * PBR Properties
   * These values define the physical behavior of the material.
   */
  
  /**
   * Metalness: 0 = dielectric (non-metal), 1 = metal.
   * Affects how material reflects light and color.
   * - Paint/vinyl/plastic: 0.0
   * - Bare metal/chrome: 1.0
   * - Metallic paint: 0.0 (metal flakes are in baseColor, not metalness)
   */
  metalness: number;
  
  /**
   * Roughness: 0 = mirror smooth, 1 = completely rough/diffuse.
   * Controls sharpness of reflections.
   * - High gloss clear coat: 0.1-0.2
   * - Satin finish: 0.4-0.6
   * - Matte finish: 0.8-1.0
   */
  roughness: number;
  
  /**
   * Clearcoat layer intensity (0-1).
   * Simulates protective clear coat over base paint.
   * - Automotive paint: 0.5-1.0
   * - Raw vinyl: 0.0
   * - Powder coat: 0.3-0.5
   */
  clearcoat?: number;
  
  /**
   * Clearcoat roughness (0-1).
   * Independent from base roughness.
   * - High gloss clear: 0.0-0.1
   * - Satin clear: 0.3-0.5
   */
  clearcoatRoughness?: number;
  
  /**
   * Sheen intensity (0-1).
   * Simulates soft edge lighting on fabric/vinyl.
   * Used for upholstery materials.
   */
  sheen?: number;
  
  /**
   * Sheen color (RGB, 0-1 range).
   * Tints the sheen highlight (e.g., fabric texture color).
   */
  sheenColor?: { r: number; g: number; b: number };
  
  /**
   * Transmission (0-1).
   * Amount of light passing through material.
   * - Opaque: 0.0
   * - Tinted glass: 0.5-0.8
   * - Clear glass: 0.9-1.0
   */
  transmission?: number;
  
  /**
   * Index of refraction (IOR).
   * Controls light bending through transparent materials.
   * - Air: 1.0
   * - Water: 1.33
   * - Glass: 1.5-1.6
   * - Acrylic: 1.49
   */
  ior?: number;
  
  /**
   * Thickness for thin-film materials (meters).
   * Used with transmission for realistic glass.
   */
  thickness?: number;
  
  /**
   * Attenuation color (RGB hex).
   * Color tint for light passing through material (for tinted glass).
   */
  attenuationColor?: string;
  
  /**
   * Attenuation distance (meters).
   * How far light travels before being fully absorbed.
   */
  attenuationDistance?: number;
  
  /**
   * Environment map intensity multiplier.
   * Controls strength of environment reflections.
   * - Matte: 0.2-0.4
   * - Satin: 0.6-0.8
   * - Gloss: 1.0-1.5
   */
  envMapIntensity?: number;
  
  /**
   * Future texture map slots.
   * Paths will be populated when textures are added.
   */
  textures?: {
    normalMap?: string;       // Surface detail (scratches, weave)
    roughnessMap?: string;    // Roughness variation
    metalnessMap?: string;    // Metalness variation
    aoMap?: string;           // Ambient occlusion
    clearcoatNormalMap?: string;  // Clear coat imperfections
  };
}

/**
 * PBR Constants
 * Reference values for physically accurate materials.
 */
export const PBR_CONSTANTS = {
  /**
   * Index of refraction values for common materials.
   */
  IOR: {
    AIR: 1.0,
    WATER: 1.33,
    GLASS: 1.5,
    ACRYLIC: 1.49,
    POLYCARBONATE: 1.58,
  },
  
  /**
   * Typical roughness ranges for finishes.
   */
  ROUGHNESS: {
    MIRROR: 0.0,
    HIGH_GLOSS: 0.15,
    GLOSS: 0.25,
    SATIN: 0.5,
    MATTE: 0.85,
    ROUGH: 1.0,
  },
  
  /**
   * Environment map intensity guidelines.
   */
  ENV_MAP_INTENSITY: {
    MATTE: 0.3,
    SATIN: 0.7,
    GLOSS: 1.2,
    CHROME: 1.5,
  },
} as const;

/**
 * Material Preset Catalog
 * 
 * Production-ready presets based on real golf cart customization options.
 * Each preset represents a specific finish type with physically accurate properties.
 */
export const MATERIAL_PRESETS: Record<MaterialPresetId, MaterialPreset> = {
  // ========================================
  // PAINT - Automotive-grade paint finishes
  // ========================================
  
  'paint-gloss': {
    id: 'paint-gloss',
    name: 'High Gloss Paint',
    description: 'Premium automotive paint with multi-layer clear coat. Deep, mirror-like finish.',
    type: MaterialType.PAINT,
    finish: MaterialFinish.GLOSS,
    compatibleZones: [MaterialZone.BODY, MaterialZone.ROOF],
    metalness: 0.0,
    roughness: PBR_CONSTANTS.ROUGHNESS.HIGH_GLOSS,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: PBR_CONSTANTS.ENV_MAP_INTENSITY.GLOSS,
  },
  
  'paint-satin': {
    id: 'paint-satin',
    name: 'Satin Paint',
    description: 'Semi-gloss automotive paint. Smooth with soft reflections.',
    type: MaterialType.PAINT,
    finish: MaterialFinish.SATIN,
    compatibleZones: [MaterialZone.BODY, MaterialZone.ROOF],
    metalness: 0.0,
    roughness: PBR_CONSTANTS.ROUGHNESS.SATIN,
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
    envMapIntensity: PBR_CONSTANTS.ENV_MAP_INTENSITY.SATIN,
  },
  
  'paint-matte': {
    id: 'paint-matte',
    name: 'Matte Paint',
    description: 'Ultra-matte automotive paint. No shine, velvety appearance.',
    type: MaterialType.PAINT,
    finish: MaterialFinish.MATTE,
    compatibleZones: [MaterialZone.BODY, MaterialZone.ROOF],
    metalness: 0.0,
    roughness: PBR_CONSTANTS.ROUGHNESS.MATTE,
    clearcoat: 0.0,
    envMapIntensity: PBR_CONSTANTS.ENV_MAP_INTENSITY.MATTE,
  },
  
  'paint-metallic': {
    id: 'paint-metallic',
    name: 'Metallic Paint',
    description: 'Automotive paint with metal flake. Sparkles in direct light.',
    type: MaterialType.PAINT,
    finish: MaterialFinish.METALLIC,
    compatibleZones: [MaterialZone.BODY, MaterialZone.ROOF],
    metalness: 0.0, // Metalness is in the color/texture, not the material property
    roughness: PBR_CONSTANTS.ROUGHNESS.GLOSS,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: PBR_CONSTANTS.ENV_MAP_INTENSITY.GLOSS,
  },
  
  // ========================================
  // POWDER COAT - Metal frame finishes
  // ========================================
  
  'powdercoat-gloss': {
    id: 'powdercoat-gloss',
    name: 'Gloss Powder Coat',
    description: 'Durable powder-coated finish for metal parts. Thick, glossy protective layer.',
    type: MaterialType.POWDERCOAT,
    finish: MaterialFinish.GLOSS,
    compatibleZones: [MaterialZone.METAL],
    metalness: 0.0,
    roughness: 0.3,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.9,
  },
  
  'powdercoat-satin': {
    id: 'powdercoat-satin',
    name: 'Satin Powder Coat',
    description: 'Semi-gloss powder-coated finish for metal frame. Durable and subtle.',
    type: MaterialType.POWDERCOAT,
    finish: MaterialFinish.SATIN,
    compatibleZones: [MaterialZone.METAL],
    metalness: 0.0,
    roughness: PBR_CONSTANTS.ROUGHNESS.SATIN,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    envMapIntensity: PBR_CONSTANTS.ENV_MAP_INTENSITY.SATIN,
  },
  
  'powdercoat-matte': {
    id: 'powdercoat-matte',
    name: 'Matte Powder Coat',
    description: 'Low-shine powder-coated finish. Industrial, modern aesthetic.',
    type: MaterialType.POWDERCOAT,
    finish: MaterialFinish.MATTE,
    compatibleZones: [MaterialZone.METAL],
    metalness: 0.0,
    roughness: 0.8,
    clearcoat: 0.0,
    envMapIntensity: PBR_CONSTANTS.ENV_MAP_INTENSITY.MATTE,
  },
  
  // ========================================
  // VINYL - Upholstery and wrap finishes
  // ========================================
  
  'vinyl-upholstery': {
    id: 'vinyl-upholstery',
    name: 'Vinyl Upholstery',
    description: 'Marine-grade vinyl for seats. Soft sheen, weather resistant.',
    type: MaterialType.VINYL,
    finish: MaterialFinish.SATIN,
    compatibleZones: [MaterialZone.SEATS],
    metalness: 0.0,
    roughness: 0.6,
    sheen: 0.4, // Soft edge lighting for vinyl texture
    sheenColor: { r: 1.0, g: 1.0, b: 1.0 }, // White sheen
    envMapIntensity: 0.4,
  },
  
  'vinyl-wrap-gloss': {
    id: 'vinyl-wrap-gloss',
    name: 'Gloss Vinyl Wrap',
    description: 'High-gloss vinyl wrap. Smooth, wet-look finish.',
    type: MaterialType.VINYL,
    finish: MaterialFinish.GLOSS,
    compatibleZones: [MaterialZone.BODY, MaterialZone.ROOF],
    metalness: 0.0,
    roughness: 0.2,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.0,
  },
  
  'vinyl-wrap-matte': {
    id: 'vinyl-wrap-matte',
    name: 'Matte Vinyl Wrap',
    description: 'Flat vinyl wrap. Smooth, non-reflective finish.',
    type: MaterialType.VINYL,
    finish: MaterialFinish.MATTE,
    compatibleZones: [MaterialZone.BODY, MaterialZone.ROOF],
    metalness: 0.0,
    roughness: 0.9,
    clearcoat: 0.0,
    envMapIntensity: PBR_CONSTANTS.ENV_MAP_INTENSITY.MATTE,
  },
  
  // ========================================
  // FABRIC - Seat upholstery
  // ========================================
  
  'fabric-marine': {
    id: 'fabric-marine',
    name: 'Marine Fabric',
    description: 'Weather-resistant fabric upholstery. Textured, breathable.',
    type: MaterialType.FABRIC,
    finish: MaterialFinish.MATTE,
    compatibleZones: [MaterialZone.SEATS],
    metalness: 0.0,
    roughness: 1.0, // Completely diffuse
    sheen: 0.6, // Strong edge lighting for fabric weave
    sheenColor: { r: 1.0, g: 1.0, b: 1.0 },
    envMapIntensity: 0.1,
  },
  
  // ========================================
  // GLASS - Windshield and windows
  // ========================================
  
  'glass-clear': {
    id: 'glass-clear',
    name: 'Clear Glass',
    description: 'Clear tempered glass. High transparency, minimal tint.',
    type: MaterialType.TINT,
    finish: MaterialFinish.GLOSS,
    compatibleZones: [MaterialZone.GLASS],
    metalness: 0.0,
    roughness: 0.0, // Perfect smoothness
    transmission: 0.95,
    ior: PBR_CONSTANTS.IOR.GLASS,
    thickness: 0.005, // 5mm glass
    envMapIntensity: 1.0,
  },
  
  'glass-tinted-light': {
    id: 'glass-tinted-light',
    name: 'Light Tinted Glass',
    description: 'Lightly tinted glass. Reduces glare, maintains visibility.',
    type: MaterialType.TINT,
    finish: MaterialFinish.GLOSS,
    compatibleZones: [MaterialZone.GLASS],
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0.7,
    ior: PBR_CONSTANTS.IOR.GLASS,
    thickness: 0.005,
    attenuationColor: '#c0c0c0', // Slight gray tint
    attenuationDistance: 0.5,
    envMapIntensity: 1.0,
  },
  
  'glass-tinted-dark': {
    id: 'glass-tinted-dark',
    name: 'Dark Tinted Glass',
    description: 'Heavy tint for privacy and sun protection.',
    type: MaterialType.TINT,
    finish: MaterialFinish.GLOSS,
    compatibleZones: [MaterialZone.GLASS],
    metalness: 0.0,
    roughness: 0.0,
    transmission: 0.3,
    ior: PBR_CONSTANTS.IOR.GLASS,
    thickness: 0.005,
    attenuationColor: '#404040', // Dark gray tint
    attenuationDistance: 0.2,
    envMapIntensity: 0.8,
  },
  
  // ========================================
  // METAL - Bare metal finishes
  // ========================================
  
  'metal-chrome': {
    id: 'metal-chrome',
    name: 'Chrome',
    description: 'Mirror-polished chrome plating. Maximum shine.',
    type: MaterialType.POWDERCOAT,
    finish: MaterialFinish.METALLIC,
    compatibleZones: [MaterialZone.METAL],
    metalness: 1.0, // True metal
    roughness: 0.05, // Near-mirror
    envMapIntensity: PBR_CONSTANTS.ENV_MAP_INTENSITY.CHROME,
  },
  
  'metal-brushed': {
    id: 'metal-brushed',
    name: 'Brushed Metal',
    description: 'Brushed aluminum or steel. Linear grain texture.',
    type: MaterialType.POWDERCOAT,
    finish: MaterialFinish.METALLIC,
    compatibleZones: [MaterialZone.METAL],
    metalness: 1.0,
    roughness: 0.4, // Visible grain scatter
    envMapIntensity: 1.0,
  },
  
  'metal-anodized': {
    id: 'metal-anodized',
    name: 'Anodized Metal',
    description: 'Anodized aluminum. Colored, durable protective layer.',
    type: MaterialType.POWDERCOAT,
    finish: MaterialFinish.SATIN,
    compatibleZones: [MaterialZone.METAL],
    metalness: 0.8, // Slight coating reduces pure metal behavior
    roughness: 0.35,
    envMapIntensity: 1.1,
  },
  
  // ========================================
  // PLASTIC - Trim and accessories
  // ========================================
  
  'plastic-glossy': {
    id: 'plastic-glossy',
    name: 'Glossy Plastic',
    description: 'Injection-molded glossy plastic. Smooth, shiny trim.',
    type: MaterialType.VINYL,
    finish: MaterialFinish.GLOSS,
    compatibleZones: [MaterialZone.METAL, MaterialZone.BODY],
    metalness: 0.0,
    roughness: 0.3,
    envMapIntensity: 0.8,
  },
  
  'plastic-textured': {
    id: 'plastic-textured',
    name: 'Textured Plastic',
    description: 'Textured plastic trim. Matte, grippy surface.',
    type: MaterialType.VINYL,
    finish: MaterialFinish.MATTE,
    compatibleZones: [MaterialZone.METAL, MaterialZone.BODY],
    metalness: 0.0,
    roughness: 0.85,
    envMapIntensity: 0.3,
  },
} as const;

/**
 * Gets a material preset by ID.
 * 
 * @param presetId - Preset identifier
 * @returns Material preset or undefined if not found
 */
export function getPreset(presetId: MaterialPresetId): MaterialPreset | undefined {
  return MATERIAL_PRESETS[presetId];
}

/**
 * Gets all presets compatible with a specific zone.
 * 
 * @param zone - Material zone to filter by
 * @returns Array of compatible presets
 */
export function getPresetsForZone(zone: MaterialZone): MaterialPreset[] {
  return Object.values(MATERIAL_PRESETS).filter(
    preset => preset.compatibleZones.includes(zone)
  );
}

/**
 * Gets all presets of a specific material type.
 * 
 * @param type - Material type to filter by
 * @returns Array of matching presets
 */
export function getPresetsByType(type: MaterialType): MaterialPreset[] {
  return Object.values(MATERIAL_PRESETS).filter(
    preset => preset.type === type
  );
}

/**
 * Validates that a preset is compatible with a zone.
 * 
 * @param presetId - Preset identifier
 * @param zone - Material zone
 * @returns true if compatible, false otherwise
 */
export function isPresetCompatibleWithZone(
  presetId: MaterialPresetId,
  zone: MaterialZone
): boolean {
  const preset = getPreset(presetId);
  return preset ? preset.compatibleZones.includes(zone) : false;
}

/**
 * Gets a default preset for a zone.
 * Used as fallback when no preset is specified.
 * 
 * @param zone - Material zone
 * @returns Default preset for that zone
 */
export function getDefaultPresetForZone(zone: MaterialZone): MaterialPreset {
  switch (zone) {
    case MaterialZone.BODY:
      return MATERIAL_PRESETS['paint-gloss'];
    case MaterialZone.ROOF:
      return MATERIAL_PRESETS['paint-gloss'];
    case MaterialZone.SEATS:
      return MATERIAL_PRESETS['vinyl-upholstery'];
    case MaterialZone.METAL:
      return MATERIAL_PRESETS['powdercoat-satin'];
    case MaterialZone.GLASS:
      return MATERIAL_PRESETS['glass-tinted-light'];
    default:
      return MATERIAL_PRESETS['paint-gloss'];
  }
}
