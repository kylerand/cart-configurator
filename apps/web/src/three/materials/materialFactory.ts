/**
 * Material factory for creating Three.js materials from configuration.
 * 
 * Architecture note: This factory translates our domain material definitions
 * (zone, color, finish) into actual Three.js Material instances. When materials
 * change in configuration, we regenerate the map and React handles the updates.
 * 
 * Updated: Now uses PBR preset system with material caching for improved
 * realism and performance.
 */

import * as THREE from 'three';
import { 
  Material as ConfigMaterial, 
  MaterialFinish, 
  MaterialZone,
  MaterialSelection,
} from '@cart-configurator/types';
import { ProcessedMaterial, MaterialMap, VISUAL_CONSTANTS } from '../types/threeTypes';
import { materialCache } from './materialCache';
import { getDefaultPresetForZone, getPresetsByType, MaterialPreset } from './materialPresets';

/**
 * Maps configuration material to PBR preset.
 * 
 * This bridges the catalog material definitions with the new preset system.
 * Selects appropriate preset based on material type and finish.
 * 
 * @param material - Material from catalog
 * @returns Material preset
 */
function selectPresetForMaterial(material: ConfigMaterial): MaterialPreset {
  const { type, finish, zone } = material;
  
  // Get all presets for this material type
  const candidates = getPresetsByType(type);
  
  // Filter by finish
  const matchingFinish = candidates.filter(p => p.finish === finish);
  
  // Filter by compatible zones
  const compatible = matchingFinish.filter(p => p.compatibleZones.includes(zone));
  
  // Return first match or default for zone
  if (compatible.length > 0) {
    return compatible[0];
  } else if (matchingFinish.length > 0) {
    // If no zone-compatible match, use first matching finish
    return matchingFinish[0];
  } else {
    // Fallback to zone default
    return getDefaultPresetForZone(zone);
  }
}


/**
 * Creates a ProcessedMaterial from a configuration material definition.
 * 
 * Updated to use PBR preset system with caching.
 * 
 * @param material - Material from catalog
 * @returns Processed material ready for rendering
 */
export function processMaterial(material: ConfigMaterial): ProcessedMaterial {
  const color = new THREE.Color(material.color);
  
  // Select appropriate preset based on material properties
  const preset = selectPresetForMaterial(material);
  
  // Get or create material through cache
  const built = materialCache.get({
    preset,
    color: material.color,
  });
  
  return {
    zone: material.zone,
    color,
    finish: material.finish,
    material: built.material,
  };
}

/**
 * Creates a material map from configuration selections.
 * 
 * This function resolves material IDs to actual material definitions,
 * processes them into Three.js materials, and returns a map for fast lookup.
 * 
 * @param selections - Material selections from configuration
 * @param allMaterials - Complete material catalog
 * @returns Map of zone to processed material
 */
export function createMaterialMap(
  selections: MaterialSelection[],
  allMaterials: ConfigMaterial[]
): MaterialMap {
  const map = new Map<MaterialZone, ProcessedMaterial>();
  
  for (const selection of selections) {
    const configMaterial = allMaterials.find(m => m.id === selection.materialId);
    if (configMaterial) {
      const processed = processMaterial(configMaterial);
      map.set(selection.zone, processed);
    }
  }
  
  return map;
}

/**
 * Gets a material for a specific zone, with fallback.
 * 
 * @param materialMap - Material map from configuration
 * @param zone - Material zone to retrieve
 * @returns Three.js material (falls back to default if not found)
 */
export function getMaterialForZone(
  materialMap: MaterialMap,
  zone: MaterialZone
): THREE.Material {
  const processed = materialMap.get(zone);
  
  if (processed) {
    return processed.material;
  }
  
  // Fallback material if zone not configured
  return new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: VISUAL_CONSTANTS.defaultMetalness,
    roughness: VISUAL_CONSTANTS.defaultRoughness,
  });
}

/**
 * Creates a default material map with sensible fallbacks.
 * Used when no materials are selected yet.
 * 
 * Updated to use PBR presets.
 * 
 * @returns Material map with default materials for each zone
 */
export function createDefaultMaterialMap(): MaterialMap {
  const map = new Map<MaterialZone, ProcessedMaterial>();
  
  const defaultMaterials: Record<MaterialZone, { color: string; finish: MaterialFinish }> = {
    [MaterialZone.BODY]: { color: '#ffffff', finish: MaterialFinish.GLOSS },
    [MaterialZone.SEATS]: { color: '#2b2b2b', finish: MaterialFinish.MATTE },
    [MaterialZone.ROOF]: { color: '#1a1a1a', finish: MaterialFinish.GLOSS },
    [MaterialZone.METAL]: { color: '#e5e5e5', finish: MaterialFinish.METALLIC },
    [MaterialZone.GLASS]: { color: '#f0f0f0', finish: MaterialFinish.GLOSS },
  };
  
  for (const [zone, config] of Object.entries(defaultMaterials)) {
    const color = new THREE.Color(config.color);
    
    // Get preset for zone
    const preset = getDefaultPresetForZone(zone as MaterialZone);
    
    // Build material through cache
    const built = materialCache.get({
      preset,
      color: config.color,
    });
    
    map.set(zone as MaterialZone, {
      zone: zone as MaterialZone,
      color,
      finish: config.finish,
      material: built.material,
    });
  }
  
  return map;
}

/**
 * Disposes of all materials in a material map.
 * Should be called when materials are being replaced to prevent memory leaks.
 * 
 * Note: With the cache system, materials may be shared across multiple maps.
 * The cache handles actual disposal when materials are evicted.
 * This function is kept for backward compatibility but is now a no-op.
 */
export function disposeMaterialMap(_materialMap: MaterialMap): void {
  // Note: Materials are now managed by cache, so we don't dispose directly.
  // This prevents disposing shared materials that are still in use elsewhere.
  // The cache will handle disposal during eviction or cleanup.
  
  // For legacy compatibility, we could mark materials as "unused" but don't dispose.
  // In a more sophisticated system, you'd implement reference counting here.
}
