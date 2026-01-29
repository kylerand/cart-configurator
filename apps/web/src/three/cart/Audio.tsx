/**
 * Audio subassembly component.
 * 
 * Renders speakers and audio equipment based on selected audio options.
 * 
 * Future integration: Load speaker models based on selected audio option's
 * assetPath. Premium audio should show subwoofer and amplifier components.
 */

import * as THREE from 'three';
import { OptionId } from '@cart-configurator/types';
import { CART_DIMENSIONS } from '../types/threeTypes';

interface AudioProps {
  /**
   * Array of selected audio/electronics option IDs.
   */
  selectedAudioOptions: OptionId[];
}

export function Audio({ selectedAudioOptions }: AudioProps) {
  const hasAudio = selectedAudioOptions.some(id => id.startsWith('audio-'));
  const isPremiumAudio = selectedAudioOptions.includes('audio-premium');
  
  if (!hasAudio) {
    return null;
  }
  
  const roofElevation = CART_DIMENSIONS.roofElevation;
  const width = CART_DIMENSIONS.width;
  
  const speakerMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.6,
    roughness: 0.3,
  });
  
  const speakerConeMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.7,
  });
  
  return (
    <group name="audio">
      {/* Front speakers (mounted on roof supports) */}
      <group position={[0, roofElevation - 0.3, 0.5]}>
        <Speaker 
          position={[-width / 2 + 0.1, 0, 0]}
          speakerMaterial={speakerMaterial}
          coneMaterial={speakerConeMaterial}
          size={isPremiumAudio ? 0.15 : 0.1}
        />
        <Speaker 
          position={[width / 2 - 0.1, 0, 0]}
          speakerMaterial={speakerMaterial}
          coneMaterial={speakerConeMaterial}
          size={isPremiumAudio ? 0.15 : 0.1}
        />
      </group>
      
      {/* Rear speakers */}
      <group position={[0, roofElevation - 0.3, -0.5]}>
        <Speaker 
          position={[-width / 2 + 0.1, 0, 0]}
          speakerMaterial={speakerMaterial}
          coneMaterial={speakerConeMaterial}
          size={isPremiumAudio ? 0.15 : 0.1}
        />
        <Speaker 
          position={[width / 2 - 0.1, 0, 0]}
          speakerMaterial={speakerMaterial}
          coneMaterial={speakerConeMaterial}
          size={isPremiumAudio ? 0.15 : 0.1}
        />
      </group>
      
      {/* Premium audio subwoofer (under seat) */}
      {isPremiumAudio && (
        <group position={[0, CART_DIMENSIONS.seatElevation - 0.15, 0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.25, 0.3]} />
            <primitive object={speakerMaterial} attach="material" />
          </mesh>
          
          {/* Subwoofer cone */}
          <mesh position={[0, 0, 0.16]}>
            <cylinderGeometry args={[0.12, 0.1, 0.05, 24]} />
            <primitive object={speakerConeMaterial} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Individual speaker unit.
 */
interface SpeakerProps {
  position: [number, number, number];
  speakerMaterial: THREE.Material;
  coneMaterial: THREE.Material;
  size: number;
}

function Speaker({ position, speakerMaterial, coneMaterial, size }: SpeakerProps) {
  return (
    <group position={position}>
      {/* Speaker housing */}
      <mesh castShadow>
        <cylinderGeometry args={[size, size, size * 0.4, 16]} />
        <primitive object={speakerMaterial} attach="material" />
      </mesh>
      
      {/* Speaker cone */}
      <mesh position={[0, size * 0.25, 0]}>
        <cylinderGeometry args={[size * 0.7, size * 0.6, 0.02, 16]} />
        <primitive object={coneMaterial} attach="material" />
      </mesh>
    </group>
  );
}
