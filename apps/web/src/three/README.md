# Three.js Scene Architecture Documentation

## Overview

This document describes the configuration-driven Three.js scene architecture for the Golf Cart Configurator. The system is designed to render a fully customizable 3D golf cart that updates in real-time as the user modifies their configuration.

## Architecture Principles

### 1. Configuration-Driven Rendering
- **All visual state flows from CartConfiguration**
- No imperative scene mutations
- React's declarative model drives Three.js updates
- Configuration changes trigger automatic re-renders

### 2. Clean Separation of Concerns
- **Scene layer**: Canvas, camera, lights, environment
- **Cart layer**: Subassembly components
- **Material layer**: Material creation and management
- **Type layer**: Shared type definitions and constants

### 3. Placeholder-to-Asset Pipeline
- Current: Placeholder primitives (boxes, cylinders, spheres)
- Future: GLTF models loaded via `assetPath` from options
- Components designed for easy asset swapping

### 4. Performance Optimization
- Materials memoized and reused
- Geometry created once per component
- Shadow casting enabled selectively
- OrbitControls with damping for smooth interaction

## Directory Structure

```
/apps/web/src/three/
├── scene/
│   ├── CartScene.tsx          # Main Canvas and scene setup
│   └── index.ts               # Barrel export
├── cart/
│   ├── CartRoot.tsx           # Root cart assembly
│   ├── Chassis.tsx            # Chassis subassembly
│   ├── Wheels.tsx             # Wheels subassembly
│   ├── Roof.tsx               # Roof subassembly
│   ├── Seats.tsx              # Seats subassembly
│   ├── RearModule.tsx         # Rear storage subassembly
│   ├── Lighting.tsx           # Lighting subassembly
│   ├── Audio.tsx              # Audio subassembly
│   └── index.ts               # Barrel export
├── materials/
│   ├── materialFactory.ts     # Material creation utilities
│   └── index.ts               # Barrel export
├── types/
│   ├── threeTypes.ts          # Three.js type definitions
│   └── index.ts               # Barrel export
└── index.ts                   # Main barrel export
```

## Component Hierarchy

```
CartScene (Canvas owner)
└── CartRoot (configuration processor)
    ├── Chassis (always present)
    ├── Wheels (always present)
    ├── Roof (always present)
    ├── Seats (always present)
    ├── RearModule (conditional)
    ├── Lighting (conditional)
    └── Audio (conditional)
```

## Key Components

### CartScene
**Purpose**: Owns the Three.js Canvas and establishes rendering context

**Responsibilities**:
- Canvas configuration (camera, shadows, tone mapping)
- Lighting setup (ambient + directional)
- Environment configuration
- OrbitControls mounting
- Debug helper toggling

**Props**:
```typescript
{
  configuration: CartConfiguration;
  allMaterials: ConfigMaterial[];
  allOptions: ConfigOption[];
  debug?: boolean;
}
```

**Configuration**:
- Camera: FOV 50, positioned at [3.5, 2.5, 3.5]
- Ambient light: 0.6 intensity (soft fill)
- Directional light: 1.0 intensity with shadows
- Shadow map: 2048x2048 resolution
- OrbitControls: damped, limited polar angle

### CartRoot
**Purpose**: Processes configuration and orchestrates subassemblies

**Responsibilities**:
- Material map creation from configuration
- Option categorization for easy lookup
- Material-to-zone assignment
- Subassembly data preparation
- Cleanup on unmount

**Architecture Note**: This component acts as the adapter between domain model (CartConfiguration) and rendering model (Three.js components). It shields subassemblies from configuration complexity.

**Data Flow**:
```
CartConfiguration 
  → Material map created
  → Options categorized by type
  → Materials assigned to zones
  → Data passed to subassemblies
```

### Subassemblies

Each subassembly follows the same pattern:

