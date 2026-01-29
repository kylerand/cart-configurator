/**
 * Material system barrel export.
 * 
 * Exports both legacy factory functions and new PBR preset system.
 */

// Legacy factory (uses preset system internally)
export { 
  processMaterial,
  createMaterialMap,
  getMaterialForZone,
  createDefaultMaterialMap,
  disposeMaterialMap
} from './materialFactory';

// PBR Preset System
export {
  MATERIAL_PRESETS,
  PBR_CONSTANTS,
  getPreset,
  getPresetsForZone,
  getPresetsByType,
  isPresetCompatibleWithZone,
  getDefaultPresetForZone,
} from './materialPresets';

export type {
  MaterialPreset,
  MaterialPresetId,
} from './materialPresets';

// Material Builder
export {
  buildMaterial,
  buildMaterialVariants,
  updateMaterialColor,
  validateMaterialConfig,
  disposeMaterial,
  MATERIAL_PERFORMANCE,
} from './buildMaterial';

export type {
  MaterialBuildConfig,
  BuiltMaterial,
} from './buildMaterial';

// Material Cache
export {
  materialCache,
  prewarmMaterialCache,
  cleanupMaterialCache,
  startCacheMonitoring,
} from './materialCache';

export type {
  CacheStats,
} from './materialCache';
