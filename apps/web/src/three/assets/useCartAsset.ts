/**
 * Custom hook for loading and preparing cart GLTF assets.
 * 
 * This hook provides a safe, memoized way to load GLTF models for cart subassemblies.
 * It handles:
 * - Asset loading via drei/useGLTF
 * - Scene cloning (prevents mutation of cached models)
 * - Transform normalization (scale, rotation, offset)
 * - Error handling and fallback
 * 
 * Architecture note: This hook is the bridge between asset metadata and renderable
 * Three.js objects. It ensures loaded models are properly prepared before rendering.
 * 
 * Performance note: useGLTF caches loaded models automatically. Cloning is necessary
 * because React Three Fiber manages object lifecycle, and we may need multiple
 * instances or different materials per instance.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { SubassemblyId } from './assetRegistry';
import { getAssetMetadata, hasAsset } from './assetRegistry';

/**
 * Result of asset loading operation.
 */
export interface UseCartAssetResult {
  /**
   * The prepared Three.js group ready to render.
   * Undefined if asset is not available or loading failed.
   */
  model: THREE.Group | undefined;
  
  /**
   * Whether the asset is currently loading.
   */
  loading: boolean;
  
  /**
   * Error that occurred during loading, if any.
   */
  error: Error | undefined;
  
  /**
   * Whether an asset is registered for this ID.
   */
  hasAsset: boolean;
}

/**
 * Loads and prepares a GLTF asset for a cart subassembly.
 * 
 * This hook:
 * 1. Checks if asset is registered
 * 2. Loads the GLTF via useGLTF (with caching)
 * 3. Clones the scene to prevent shared state issues
 * 4. Applies normalization transforms from metadata
 * 5. Returns a ready-to-render Group
 * 
 * @param id - Subassembly identifier
 * @returns Asset loading result
 * 
 * @example
 * ```tsx
 * function Wheels() {
 *   const asset = useCartAsset(SubassemblyId.WHEELS_CHROME);
 *   
 *   if (asset.loading) {
 *     return <LoadingIndicator />;
 *   }
 *   
 *   if (asset.model) {
 *     return <primitive object={asset.model} />;
 *   }
 *   
 *   return <PlaceholderWheels />;
 * }
 * ```
 */