**Structure**:
```typescript
interface XxxProps {
  // Only the data this component needs
  selectedOption: OptionId | null;
  material: THREE.Material;
}

export function Xxx({ selectedOption, material }: XxxProps) {
  // Conditional rendering based on selection
  if (!selectedOption) return null;
  
  // Placeholder geometry
  return (
    <group name="xxx">
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
```

**Design Goals**:
- Single responsibility (one cart section)
- Minimal props (no configuration object)
- Named group root (for debugging)
- Material via primitive object (reuse)
- Conditional rendering (option-dependent)

## Material System

### Material Factory
**Location**: `materials/materialFactory.ts`

**Purpose**: Translates domain materials into Three.js materials

**Functions**:

1. **processMaterial(material)**: ConfigMaterial → ProcessedMaterial
2. **createMaterialMap(selections, catalog)**: MaterialSelection[] → MaterialMap
3. **getMaterialForZone(map, zone)**: Retrieve material with fallback
4. **createDefaultMaterialMap()**: Sensible defaults when nothing selected
5. **disposeMaterialMap(map)**: Cleanup to prevent memory leaks

**Material Finish Mapping**:
```typescript
GLOSS     → metalness: 0.1, roughness: 0.2
MATTE     → metalness: 0.0, roughness: 0.9
METALLIC  → metalness: 0.9, roughness: 0.3
SATIN     → metalness: 0.2, roughness: 0.5
```

**Material Zones**:
- BODY: Chassis, body panels
- SEATS: Upholstery, cushions
- ROOF: Roof surface
- METAL: Rims, accents, supports
- GLASS: Windows, windshield (when added)

### Material Lifecycle
```
1. User selects material in UI
2. Configuration.materialSelections updated
3. CartRoot receives new configuration
4. useMemo triggers material map regeneration
5. New materials passed to subassemblies
6. React updates Three.js materials
7. Scene re-renders with new materials
```

## Dimensions and Constants

### CART_DIMENSIONS
**Location**: `types/threeTypes.ts`

All measurements in meters. These define the cart's physical envelope:

```typescript
{
  length: 2.4,                    // Front to back
  width: 1.2,                     // Side to side
  height: 1.8,                    // Ground to roof
  
  chassisHeight: 0.15,
  chassisGroundClearance: 0.08,
  
  wheelDiameter: 0.5,
  wheelWidth: 0.2,
  wheelbaseLength: 1.8,           // Axle spacing
  trackWidth: 1.0,                // Wheel spacing
  
  seatHeight: 0.4,
  seatWidth: 1.0,
  seatDepth: 0.5,
  seatElevation: 0.3,
  
  roofHeight: 0.08,
  roofElevation: 1.7,
  roofOverhang: 0.1,
  
  rearModuleHeight: 0.3,
  rearModuleDepth: 0.4,
}
```

**Why These Matter**:
- Real GLTF models must match these dimensions
- Consistent scale across all subassemblies
- Easy to adjust entire cart scale
- Reference for collision bounds (future)

### VISUAL_CONSTANTS
Visual styling for placeholders:

```typescript
{
  defaultMetalness: 0.5,
  defaultRoughness: 0.5,
  lightEmissiveIntensity: 0.8,
  lightGlowRadius: 0.08,
  boundingBoxColor: 0xff00ff,
  boundingBoxOpacity: 0.2,
}
```

## Subassembly Details

### Chassis
**Placeholder**: Box geometry representing frame
**Material**: BODY zone
**Features**:
- Main body box
- Frame rail details (left/right)
- Ground clearance elevation

**Future**: Load platform GLTF from `platform.defaultAssetPath`

### Wheels
**Placeholder**: Cylinders for tires and rims
**Material**: METAL zone (rims), black rubber (tires)
**Features**:
- Four corner-positioned wheels
- Separate tire and rim geometry
- Hub cap centers
- Proper rotation (parallel to ground)

**Future**: Load wheel GLTF from `wheelOption.assetPath`

