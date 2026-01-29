/**
 * Wheels subassembly component.
 * 
 * Renders four wheels positioned at the cart's corners. The wheel style
 * (standard, chrome, off-road) is determined by which wheel option is selected.
 * 
 * Rendering strategy: Attempts to load GLTF asset based on selected wheel option,
 * falls back to placeholder geometry if unavailable.
 * 
 * Material application: For GLTF models, materials are applied via name patterns.
 * Tire material is always overridden to black rubber.
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import { OptionId } from '@cart-configurator/types';
import { CART_DIMENSIONS } from '../types/threeTypes';
import { SubassemblyId, useCartAsset, getAssetMetadata } from '../assets';
import { applyMaterialsToModel, createMaterialOverrides } from '../utils';
import type { MaterialMap } from '../types/threeTypes';

interface WheelsProps {
  /**
   * Selected wheel option ID (e.g., 'wheels-standard', 'wheels-chrome').
   * Determines which wheel model to display.
   */
  selectedWheelOption: OptionId | null;
  
  /**
   * Material for wheel rim/metal parts.
   */
  metalMaterial: THREE.Material;
  
  /**
   * Complete material map for GLTF material application.
   */
  materialMap?: MaterialMap;
}

export function Wheels({ selectedWheelOption, metalMaterial, materialMap }: WheelsProps) {
  if (!selectedWheelOption) {
    return null;
  }
  
  // Map option ID to asset ID
  const assetId = getAssetIdForWheelOption(selectedWheelOption);
  const asset = useCartAsset(assetId);
  const metadata = getAssetMetadata(assetId);
  
  // Tire material override (always black rubber)
  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
  });
  
  // Apply materials to loaded model
  useEffect(() => {
    if (asset.model && materialMap && metadata) {
      const overrides = createMaterialOverrides({
        'Tire': tireMaterial,
        'tire': tireMaterial,
        'Tyre': tireMaterial,
        'tyre': tireMaterial,
      });
      
      applyMaterialsToModel(
        asset.model,
        materialMap,
        metadata.materialMapping,
        { customMaterials: overrides }
      );
    }
  }, [asset.model, materialMap, metadata, tireMaterial]);
  
  // Render GLTF models if available
  if (asset.model) {
    return (
      <group name="wheels">
        {getWheelPositions().map((position, index) => (
          <group key={index} position={position}>
            {asset.model && <primitive object={asset.model.clone(true)} />}
          </group>
        ))}
      </group>
    );
  }
  
  // Fallback to placeholder geometry
  return <WheelsPlaceholder metalMaterial={metalMaterial} />;
}

/**
 * Maps wheel option ID to asset registry ID.
 */
function getAssetIdForWheelOption(optionId: OptionId): SubassemblyId {
  if (optionId === 'wheels-chrome') {
    return SubassemblyId.WHEELS_CHROME;
  }
  if (optionId === 'wheels-offroad') {
    return SubassemblyId.WHEELS_OFFROAD;
  }
  return SubassemblyId.WHEELS_STANDARD;
}

/**
 * Returns wheel positions for all four corners.
 */
function getWheelPositions(): [number, number, number][] {
  const wheelRadius = CART_DIMENSIONS.wheelDiameter / 2;
  const wheelbaseHalf = CART_DIMENSIONS.wheelbaseLength / 2;
  const trackHalf = CART_DIMENSIONS.trackWidth / 2;
  const wheelElevation = wheelRadius;
  
  return [
    [-trackHalf, wheelElevation, wheelbaseHalf],   // Front left
    [trackHalf, wheelElevation, wheelbaseHalf],    // Front right
    [-trackHalf, wheelElevation, -wheelbaseHalf],  // Rear left
    [trackHalf, wheelElevation, -wheelbaseHalf],   // Rear right
  ];
}

/**
 * Placeholder wheels geometry.
 */
function WheelsPlaceholder({ metalMaterial }: { metalMaterial: THREE.Material }) {
  const wheelRadius = CART_DIMENSIONS.wheelDiameter / 2;
  const wheelWidth = CART_DIMENSIONS.wheelWidth;
  
  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
  });
  
  return (
    <group name="wheels-placeholder">
      {getWheelPositions().map((position, index) => (
        <group 
          key={index} 
          position={position}
          rotation={[0, 0, Math.PI / 2]}
        >
          {/* Tire */}
          <mesh castShadow>
            <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth * 0.7, 24]} />
            <primitive object={tireMaterial} attach="material" />
          </mesh>
          
          {/* Rim (uses metal material from config) */}
          <mesh castShadow>
            <cylinderGeometry args={[wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth * 0.8, 24]} />
            <primitive object={metalMaterial} attach="material" />
          </mesh>
          
          {/* Hub cap center */}
          <mesh position={[0, wheelWidth * 0.45, 0]} castShadow>
            <cylinderGeometry args={[wheelRadius * 0.3, wheelRadius * 0.3, 0.05, 16]} />
            <primitive object={metalMaterial} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
