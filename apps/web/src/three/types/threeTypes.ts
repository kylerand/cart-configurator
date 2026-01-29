/**
 * Three.js-specific type definitions.
 * 
 * These types bridge the gap between our domain model (CartConfiguration)
 * and Three.js rendering requirements.
 */

import { MaterialZone, MaterialFinish } from '@cart-configurator/types';
import * as THREE from 'three';

/**
 * Processed material ready for Three.js rendering.
 * Created from configuration material definitions.
 */
export interface ProcessedMaterial {
  zone: MaterialZone;
  color: THREE.Color;
  finish: MaterialFinish;
  material: THREE.Material;
}

/**
 * Material map for quick zone lookups.
 */
export type MaterialMap = Map<MaterialZone, ProcessedMaterial>;

/**
 * Scene configuration for consistent setup.
 */
export interface SceneConfig {
  camera: {
    position: [number, number, number];
    fov: number;
    near: number;
    far: number;
  };
  lights: {
    ambient: {
      intensity: number;
      color: string;
    };
    directional: {
      intensity: number;
      position: [number, number, number];
      castShadow: boolean;
    };
  };
  environment: {
    background: string;
    fog: boolean;
  };
  debug: {
    showAxes: boolean;
    showGrid: boolean;
    showBounds: boolean;
  };
}

/**
 * Cart dimensions in meters.
 * These define the overall scale and proportions of the cart.
 * When real models are loaded, these serve as reference dimensions.
 */
export const CART_DIMENSIONS = {
  // Overall cart envelope
  length: 2.4,      // Front to back (meters)
  width: 1.2,       // Side to side (meters)
  height: 1.8,      // Ground to roof (meters)
  
  // Chassis
  chassisHeight: 0.15,
  chassisGroundClearance: 0.08,
  
  // Wheels
  wheelDiameter: 0.5,
  wheelWidth: 0.2,
  wheelbaseLength: 1.8,  // Front to rear axle
  trackWidth: 1.0,        // Left to right wheel spacing
  
  // Seats
  seatHeight: 0.4,
  seatWidth: 1.0,
  seatDepth: 0.5,
  seatElevation: 0.3,     // Above chassis
  
  // Roof
  roofHeight: 0.08,
  roofElevation: 1.7,     // Above ground
  roofOverhang: 0.1,
  
  // Rear module (storage/cargo)
  rearModuleHeight: 0.3,
  rearModuleDepth: 0.4,
} as const;

/**
 * Visual styling constants for placeholder geometry.
 * These ensure consistency across all subassemblies.
 */
export const VISUAL_CONSTANTS = {
  // Default material properties
  defaultMetalness: 0.5,
  defaultRoughness: 0.5,
  
  // Lighting indicator properties
  lightEmissiveIntensity: 0.8,
  lightGlowRadius: 0.08,
  
  // Debug visualization
  boundingBoxColor: 0xff00ff,
  boundingBoxOpacity: 0.2,
} as const;