### Roof
**Placeholder**: Box with support posts
**Material**: ROOF zone
**Features**:
- Extends based on option (standard/extended)
- Solar panels (if solar option selected)
- Four corner support posts

**Future**: Load roof GLTF from `roofOption.assetPath`

### Seats
**Placeholder**: Boxes for cushion and backrest
**Material**: SEATS zone
**Features**:
- Bench or captain configuration
- Variable backrest height (premium taller)
- Front and rear seating
- Individual seat units

**Future**: Load seat GLTF from `seatOption.assetPath`

### RearModule
**Placeholder**: Wireframe basket
**Material**: METAL zone
**Features**:
- Rear cargo basket (if selected)
- Support arms
- Positioned behind rear seats

**Future**: Load storage GLTF from `storageOption.assetPath`

### Lighting
**Placeholder**: Emissive spheres and cylinders
**Material**: Built-in emissive materials
**Features**:
- Headlights (front corners)
- Taillights (rear corners)
- Underbody glow (premium)
- Roof light bar (if selected)
- Actual emissive glow

**Future**: Load light fixture GLTFs, add actual light sources

### Audio
**Placeholder**: Cylinders for speakers, boxes for subs
**Material**: Dark metal
**Features**:
- Four corner speakers
- Subwoofer (if premium)
- Speaker cone details
- Size varies by option

**Future**: Load speaker GLTFs from `audioOption.assetPath`

## Configuration Reactivity

### How Updates Flow

1. **User action** (clicks "Add Option")
2. **Zustand store** validates and updates configuration
3. **ConfiguratorPage** receives new configuration
4. **CartScene** receives configuration as prop
5. **CartRoot** receives configuration
   - useMemo recalculates material map
   - useMemo recategorizes options
6. **Subassemblies** receive new data
7. **React Three Fiber** updates Three.js scene
8. **Three.js** renders new frame

### Example: Changing Seat Material

```
User selects "Tan Vinyl" for seats
↓
Store: setMaterialSelection({ zone: SEATS, materialId: "vinyl-tan" })
↓
Configuration updated with new materialSelection
↓
CartRoot useMemo triggers:
  - materialMap regenerated
  - getMaterialForZone(SEATS) returns tan vinyl material
↓
Seats component receives new seatMaterial prop
↓
React detects material change
↓
Three.js updates mesh material
↓
Scene re-renders with tan seats
```

### Performance Notes

