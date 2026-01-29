/**
 * Roof subassembly component.
 * 
 * The roof provides shade and weather protection. Style varies by option
 * (standard, extended, solar).
 * 
 * Rendering strategy: Attempts to load GLTF asset based on selected roof option,
 * falls back to placeholder geometry if unavailable.
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import { OptionId } from '@cart-configurator/types';
import { CART_DIMENSIONS } from '../types/threeTypes';
import { SubassemblyId, useCartAsset, getAssetMetadata } from '../assets';
import { applyMaterialsToModel } from '../utils';
import type { MaterialMap } from '../types/threeTypes';

interface RoofProps {
  /**
   * Selected roof option ID (e.g., 'roof-standard', 'roof-extended', 'roof-solar').
   */
  selectedRoofOption: OptionId | null;
  
  /**
   * Material for roof surface.
   * Typically uses ROOF zone material.
   */
  roofMaterial: THREE.Material;
  
  /**
   * Complete material map for GLTF material application.
   */
  materialMap?: MaterialMap;
}

export function Roof({ selectedRoofOption, roofMaterial, materialMap }: RoofProps) {
  if (!selectedRoofOption) {
    return null;
  }
  
  // Map option ID to asset ID
  const assetId = getAssetIdForRoofOption(selectedRoofOption);
  const asset = useCartAsset(assetId);
  const metadata = getAssetMetadata(assetId);
  
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
  
  // Render GLTF model if available
  if (asset.model) {
    return (
      <group name="roof">
        <primitive object={asset.model} />
      </group>
    );
  }
  
  // Fallback to placeholder geometry
  return (
    <RoofPlaceholder 
      roofMaterial={roofMaterial}
      selectedRoofOption={selectedRoofOption}
    />
  );
}

/**
 * Maps roof option ID to asset registry ID.
 */
function getAssetIdForRoofOption(optionId: OptionId): SubassemblyId {
  if (optionId === 'roof-extended') {
    return SubassemblyId.ROOF_EXTENDED;
  }
  if (optionId === 'roof-solar') {
    return SubassemblyId.ROOF_SOLAR;
  }
  return SubassemblyId.ROOF_STANDARD;
}

/**
 * Placeholder roof geometry.
 */
interface RoofPlaceholderProps {
  roofMaterial: THREE.Material;
  selectedRoofOption: OptionId;
}

function RoofPlaceholder({ roofMaterial, selectedRoofOption }: RoofPlaceholderProps) {
  const roofWidth = CART_DIMENSIONS.width + CART_DIMENSIONS.roofOverhang * 2;
  const roofHeight = CART_DIMENSIONS.roofHeight;
  const roofElevation = CART_DIMENSIONS.roofElevation;
  
  // Adjust roof length based on option type
  let roofLength = CART_DIMENSIONS.length - 0.2; // Standard
  if (selectedRoofOption === 'roof-extended') {
    roofLength = CART_DIMENSIONS.length + 0.3; // Extended
  }
  
  return (
    <group name="roof-placeholder">
      {/* Main roof panel */}
      <mesh 
        position={[0, roofElevation, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[roofWidth, roofHeight, roofLength]} />
        <primitive object={roofMaterial} attach="material" />
      </mesh>
      
      {/* Support posts */}
      {[
        [-roofWidth / 2 + 0.05, roofElevation / 2, roofLength / 2 - 0.1],
        [roofWidth / 2 - 0.05, roofElevation / 2, roofLength / 2 - 0.1],
        [-roofWidth / 2 + 0.05, roofElevation / 2, -roofLength / 2 + 0.1],
        [roofWidth / 2 - 0.05, roofElevation / 2, -roofLength / 2 + 0.1],
      ].map((position, index) => (
        <mesh 
          key={index}
          position={position as [number, number, number]}
          castShadow
        >
          <cylinderGeometry args={[0.025, 0.025, roofElevation - 0.3, 12]} />
          <meshStandardMaterial color={0x333333} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      
      {/* Solar panels (if solar roof selected) */}
      {selectedRoofOption === 'roof-solar' && (
        <group>
          {/* Solar cell texture placeholder */}
          <mesh position={[0, roofElevation + roofHeight / 2 + 0.01, 0]}>
            <planeGeometry args={[roofWidth - 0.1, roofLength - 0.1]} />
            <meshStandardMaterial 
              color={0x1a2a4a}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
