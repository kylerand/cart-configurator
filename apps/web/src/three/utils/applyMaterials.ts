/**
 * Material application utilities for loaded GLTF models.
 * 
 * This module provides functions to apply configuration-driven materials to
 * GLTF meshes based on name patterns and material zone mappings.
 * 
 * Architecture note: This is the bridge between the material factory (which creates
 * Three.js materials from configuration) and loaded GLTF models (which have meshes
 * with names). The registry defines the mapping, this module executes it.
 * 
 * Important: This module never mutates the original cached GLTF. It only operates
 * on cloned instances returned by useCartAsset.
 */

import * as THREE from 'three';
import { MaterialZone } from '@cart-configurator/types';
import type { MaterialMap } from '../types/threeTypes';
import type { MaterialZoneMapping } from '../assets/assetRegistry';
import { getMaterialForZone } from '../materials/materialFactory';

/**
 * Options for material application.
 */
export interface ApplyMaterialsOptions {
  /**
   * Whether to preserve original materials for meshes without zone mapping.
   * Default: true
   */
  preserveUnmapped?: boolean;
  
  /**
   * Whether to enable shadows on all meshes.
   * Default: true
   */
  enableShadows?: boolean;
  
  /**
   * Custom material override for specific mesh names.
   * Takes precedence over zone mapping.
   */
  customMaterials?: Map<string, THREE.Material>;
}

/**
 * Applies configuration-driven materials to a loaded GLTF model.
 * 
 * This function:
 * 1. Traverses all meshes in the model
 * 2. Matches mesh names against mapping patterns
 * 3. Applies the appropriate material from the material map
 * 4. Preserves materials for unmapped meshes (optional)
 * 5. Enables shadows (optional)
 * 
 * Pattern matching is case-insensitive substring matching:
 * - Pattern "body" matches: "BodyMesh", "chassis_body", "Body_01"
 * - Pattern "rim" matches: "WheelRim", "rim_mesh", "Rim_Left"
 * 
 * @param model - The GLTF model group (from useCartAsset)
 * @param materialMap - Material map from configuration
 * @param zoneMappings - Zone mappings from asset metadata
 * @param options - Optional configuration
 * 
 * @example
 * ```tsx
 * const asset = useCartAsset(SubassemblyId.CHASSIS);
 * const materialMap = useMaterialMap();
 * 
 * useEffect(() => {
 *   if (asset.model && metadata) {
 *     applyMaterialsToModel(
 *       asset.model,
 *       materialMap,
 *       metadata.materialMapping
 *     );
 *   }
 * }, [asset.model, materialMap, metadata]);
 * 
 * return asset.model ? <primitive object={asset.model} /> : <Placeholder />;
 * ```
 */
export function applyMaterialsToModel(
  model: THREE.Group,
  materialMap: MaterialMap,
  zoneMappings: MaterialZoneMapping[],
  options: ApplyMaterialsOptions = {}
): void {
  const {
    preserveUnmapped = true,
    enableShadows = true,
    customMaterials,
  } = options;
  
  // Build a lookup map for faster pattern matching
  const patternToZone = new Map<string, MaterialZone>();
  zoneMappings.forEach(mapping => {
    patternToZone.set(mapping.meshPattern.toLowerCase(), mapping.zone);
  });
  
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }
    
    const mesh = object;
    const meshName = mesh.name.toLowerCase();
    
    // Check for custom material override first
    if (customMaterials && customMaterials.has(mesh.name)) {
      const customMaterial = customMaterials.get(mesh.name);
      if (customMaterial) {
        mesh.material = customMaterial;
        if (enableShadows) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
        return;
      }
    }
    
    // Find matching zone by pattern
    let matchedZone: MaterialZone | undefined;
    
    for (const [pattern, zone] of patternToZone.entries()) {
      if (meshName.includes(pattern)) {
        matchedZone = zone;
        break;
      }
    }
    
    // Apply material if zone matched
    if (matchedZone !== undefined) {
      const material = getMaterialForZone(materialMap, matchedZone);
      mesh.material = material;
      
      if (enableShadows) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    } else if (!preserveUnmapped) {
      // If preserveUnmapped is false, apply a default material
      console.warn(`No material mapping for mesh: ${mesh.name}`);
    }
  });
}

/**
 * Creates a material override map for special cases.
 * 
 * Some meshes may require specific materials that don't fit the zone system
 * (e.g., always-black tires, transparent glass, emissive lights).
 * 
 * @param overrides - Object mapping mesh names to materials
 * @returns Map ready for use with applyMaterialsToModel
 * 
 * @example
 * ```tsx
 * const overrides = createMaterialOverrides({
 *   'TireMesh': new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
 *   'GlassMesh': new THREE.MeshPhysicalMaterial({ 
 *     color: 0xffffff, 
 *     transmission: 0.9 
 *   }),
 * });
 * 
 * applyMaterialsToModel(model, materialMap, mappings, { 
 *   customMaterials: overrides 
 * });
 * ```
 */
export function createMaterialOverrides(
  overrides: Record<string, THREE.Material>
): Map<string, THREE.Material> {
  return new Map(Object.entries(overrides));
}

/**
 * Finds all unique mesh names in a GLTF model.
 * Useful for debugging and creating material mappings.
 * 
 * @param model - The GLTF model group
 * @returns Array of unique mesh names
 * 
 * @example
 * ```tsx
 * const asset = useCartAsset(SubassemblyId.CHASSIS);
 * 
 * useEffect(() => {
 *   if (asset.model) {
 *     const meshNames = getMeshNames(asset.model);
 *     console.log('Available meshes:', meshNames);
 *     // Use this to create material mappings in assetRegistry
 *   }
 * }, [asset.model]);
 * ```
 */
export function getMeshNames(model: THREE.Group): string[] {
  const names = new Set<string>();
  
  model.traverse((object) => {
    if (object instanceof THREE.Mesh && object.name) {
      names.add(object.name);
    }
  });
  
  return Array.from(names).sort();
}

/**
 * Applies a uniform material to all meshes in a model.
 * Useful for debugging or special rendering modes.
 * 
 * @param model - The GLTF model group
 * @param material - Material to apply to all meshes
 */
export function applyUniformMaterial(
  model: THREE.Group,
  material: THREE.Material
): void {
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.material = material;
    }
  });
}

/**
 * Validates that all meshes in a model have material mappings.
 * Returns unmapped mesh names for debugging.
 * 
 * @param model - The GLTF model group
 * @param zoneMappings - Zone mappings to validate against
 * @returns Array of mesh names without mappings
 * 
 * @example
 * ```tsx
 * const unmapped = validateMaterialMappings(asset.model, metadata.materialMapping);
 * if (unmapped.length > 0) {
 *   console.warn('Unmapped meshes:', unmapped);
 * }
 * ```
 */
export function validateMaterialMappings(
  model: THREE.Group,
  zoneMappings: MaterialZoneMapping[]
): string[] {
  const unmappedMeshes: string[] = [];
  const patterns = zoneMappings.map(m => m.meshPattern.toLowerCase());
  
  model.traverse((object) => {
    if (object instanceof THREE.Mesh && object.name) {
      const meshName = object.name.toLowerCase();
      const hasMapping = patterns.some(pattern => meshName.includes(pattern));
      
      if (!hasMapping) {
        unmappedMeshes.push(object.name);
      }
    }
  });
  
  return unmappedMeshes;
}