- Material maps are memoized (only recalc on selection change)
- Option categorization is memoized (only recalc on option change)
- Three.js materials are reused across meshes
- Geometry is static (doesn't rebuild each frame)
- React Three Fiber handles efficient updates

## Future: GLTF Asset Integration

### Current State
Each subassembly renders placeholder primitives.

### Migration Path

**Step 1**: Create GLTF loader utility
```typescript
function useGLTF(assetPath: string | null) {
  // Load model, cache, handle errors
  return model;
}
```

**Step 2**: Update subassembly to use loader
```typescript
export function Wheels({ selectedWheelOption, metalMaterial }) {
  const option = allOptions.find(o => o.id === selectedWheelOption);
  const model = useGLTF(option?.assetPath);
  
  if (!model) {
    // Show placeholder while loading
    return <PlaceholderWheels />;
  }
  
  // Apply materials to model
  applyMaterialToModel(model, metalMaterial);
  
  return <primitive object={model} />;
}
```

**Step 3**: Material application to GLTF
```typescript
function applyMaterialToModel(model, material) {
  model.traverse((child) => {
    if (child.isMesh && child.name.includes('rim')) {
      child.material = material;
    }
  });
}
```

### Asset Requirements

Each GLTF model must:
- Be centered at origin
- Match CART_DIMENSIONS scale
- Have named meshes for material application
- Include proper UV mapping
- Be optimized (< 50k triangles per model)

**Example Naming Convention**:
```
wheels-chrome.glb
  └── RootNode
      ├── TireMesh (gets tire material)
      ├── RimMesh (gets metal material)
      └── HubCapMesh (gets metal material)
```

## Debug Helpers

### Enabling Debug Mode
```typescript
<CartScene 
  configuration={config}
  allMaterials={materials}
  allOptions={options}
  debug={true}  // Shows axes and bounds
/>
```

### Debug Features
- **AxesHelper**: Shows X (red), Y (green), Z (blue) axes
- **Grid**: Infinite grid with 0.5m cells
- **Bounds**: Bounding box visualization (future)

### Development Tips
```typescript
// Inspect scene in browser console
window.scene = canvasRef.current.__r3f.gl.scene;
console.log(window.scene);

// Find mesh by name
window.scene.getObjectByName('chassis');

// Check material
window.scene.getObjectByName('chassis').material;
```

## Common Issues and Solutions

### Materials not updating
**Cause**: Material map not recalculating
**Fix**: Check useMemo dependencies in CartRoot

### Geometry appears black
**Cause**: Missing or incorrect material
**Fix**: Verify getMaterialForZone returns valid material

### Performance issues
**Cause**: Materials recreated each frame
**Fix**: Ensure materials are memoized and reused

### Options not reflected in scene
**Cause**: Option categorization incorrect
**Fix**: Verify option.category matches OptionCategory enum

### Scene not rendering
**Cause**: Configuration or materials null/undefined
**Fix**: Add null checks and loading states

## Testing

### Unit Testing Approach
```typescript
// Test material creation
const material = processMaterial(configMaterial);
expect(material.zone).toBe(MaterialZone.BODY);
expect(material.material).toBeInstanceOf(THREE.Material);

// Test material map
const map = createMaterialMap(selections, catalog);
expect(map.size).toBeGreaterThan(0);
expect(map.has(MaterialZone.BODY)).toBe(true);
```

### Visual Testing
1. Start dev servers
2. Open http://localhost:3000
3. Add options and verify appearance
4. Change materials and verify colors
5. Check shadow casting
6. Test camera controls

### Integration Testing
```typescript
// Test configuration flow
1. Load configurator
2. Add wheel option
3. Verify wheels appear in scene
4. Change wheel material
5. Verify color updates
6. Remove wheel option
7. Verify wheels disappear (if allowed)
```

## Best Practices

### Component Design
✅ DO:
- Keep subassemblies independent
- Pass only necessary props
- Use named groups for debugging
- Handle null/undefined options gracefully
- Use constants for dimensions
- Comment architectural decisions

❌ DON'T:
- Pass entire configuration to subassemblies
- Mutate Three.js objects imperatively
- Use magic numbers
- Create materials inline
- Forget to dispose of materials
- Use `any` types

### Performance
✅ DO:
- Memoize expensive calculations
- Reuse materials across meshes
- Use primitive object for materials
- Enable shadows selectively
- Use LOD for complex models (future)

❌ DON'T:
- Create new materials each frame
- Recreate geometry unnecessarily
- Enable shadows on all objects
- Load models synchronously
- Forget cleanup in useEffect

### Future-Proofing
✅ DO:
- Design for asset swapping
- Use consistent naming conventions
- Document integration points
- Maintain scale consistency
- Plan for animation hooks

❌ DON'T:
- Couple to placeholder geometry
- Hardcode model specifics
- Assume single model per option
- Ignore performance at scale

## Summary

This Three.js architecture provides:

1. **Clean separation**: Scene, cart, materials, types
2. **Configuration-driven**: All state from CartConfiguration
3. **Declarative updates**: React handles Three.js mutations
4. **Easy asset migration**: Placeholders → GLTFs with minimal changes
5. **Performance**: Memoization, material reuse, selective shadows
6. **Maintainability**: Independent subassemblies, clear responsibilities
7. **Extensibility**: Add subassemblies without affecting others

The system is production-ready for placeholder visualization and architected for seamless GLTF model integration when assets become available.
