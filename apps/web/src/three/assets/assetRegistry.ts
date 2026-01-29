/**
 * Asset registry for cart GLTF models.
 * 
 * This registry provides a centralized, type-safe mapping between logical
 * subassembly identifiers and their corresponding GLTF asset metadata.
 * 
 * Architecture note: This decouples asset loading from component logic.
 * When a new model is added, update this registry - components remain unchanged.
 * 
 * Material zone mapping: Maps mesh names (or name patterns) in the GLTF to
 * material zones. This allows the material factory to apply configuration-driven
 * materials to the correct parts of the model.
 */

import { MaterialZone } from '@cart-configurator/types';

/**
 * Asset metadata for a single GLTF model.
 */
export interface AssetMetadata {
  /**
   * Path to the GLTF/GLB file.
   * Can be absolute or relative to public directory.
   */
  path: string;
  
  /**
   * Default scale to apply to the loaded model.
   * Used to normalize asset dimensions to match CART_DIMENSIONS.
   */
  scale: { x: number; y: number; z: number };
  
  /**
   * Default rotation to apply to the loaded model (in radians).
   * Used to orient the asset correctly in world space.
   */
  rotation: { x: number; y: number; z: number };
  
  /**
   * Mapping of mesh name patterns to material zones.
   * When a mesh name matches a pattern, the corresponding zone's material
   * will be applied to it.
   * 
   * Pattern matching: Case-insensitive substring match
   * Example: 'body' matches 'BodyMesh', 'Chassis_Body', 'body_panel'
   */
  materialMapping: MaterialZoneMapping[];
  
  /**
   * Optional offset to apply after scale/rotation.
   * Used for fine-tuning model position.
   */
  offset?: { x: number; y: number; z: number };
}

/**
 * Maps a mesh name pattern to a material zone.
 */
export interface MaterialZoneMapping {
  /**
   * Pattern to match against mesh names (case-insensitive substring).
   */
  meshPattern: string;
  
  /**
   * Material zone to apply when pattern matches.
   */
  zone: MaterialZone;
}

/**
 * Logical identifiers for cart subassemblies.
 * These map to component names but are decoupled from implementation.
 */
export enum SubassemblyId {
  CHASSIS = 'CHASSIS',
  WHEELS_STANDARD = 'WHEELS_STANDARD',
  WHEELS_CHROME = 'WHEELS_CHROME',
  WHEELS_OFFROAD = 'WHEELS_OFFROAD',
  ROOF_STANDARD = 'ROOF_STANDARD',
  ROOF_EXTENDED = 'ROOF_EXTENDED',
  ROOF_SOLAR = 'ROOF_SOLAR',
  SEATS_STANDARD = 'SEATS_STANDARD',
  SEATS_CAPTAIN = 'SEATS_CAPTAIN',
  SEATS_PREMIUM = 'SEATS_PREMIUM',
  STORAGE_BASKET = 'STORAGE_BASKET',
  LIGHT_BAR = 'LIGHT_BAR',
  AUDIO_SPEAKERS = 'AUDIO_SPEAKERS',
}

/**
 * Feature flag for enabling GLTF asset loading.
 * Set to false to use placeholder geometry exclusively.
 * Can be controlled via environment variable or runtime config.
 */
export const ENABLE_GLTF_ASSETS = true;

/**
 * Central asset registry.
 * 
 * Architecture note: When adding new assets:
 * 1. Add the GLTF file to /public/assets/gltf/
 * 2. Add an entry here with proper metadata
 * 3. Update the corresponding subassembly to use the ID
 * 4. No other code changes needed
 * 
 * Scale guidance: Models should be authored at 1 unit = 1 meter.
 * If your model is in different units, adjust scale here.
 * 
 * Rotation guidance: Models should face +Z (forward). If not, adjust rotation here.
 * 
 * Material mapping guidance: Inspect your GLTF in a viewer (e.g., gltf-viewer)
 * and note the mesh names. Create patterns that uniquely identify each material zone.
 */
export const ASSET_REGISTRY: Partial<Record<SubassemblyId, AssetMetadata>> = {
  // Example entries (commented out until actual assets exist)
  
  // [SubassemblyId.CHASSIS]: {
  //   path: '/assets/gltf/chassis_v1.glb',
  //   scale: { x: 1, y: 1, z: 1 },
  //   rotation: { x: 0, y: 0, z: 0 },
  //   materialMapping: [
  //     { meshPattern: 'body', zone: MaterialZone.BODY },
  //     { meshPattern: 'frame', zone: MaterialZone.BODY },
  //     { meshPattern: 'metal', zone: MaterialZone.METAL },
  //   ],
  // },
  
  // [SubassemblyId.WHEELS_CHROME]: {
  //   path: '/assets/gltf/wheels_chrome.glb',
  //   scale: { x: 1, y: 1, z: 1 },
  //   rotation: { x: 0, y: 0, z: 0 },
  //   materialMapping: [
  //     { meshPattern: 'rim', zone: MaterialZone.METAL },
  //     { meshPattern: 'tire', zone: MaterialZone.METAL }, // Tires always black - applied in component
  //   ],
  // },
  
  // [SubassemblyId.ROOF_STANDARD]: {
  //   path: '/assets/gltf/roof_standard.glb',
  //   scale: { x: 1, y: 1, z: 1 },
  //   rotation: { x: 0, y: 0, z: 0 },
  //   materialMapping: [
  //     { meshPattern: 'panel', zone: MaterialZone.ROOF },
  //     { meshPattern: 'support', zone: MaterialZone.METAL },
  //   ],
  // },
  
  // [SubassemblyId.SEATS_CAPTAIN]: {
  //   path: '/assets/gltf/seats_captain.glb',
  //   scale: { x: 1, y: 1, z: 1 },
  //   rotation: { x: 0, y: 0, z: 0 },
  //   materialMapping: [
  //     { meshPattern: 'cushion', zone: MaterialZone.SEATS },
  //     { meshPattern: 'backrest', zone: MaterialZone.SEATS },
  //     { meshPattern: 'frame', zone: MaterialZone.METAL },
  //   ],
  // },
};

/**
 * Retrieves asset metadata for a subassembly.
 * 
 * @param id - Subassembly identifier
 * @returns Asset metadata or undefined if not registered
 */
export function getAssetMetadata(id: SubassemblyId): AssetMetadata | undefined {
  return ASSET_REGISTRY[id];
}

/**
 * Checks if a subassembly has a registered GLTF asset.
 * 
 * @param id - Subassembly identifier
 * @returns True if asset exists and GLTF loading is enabled
 */
export function hasAsset(id: SubassemblyId): boolean {
  return ENABLE_GLTF_ASSETS && ASSET_REGISTRY[id] !== undefined;
}

/**
 * Lists all registered asset IDs.
 * Useful for preloading or debugging.
 * 
 * @returns Array of subassembly IDs with registered assets
 */
export function getRegisteredAssetIds(): SubassemblyId[] {
  return Object.keys(ASSET_REGISTRY) as SubassemblyId[];
}
