/**
 * Lighting subassembly component.
 * 
 * Renders headlights, taillights, and optional lighting accessories.
 * 
 * Future integration: Load light fixture models based on selected lighting
 * options' assetPaths. Real lights should include emissive materials and
 * potentially actual Three.js light sources for illumination.
 */

import * as THREE from 'three';
import { OptionId } from '@cart-configurator/types';
import { CART_DIMENSIONS, VISUAL_CONSTANTS } from '../types/threeTypes';

interface LightingProps {
  /**
   * Array of selected lighting option IDs.
   */
  selectedLightingOptions: OptionId[];
}

export function Lighting({ selectedLightingOptions }: LightingProps) {
  const hasLighting = selectedLightingOptions.some(id => 
    id.startsWith('light-')
  );
  
  const hasLightBar = selectedLightingOptions.includes('light-bar');
  const isPremium = selectedLightingOptions.includes('light-premium');
  
  const frontZ = CART_DIMENSIONS.length / 2;
  const rearZ = -CART_DIMENSIONS.length / 2;
  const width = CART_DIMENSIONS.width;
  const lightElevation = 0.3;
  const lightRadius = VISUAL_CONSTANTS.lightGlowRadius;
  
  // Emissive material for light glow
  const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffee,
    emissive: 0xffffee,
    emissiveIntensity: VISUAL_CONSTANTS.lightEmissiveIntensity,
  });
  
  const taillightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: VISUAL_CONSTANTS.lightEmissiveIntensity,
  });
  
  return (
    <group name="lighting">
      {hasLighting && (
        <>
          {/* Headlights */}
          <mesh position={[-width / 2 + 0.1, lightElevation, frontZ - 0.05]}>
            <sphereGeometry args={[lightRadius, 16, 16]} />
            <primitive object={headlightMaterial} attach="material" />
          </mesh>
          <mesh position={[width / 2 - 0.1, lightElevation, frontZ - 0.05]}>
            <sphereGeometry args={[lightRadius, 16, 16]} />
            <primitive object={headlightMaterial} attach="material" />
          </mesh>
          
          {/* Taillights */}
          <mesh position={[-width / 2 + 0.1, lightElevation, rearZ + 0.05]}>
            <sphereGeometry args={[lightRadius * 0.7, 16, 16]} />
            <primitive object={taillightMaterial} attach="material" />
          </mesh>
          <mesh position={[width / 2 - 0.1, lightElevation, rearZ + 0.05]}>
            <sphereGeometry args={[lightRadius * 0.7, 16, 16]} />
            <primitive object={taillightMaterial} attach="material" />
          </mesh>
          
          {/* Premium underbody lighting */}
          {isPremium && (
            <group>
              {/* Underbody glow strips (decorative) */}
              <mesh position={[-width / 2 + 0.05, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, CART_DIMENSIONS.length - 0.4, 8]} />
                <meshStandardMaterial 
                  color={0x00ffff}
                  emissive={0x00ffff}
                  emissiveIntensity={0.5}
                />
              </mesh>
              <mesh position={[width / 2 - 0.05, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, CART_DIMENSIONS.length - 0.4, 8]} />
                <meshStandardMaterial 
                  color={0x00ffff}
                  emissive={0x00ffff}
                  emissiveIntensity={0.5}
                />
              </mesh>
            </group>
          )}
        </>
      )}
      
      {/* Roof light bar */}
      {hasLightBar && (
        <group position={[0, CART_DIMENSIONS.roofElevation + 0.15, 0]}>
          {/* Light bar housing */}
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.08, 0.12]} />
            <meshStandardMaterial color={0x1a1a1a} metalness={0.8} roughness={0.2} />
          </mesh>
          
          {/* Light bar LEDs */}
          <mesh position={[0, 0, 0.065]}>
            <boxGeometry args={[0.75, 0.06, 0.01]} />
            <meshStandardMaterial 
              color={0xffffee}
              emissive={0xffffee}
              emissiveIntensity={VISUAL_CONSTANTS.lightEmissiveIntensity}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