export function useCartAsset(id: SubassemblyId): UseCartAssetResult {
  const hasRegisteredAsset = hasAsset(id);
  const metadata = getAssetMetadata(id);
  
  // Track loading state and errors
  const errorRef = useRef<Error | undefined>(undefined);
  
  // Conditionally load GLTF (only if asset is registered)
  // useGLTF handles caching automatically
  let gltf: { scene: THREE.Group } | undefined;
  let gltfError: Error | undefined;
  
  try {
    if (hasRegisteredAsset && metadata) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      gltf = useGLTF(metadata.path) as { scene: THREE.Group };
    }
  } catch (error) {
    gltfError = error as Error;
    errorRef.current = gltfError;
  }
  
  /**
   * Prepare the model with normalization transforms.
   * Memoized to prevent recreating on every render.
   */
  const model = useMemo(() => {
    if (!gltf || !metadata) {
      return undefined;
    }
    
    try {
      // Clone the scene to prevent mutation of cached original
      const clonedScene = gltf.scene.clone(true);
      
      // Create a new group to hold the model with transforms
      const group = new THREE.Group();
      group.name = `asset-${id}`;
      
      // Apply scale normalization
      if (metadata.scale) {
        clonedScene.scale.set(
          metadata.scale.x,
          metadata.scale.y,
          metadata.scale.z
        );
      }
      
      // Apply rotation normalization
      if (metadata.rotation) {
        clonedScene.rotation.set(
          metadata.rotation.x,
          metadata.rotation.y,
          metadata.rotation.z
        );
      }
      
      // Apply position offset if specified
      if (metadata.offset) {
        clonedScene.position.set(
          metadata.offset.x,
          metadata.offset.y,
          metadata.offset.z
        );
      }
      
      // Add the transformed model to the group
      group.add(clonedScene);
      
      return group;
    } catch (error) {
      errorRef.current = error as Error;
      console.error(`Failed to prepare asset ${id}:`, error);
      return undefined;
    }
  }, [gltf, metadata, id]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (model) {
        // Dispose of cloned geometries and materials
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            
            // Dispose materials (checking for array or single material)
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else if (object.material) {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [model]);
  
  return {
    model,
    loading: hasRegisteredAsset && !gltf && !gltfError,
    error: errorRef.current,
    hasAsset: hasRegisteredAsset,
  };
}

/**
 * Preloads multiple GLTF assets.
 * Useful for loading screen or background preloading.
 * 
 * @param ids - Array of subassembly IDs to preload
 * 
 * @example
 * ```tsx
 * function LoadingScreen() {
 *   useCartAssetPreloader([
 *     SubassemblyId.CHASSIS,
 *     SubassemblyId.WHEELS_CHROME,
 *     SubassemblyId.ROOF_STANDARD,
 *   ]);
 *   
 *   return <LoadingIndicator />;
 * }
 * ```
 */
export function useCartAssetPreloader(ids: SubassemblyId[]): void {
  useEffect(() => {
    // Preload each asset that has metadata
    ids.forEach(id => {
      const metadata = getAssetMetadata(id);
      if (metadata) {
        // useGLTF.preload triggers loading and caching
        useGLTF.preload(metadata.path);
      }
    });
  }, [ids]);
}

/**
 * Clears the GLTF cache for a specific asset.
 * Useful for development or dynamic asset updates.
 * 
 * @param id - Subassembly identifier
 */
export function clearAssetCache(id: SubassemblyId): void {
  const metadata = getAssetMetadata(id);
  if (metadata) {
    useGLTF.clear(metadata.path);
  }
}

/**
 * Clears all cached GLTF assets.
 * Useful for memory management or asset hot-reloading.
 */
export function clearAllAssetCache(): void {
  // Clear all without arguments
  (useGLTF as unknown as { clear: () => void }).clear();
}

/**
 * Loads a GLTF asset from a dynamic URL.
 * 
 * Unlike useCartAsset which uses the static registry, this hook accepts
 * a URL directly. Useful for user-uploaded assets or assets from the database.
 * 
 * @param url - URL to the GLTF/GLB file (can be absolute or relative)
 * @param options - Optional transform options
 * @returns Asset loading result
 * 
 * @example
 * ```tsx
 * function DynamicModel({ assetUrl }: { assetUrl: string }) {
 *   const asset = useDynamicAsset(assetUrl);
 *   
 *   if (asset.loading) return <LoadingIndicator />;
 *   if (asset.model) return <primitive object={asset.model} />;
 *   return <Placeholder />;
 * }
 * ```
 */
export function useDynamicAsset(
  url: string | undefined | null,
  options?: {
    scale?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    offset?: { x: number; y: number; z: number };
  }
): UseCartAssetResult {
  const errorRef = useRef<Error | undefined>(undefined);
  
  // Only attempt to load if URL is provided and valid
  const hasValidUrl = !!(url && url.length > 0);
  
  // Conditionally load GLTF
  let gltf: { scene: THREE.Group } | undefined;
  let gltfError: Error | undefined;
  
  try {
    if (hasValidUrl) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      gltf = useGLTF(url!) as { scene: THREE.Group };
    }
  } catch (error) {
    gltfError = error as Error;
    errorRef.current = gltfError;
    console.error(`Failed to load dynamic asset from ${url}:`, error);
  }
  
  /**
   * Prepare the model with optional transforms.
   */
  const model = useMemo(() => {
    if (!gltf) {
      return undefined;
    }
    
    try {
      // Clone the scene to prevent mutation of cached original
      const clonedScene = gltf.scene.clone(true);
      
      // Create a new group to hold the model with transforms
      const group = new THREE.Group();
      group.name = `dynamic-asset`;
      
      // Apply scale if provided
      if (options?.scale) {
        clonedScene.scale.set(
          options.scale.x,
          options.scale.y,
          options.scale.z
        );
      }
      
      // Apply rotation if provided
      if (options?.rotation) {
        clonedScene.rotation.set(
          options.rotation.x,
          options.rotation.y,
          options.rotation.z
        );
      }
      
      // Apply position offset if provided
      if (options?.offset) {
        clonedScene.position.set(
          options.offset.x,
          options.offset.y,
          options.offset.z
        );
      }
      
      // Add the transformed model to the group
      group.add(clonedScene);
      
      return group;
    } catch (error) {
      errorRef.current = error as Error;
      console.error(`Failed to prepare dynamic asset:`, error);
      return undefined;
    }
  }, [gltf, options?.scale, options?.rotation, options?.offset]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (model) {
        model.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else if (object.material) {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [model]);
  
  return {
    model,
    loading: hasValidUrl && !gltf && !gltfError,
    error: errorRef.current,
    hasAsset: hasValidUrl,
  };
}
