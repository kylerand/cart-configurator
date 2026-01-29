/**
 * Seats subassembly component.
 * 
 * Renders seating based on selected option (standard bench, captain seats,
 * or premium suspension seats).
 * 
 * Rendering strategy: Attempts to load GLTF asset based on selected seating option,
 * falls back to placeholder geometry if unavailable.
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import { OptionId } from '@cart-configurator/types';
import { CART_DIMENSIONS } from '../types/threeTypes';
import { SubassemblyId, useCartAsset, getAssetMetadata } from '../assets';
import { applyMaterialsToModel } from '../utils';
import type { MaterialMap } from '../types/threeTypes';

interface SeatsProps {
  /**
   * Selected seating option ID (e.g., 'seat-standard', 'seat-captain', 'seat-premium').
   */
  selectedSeatOption: OptionId | null;
  
  /**
   * Material for seat surfaces.
   * Typically uses SEATS zone material (vinyl/fabric).
   */
  seatMaterial: THREE.Material;
  
  /**
   * Complete material map for GLTF material application.
   */
  materialMap?: MaterialMap;
}

export function Seats({ selectedSeatOption, seatMaterial, materialMap }: SeatsProps) {
  if (!selectedSeatOption) {
    return null;
  }
  
  // Map option ID to asset ID
  const assetId = getAssetIdForSeatOption(selectedSeatOption);
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
      <group name="seats">
        <primitive object={asset.model} />
      </group>
    );
  }
  
  // Fallback to placeholder geometry
  return (
    <SeatsPlaceholder 
      seatMaterial={seatMaterial}
      selectedSeatOption={selectedSeatOption}
    />
  );
}

/**
 * Maps seat option ID to asset registry ID.
 */
function getAssetIdForSeatOption(optionId: OptionId): SubassemblyId {
  if (optionId === 'seat-captain') {
    return SubassemblyId.SEATS_CAPTAIN;
  }
  if (optionId === 'seat-premium') {
    return SubassemblyId.SEATS_PREMIUM;
  }
  return SubassemblyId.SEATS_STANDARD;
}

/**
 * Placeholder seats geometry.
 */
interface SeatsPlaceholderProps {
  seatMaterial: THREE.Material;
  selectedSeatOption: OptionId;
}

function SeatsPlaceholder({ seatMaterial, selectedSeatOption }: SeatsPlaceholderProps) {
  const seatWidth = CART_DIMENSIONS.seatWidth;
  const seatHeight = CART_DIMENSIONS.seatHeight;
  const seatDepth = CART_DIMENSIONS.seatDepth;
  const seatElevation = CART_DIMENSIONS.seatElevation;
  
  // Seat configuration varies by type
  const isCaptainSeats = selectedSeatOption === 'seat-captain' || 
                         selectedSeatOption === 'seat-premium';
  
  const backrestHeight = selectedSeatOption === 'seat-premium' ? 0.7 : 0.5;
  
  return (
    <group name="seats-placeholder">
      {isCaptainSeats ? (
        // Individual captain seats (2 front, 2 rear)
        <>
          {/* Front seats */}
          <group position={[0, 0, 0.3]}>
            <SeatUnit 
              position={[-0.3, seatElevation, 0]} 
              material={seatMaterial}
              cushionSize={[0.45, seatHeight, seatDepth]}
              backrestHeight={backrestHeight}
            />
            <SeatUnit 
              position={[0.3, seatElevation, 0]} 
              material={seatMaterial}
              cushionSize={[0.45, seatHeight, seatDepth]}
              backrestHeight={backrestHeight}
            />
          </group>
          
          {/* Rear seats */}
          <group position={[0, 0, -0.5]}>
            <SeatUnit 
              position={[-0.3, seatElevation, 0]} 
              material={seatMaterial}
              cushionSize={[0.45, seatHeight, seatDepth]}
              backrestHeight={backrestHeight}
            />
            <SeatUnit 
              position={[0.3, seatElevation, 0]} 
              material={seatMaterial}
              cushionSize={[0.45, seatHeight, seatDepth]}
              backrestHeight={backrestHeight}
            />
          </group>
        </>
      ) : (
        // Bench seats
        <>
          {/* Front bench */}
          <SeatUnit 
            position={[0, seatElevation, 0.3]} 
            material={seatMaterial}
            cushionSize={[seatWidth, seatHeight, seatDepth]}
            backrestHeight={backrestHeight}
          />
          
          {/* Rear bench */}
          <SeatUnit 
            position={[0, seatElevation, -0.5]} 
            material={seatMaterial}
            cushionSize={[seatWidth, seatHeight, seatDepth]}
            backrestHeight={backrestHeight}
          />
        </>
      )}
    </group>
  );
}

/**
 * Individual seat unit (cushion + backrest).
 */
interface SeatUnitProps {
  position: [number, number, number];
  material: THREE.Material;
  cushionSize: [number, number, number];
  backrestHeight: number;
}

function SeatUnit({ position, material, cushionSize, backrestHeight }: SeatUnitProps) {
  const [width, height, depth] = cushionSize;
  
  return (
    <group position={position}>
      {/* Seat cushion */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={cushionSize} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Backrest */}
      <mesh 
        position={[0, height / 2 + backrestHeight / 2, -depth / 2 + 0.05]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, backrestHeight, 0.1]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
