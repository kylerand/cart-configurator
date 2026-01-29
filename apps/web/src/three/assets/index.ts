/**
 * Barrel export for asset loading system.
 */

export { 
  SubassemblyId,
  ENABLE_GLTF_ASSETS,
  ASSET_REGISTRY,
  getAssetMetadata,
  hasAsset,
  getRegisteredAssetIds
} from './assetRegistry';

export type { 
  AssetMetadata,
  MaterialZoneMapping 
} from './assetRegistry';

export { 
  useCartAsset,
  useCartAssetPreloader,
  clearAssetCache,
  clearAllAssetCache
} from './useCartAsset';

export type { 
  UseCartAssetResult 
} from './useCartAsset';
