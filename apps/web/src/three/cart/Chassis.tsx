/**
 * Chassis subassembly component.
 * 
 * The chassis is the structural base of the cart. It includes the frame,
 * floor, and mounting points for other subassemblies.
 * 
 * Rendering strategy: 
 * 1. If dynamicAssetUrl is provided, load from that URL
 * 2. Otherwise, attempt to load from static asset registry
 * 3. Falls back to placeholder geometry if no asset is available
 * 
 * Material application: For GLTF models, materials are applied based on
 * mesh name patterns defined in assetRegistry. For placeholders, materials
 * are applied directly via props.
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import { CART_DIMENSIONS } from '../types/threeTypes';
import { SubassemblyId, useCartAsset, useDynamicAsset, getAssetMetadata } from '../assets';
import { applyMaterialsToModel } from '../utils';
import type { MaterialMap } from '../types/threeTypes';

interface ChassisProps {
  /**
   * Material to apply to chassis body.
   * For placeholders: applied directly.
   * For GLTF models: applied via material mapping.
   */
  material: THREE.Material;
  
  /**
   * Complete material map for GLTF material application.
   * Only used when GLTF asset is loaded.
   */
  materialMap?: MaterialMap;
  
  /**
   * Dynamic asset URL from platform configuration.
   * If provided, takes priority over static registry.
   */
  dynamicAssetUrl?: string;
}

export function Chassis({ material, materialMap, dynamicAssetUrl }: ChassisProps) {
  // Try dynamic asset first (from platform's defaultAssetPath)
  const dynamicAsset = useDynamicAsset(dynamicAssetUrl);
  
  // Fall back to static registry asset
  const staticAsset = useCartAsset(SubassemblyId.CHASSIS);
  const metadata = getAssetMetadata(SubassemblyId.CHASSIS);
  
  // Use dynamic asset if available, otherwise static
  const asset = dynamicAsset.hasAsset ? dynamicAsset : staticAsset;
  
  // Apply materials to loaded model
  useEffect(() => {
    if (asset.model && materialMap && metadata) {
      applyMaterialsToModel(
        asset.model,
        materialMap,
        metadata.materialMapping
      );
    }
  }, [asset.model, materialMap, metadata]);
  
  // Show loading state
  if (asset.loading) {
    return null; // Or a loading placeholder
  }
  
  // Render GLTF model if available
  if (asset.model) {
    return (
      <group name="chassis">
        <primitive object={asset.model} />
      </group>
    );
  }
  
  // Fallback to placeholder geometry
  return <ChassisPlaceholder material={material} />;
}

/**
 * Placeholder chassis geometry.
 * Used when GLTF asset is not available.
 */
function ChassisPlaceholder({ material }: { material: THREE.Material }) {
  const chassisWidth = CART_DIMENSIONS.width;
  const chassisLength = CART_DIMENSIONS.length;
  const chassisHeight = CART_DIMENSIONS.chassisHeight;
  const elevation = CART_DIMENSIONS.chassisGroundClearance;
  
  return (
    <group name="chassis-placeholder">
      {/* Main chassis body */}
      <mesh 
        position={[0, elevation + chassisHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[chassisWidth, chassisHeight, chassisLength]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Frame rails (visual detail) */}
      <mesh 
        position={[-chassisWidth / 2 + 0.05, elevation, chassisLength / 4]}
        castShadow
      >
        <boxGeometry args={[0.08, 0.08, chassisLength / 2]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      <mesh 
        position={[chassisWidth / 2 - 0.05, elevation, chassisLength / 4]}
        castShadow
      >
        <boxGeometry args={[0.08, 0.08, chassisLength / 2]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
