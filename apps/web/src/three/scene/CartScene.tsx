/**
 * CartScene component - the main Three.js scene container.
 * 
 * This component owns the Canvas and establishes the rendering context for
 * the entire 3D scene. It provides:
 * - Camera setup
 * - Lighting configuration
 * - Environment settings
 * - Debug helpers (optional)
 * - The CartRoot component mounting point
 * 
 * Architecture note: This component is purely presentational for the 3D scene.
 * All configuration state comes from props - no direct store access here.
 * This keeps the 3D rendering layer decoupled from state management.
 * 
 * Performance considerations:
 * - Canvas is configured for shadows
 * - OrbitControls allow user camera manipulation
 * - Scene is optimized for real-time interaction
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { CartConfiguration, Material as ConfigMaterial, ConfigOption, Platform } from '@cart-configurator/types';
import { CartRoot } from '../cart/CartRoot';
import { SceneConfig } from '../types/threeTypes';

interface CartSceneProps {
  /**
   * Current cart configuration to render.
   */
  configuration: CartConfiguration;
  
  /**
   * Complete material catalog for material resolution.
   */
  allMaterials: ConfigMaterial[];
  
  /**
   * Complete option catalog for option resolution.
   */
  allOptions: ConfigOption[];
  
  /**
   * Current platform with asset path info.
   */
  platform?: Platform | null;
  
  /**
   * Enable debug helpers (axes, grid highlights, bounds).
   * Default: false
   */
  debug?: boolean;
}

/**
 * Default scene configuration.
 * These values provide a good viewing angle and lighting for the cart.
 */
const DEFAULT_SCENE_CONFIG: SceneConfig = {
  camera: {
    position: [3.5, 2.5, 3.5],
    fov: 50,
    near: 0.1,
    far: 1000,
  },
  lights: {
    ambient: {
      intensity: 0.6,
      color: '#ffffff',
    },
    directional: {
      intensity: 1.0,
      position: [5, 8, 5],
      castShadow: true,
    },
  },
  environment: {
    background: '#f5f5f5',
    fog: false,
  },
  debug: {
    showAxes: false,
    showGrid: true,
    showBounds: false,
  },
};

export function CartScene({ 
  configuration, 
  allMaterials, 
  allOptions,
  platform,
  debug = false 
}: CartSceneProps) {
  const config = DEFAULT_SCENE_CONFIG;
  const debugConfig = { ...config.debug, showAxes: debug, showBounds: debug };
  
  return (
    <div style={{ width: '100%', height: '100%', background: config.environment.background }}>
      <Canvas
        camera={{
          position: config.camera.position,
          fov: config.camera.fov,
          near: config.camera.near,
          far: config.camera.far,
        }}
        shadows
      >
        {/* Lighting setup */}
        <ambientLight 
          intensity={config.lights.ambient.intensity} 
          color={config.lights.ambient.color}
        />
        
        <directionalLight
          position={config.lights.directional.position}
          intensity={config.lights.directional.intensity}
          castShadow={config.lights.directional.castShadow}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Environment and helpers */}
        {debugConfig.showGrid && (
          <Grid 
            infiniteGrid 
            cellSize={0.5} 
            cellThickness={0.5}
            sectionSize={2}
            sectionThickness={1}
            fadeDistance={30}
            fadeStrength={1}
          />
        )}
        
        {debugConfig.showAxes && <axesHelper args={[2]} />}
        
        {/* Subtle environment lighting */}
        <Environment preset="city" />
        
        {/* Camera controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0.5, 0]}
        />
        
        {/* The cart itself */}
        <CartRoot 
          configuration={configuration}
          allMaterials={allMaterials}
          allOptions={allOptions}
          platformAssetUrl={platform?.defaultAssetPath}
        />
      </Canvas>
    </div>
  );
}
