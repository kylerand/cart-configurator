/**
 * RearModule subassembly component.
 * 
 * Handles rear cargo/storage options like baskets and bed liners.
 * 
 * Rendering strategy: Attempts to load GLTF assets for selected storage options,
 * falls back to placeholder geometry if unavailable.
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import { OptionId } from '@cart-configurator/types';
import { CART_DIMENSIONS } from '../types/threeTypes';
import { SubassemblyId, useCartAsset, getAssetMetadata } from '../assets';
import { applyMaterialsToModel } from '../utils';
import type { MaterialMap } from '../types/threeTypes';

interface RearModuleProps {
  /**
   * Array of selected storage/rear option IDs.
   */
  selectedStorageOptions: OptionId[];
  
  /**
   * Material for metal parts (basket frame, etc.).
   */
  metalMaterial: THREE.Material;
  
  /**
   * Complete material map for GLTF material application.
   */
  materialMap?: MaterialMap;
}

export function RearModule({ selectedStorageOptions, metalMaterial, materialMap }: RearModuleProps) {
  const hasRearBasket = selectedStorageOptions.includes('storage-rear-basket');
  
  // Load basket asset if selected
  const basketAsset = useCartAsset(SubassemblyId.STORAGE_BASKET);
  const basketMetadata = getAssetMetadata(SubassemblyId.STORAGE_BASKET);
  
  // Apply materials to loaded model
  useEffect(() => {
    if (basketAsset.model && materialMap && basketMetadata) {
      applyMaterialsToModel(
        basketAsset.model,
        materialMap,
        basketMetadata.materialMapping
      );
    }
  }, [basketAsset.model, materialMap, basketMetadata]);
  
  if (!hasRearBasket) {
    return null;
  }
  
  // Render GLTF model if available
  if (basketAsset.model) {
    return (
      <group name="rear-module">
        <primitive object={basketAsset.model} />
      </group>
    );
  }
  
  // Fallback to placeholder geometry
  return <RearModulePlaceholder metalMaterial={metalMaterial} />;
}

/**
 * Placeholder rear module geometry.
 */
function RearModulePlaceholder({ metalMaterial }: { metalMaterial: THREE.Material }) {
  const moduleHeight = CART_DIMENSIONS.rearModuleHeight;
  const moduleDepth = CART_DIMENSIONS.rearModuleDepth;
  const moduleWidth = CART_DIMENSIONS.width - 0.1;
  const rearPosition = -CART_DIMENSIONS.length / 2 - moduleDepth / 2;
  const moduleElevation = CART_DIMENSIONS.chassisGroundClearance + 
                          CART_DIMENSIONS.chassisHeight;
  
  return (
    <group name="rear-module-placeholder">
      <group position={[0, moduleElevation + moduleHeight / 2, rearPosition]}>
        {/* Basket frame */}
        <mesh castShadow>
          <boxGeometry args={[moduleWidth, moduleHeight, moduleDepth]} />
          <meshStandardMaterial 
            color={0x333333}
            metalness={0.6}
            roughness={0.4}
            wireframe={true}
          />
        </mesh>
        
        {/* Basket base */}
        <mesh position={[0, -moduleHeight / 2 + 0.02, 0]} receiveShadow>
          <boxGeometry args={[moduleWidth - 0.02, 0.03, moduleDepth - 0.02]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>
        
        {/* Support arms */}
        {[
          [-moduleWidth / 2, 0, moduleDepth / 2],
          [moduleWidth / 2, 0, moduleDepth / 2],
        ].map((position, index) => (
          <mesh 
            key={index}
            position={position as [number, number, number]}
            castShadow
          >
            <cylinderGeometry args={[0.02, 0.02, moduleHeight * 1.5, 8]} />
            <primitive object={metalMaterial} attach="material" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
