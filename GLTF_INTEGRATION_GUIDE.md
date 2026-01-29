# GLTF Asset Integration Guide

## Overview

This document describes the production-grade GLTF asset loading system implemented for the Golf Cart Configurator. The system allows cart subassemblies to render either placeholder geometry or loaded GLTF models, driven by a centralized asset registry.

## Architecture

### Core Principles

1. **Configuration-Driven**: Materials and component visibility driven by CartConfiguration
2. **Graceful Degradation**: Falls back to placeholders when assets unavailable
3. **Type Safety**: Strict TypeScript throughout, no `any` types
4. **Centralized Registry**: Single source of truth for asset metadata
5. **Memory Efficient**: Proper cleanup and caching strategies

### File Structure

```
apps/web/src/three/
├── assets/
│   ├── assetRegistry.ts      # Central registry of all GLTF assets
│   ├── useCartAsset.ts        # Hook for loading and preparing assets
│   └── index.ts               # Barrel export
├── cart/
│   ├── Chassis.tsx            # Updated with GLTF support
│   ├── Wheels.tsx             # Updated with GLTF support
│   ├── Roof.tsx               # Updated with GLTF support
│   ├── Seats.tsx              # Updated with GLTF support
│   ├── RearModule.tsx         # Updated with GLTF support
│   └── ...
└── utils/
    ├── applyMaterials.ts      # Material application utilities
    └── index.ts               # Barrel export
```

## Asset Registry

### Purpose

The asset registry (`assetRegistry.ts`) maps logical subassembly identifiers to GLTF asset metadata. This decouples asset loading from component logic.

### SubassemblyId Enum

Defines all possible asset types:

```typescript
export enum SubassemblyId {
  // Core structure
  CHASSIS = 'CHASSIS',
  
  // Wheels (option-dependent)
  WHEELS_STANDARD = 'WHEELS_STANDARD',
  WHEELS_CHROME = 'WHEELS_CHROME',
  WHEELS_OFFROAD = 'WHEELS_OFFROAD',
  
  // Roof (option-dependent)
  ROOF_STANDARD = 'ROOF_STANDARD',
  ROOF_EXTENDED = 'ROOF_EXTENDED',
  ROOF_SOLAR = 'ROOF_SOLAR',
  
  // Seats (option-dependent)
  SEATS_STANDARD = 'SEATS_STANDARD',
  SEATS_CAPTAIN = 'SEATS_CAPTAIN',
  SEATS_PREMIUM = 'SEATS_PREMIUM',
  
  // Accessories
  STORAGE_BASKET = 'STORAGE_BASKET',
  LIGHTING_UNDERGLOW = 'LIGHTING_UNDERGLOW',
  AUDIO_SPEAKERS = 'AUDIO_SPEAKERS',
}
```

### Asset Metadata Interface

```typescript
interface AssetMetadata {
  path: string;                    // Path to GLTF/GLB file
  scale: { x, y, z };              // Normalization scale
  rotation: { x, y, z };           // Orientation (radians)
  materialMapping: MaterialZoneMapping[];
  offset?: { x, y, z };            // Optional position offset
}
```

### Material Zone Mapping

Maps mesh names in GLTF to material zones:

```typescript
interface MaterialZoneMapping {
  pattern: string;                 // Substring to match (case-insensitive)
  zone: MaterialZone;              // Target material zone
}
```

**Example:**

```typescript
materialMapping: [
  { pattern: 'body', zone: MaterialZone.BODY },
  { pattern: 'rim', zone: MaterialZone.METAL },
  { pattern: 'tire', zone: MaterialZone.METAL },
]
```

This maps:
- `BodyMesh`, `Chassis_Body`, `body_panel` → BODY material
- `WheelRim`, `rim_mesh` → METAL material
- `TireMesh`, `Tire_FL` → METAL material

### Adding New Assets

1. **Add to SubassemblyId enum:**

```typescript
export enum SubassemblyId {
  // ... existing
  WINDSHIELD = 'WINDSHIELD',
}
```

2. **Add to ASSET_REGISTRY:**

```typescript
export const ASSET_REGISTRY: Partial<Record<SubassemblyId, AssetMetadata>> = {
  [SubassemblyId.WINDSHIELD]: {
    path: '/assets/gltf/windshield_v1.glb',
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
    materialMapping: [
      { pattern: 'glass', zone: MaterialZone.GLASS },
      { pattern: 'frame', zone: MaterialZone.METAL },
    ],
  },
};
```

3. **Place GLTF file** in `/apps/web/public/assets/gltf/`

4. **No component changes required** - components check registry automatically

## useCartAsset Hook

### Purpose

Loads, clones, and normalizes GLTF assets for rendering.

### Features

- **Automatic Caching**: Uses `@react-three/drei` useGLTF caching
- **Safe Cloning**: Clones loaded models to prevent shared state issues
- **Transform Normalization**: Applies scale, rotation, offset from metadata
- **Memory Management**: Disposes geometries and materials on unmount
- **Feature Flag Support**: Respects `ENABLE_GLTF_ASSETS` flag

### Usage

```typescript
const asset = useCartAsset(SubassemblyId.CHASSIS);

if (asset.model) {
  // Render GLTF
  return <primitive object={asset.model} />;
} else {
  // Render placeholder
  return <ChassisPlaceholder />;
}
```

### Return Value

```typescript
interface CartAssetResult {
  model: THREE.Group | undefined;  // Ready-to-render model (or undefined)
  loading: boolean;                // Loading state
  error: Error | undefined;        // Load error (if any)
}
```

## Material Application

### Purpose

Applies configuration-driven materials to loaded GLTF meshes.

### Strategy

1. Traverse loaded model's scene graph
2. For each mesh, check name against material mappings
3. Apply material from materialMap if pattern matches
4. Support for material overrides (e.g., always-black tires)

### Pattern Matching

- **Case-insensitive substring match**
- First matching pattern wins
- Example: pattern `"rim"` matches `"WheelRim"`, `"rim_mesh"`, `"Rim_Front"`

### Usage in Components

```typescript
const asset = useCartAsset(SubassemblyId.CHASSIS);
const metadata = getAssetMetadata(SubassemblyId.CHASSIS);

useEffect(() => {
  if (asset.model && materialMap && metadata) {
    applyMaterialsToModel(
      asset.model,
      materialMap,
      metadata.materialMapping
    );
  }
}, [asset.model, materialMap, metadata]);
```

### Material Overrides

For parts that should always use specific materials regardless of configuration:

```typescript
const tireOverrides = createMaterialOverrides({
  tire: new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
  }),
});

applyMaterialsToModel(
  asset.model,
  materialMap,
  metadata.materialMapping,
  tireOverrides
);
```

## Component Integration Pattern

All major subassemblies follow this pattern:

### 1. Accept materialMap Prop

```typescript
interface ChassisProps {
  bodyMaterial: THREE.Material;
  metalMaterial: THREE.Material;
  materialMap?: MaterialMap;  // Add this
}
```

### 2. Load Asset and Metadata

```typescript
const asset = useCartAsset(SubassemblyId.CHASSIS);
const metadata = getAssetMetadata(SubassemblyId.CHASSIS);
```

### 3. Apply Materials on Load

```typescript
useEffect(() => {
  if (asset.model && materialMap && metadata) {
    applyMaterialsToModel(
      asset.model,
      materialMap,
      metadata.materialMapping
    );
  }
}, [asset.model, materialMap, metadata]);
```

### 4. Conditional Rendering

```typescript
// Render GLTF if available
if (asset.model) {
  return (
    <group name="chassis">
      <primitive object={asset.model} />
    </group>
  );
}

// Fall back to placeholder
return <ChassisPlaceholder bodyMaterial={bodyMaterial} metalMaterial={metalMaterial} />;
```

### 5. Extract Placeholder to Separate Function

```typescript
function ChassisPlaceholder({ bodyMaterial, metalMaterial }: PlaceholderProps) {
  // Original placeholder geometry logic
  return <group>...</group>;
}
```

## Option-to-Asset Mapping

For components with multiple variants based on options:

### Example: Wheels

```typescript
function getAssetIdForWheelOption(optionId: OptionId): SubassemblyId | undefined {
  switch (optionId) {
    case 'wheels-standard': return SubassemblyId.WHEELS_STANDARD;
    case 'wheels-chrome': return SubassemblyId.WHEELS_CHROME;
    case 'wheels-offroad': return SubassemblyId.WHEELS_OFFROAD;
    default: return undefined;
  }
}

const wheelOption = selectedOptions.find(id => id.startsWith('wheels-'));
const assetId = wheelOption ? getAssetIdForWheelOption(wheelOption) : undefined;
const asset = useCartAsset(assetId);
```

### Instance Management

For components that need multiple copies (e.g., 4 wheels):

```typescript
{getWheelPositions().map((position, index) => (
  <group key={index} position={position}>
    {asset.model && <primitive object={asset.model.clone(true)} />}
  </group>
))}
```

**Important**: Clone with `true` parameter to clone materials as well.

## Feature Flags

### ENABLE_GLTF_ASSETS

Controls whether GLTF loading is enabled:

```typescript
// In assetRegistry.ts
export const ENABLE_GLTF_ASSETS = true;
```

Set to `false` to force all components to use placeholders (useful for testing or low-end devices).

## Debugging Utilities

### getMeshNames

List all mesh names in a loaded model:

```typescript
import { getMeshNames } from '../utils';

const meshNames = getMeshNames(asset.model);
console.log('Available meshes:', meshNames);
```

### validateMaterialMappings

Check if material mappings cover all meshes:

```typescript
import { validateMaterialMappings } from '../utils';

const unmappedMeshes = validateMaterialMappings(
  asset.model,
  metadata.materialMapping
);

if (unmappedMeshes.length > 0) {
  console.warn('Unmapped meshes:', unmappedMeshes);
}
```

## Performance Considerations

### Current Implementation

- **Caching**: useGLTF automatically caches loaded models
- **Cloning**: Models cloned to prevent shared state
- **Memory Management**: Proper cleanup in useEffect return functions
- **Lazy Loading**: Assets only loaded when needed

### Future Optimizations

When adding real assets, consider:

1. **Preloading**: Use `preloadCartAssets()` during loading screen
2. **LOD (Level of Detail)**: Load simpler models at distance
3. **Draco Compression**: Compress GLTF files to reduce size
4. **Instancing**: Use THREE.InstancedMesh for repeated geometry
5. **Mesh Simplification**: Reduce polygon count for distant/small parts

## Testing Strategy

### Without Real Assets

Current state: System works with empty `ASSET_REGISTRY`

- All components render placeholders
- No errors or warnings
- Build succeeds
- Application runs normally

### Adding First Asset

1. Export model as GLB (binary GLTF)
2. Place in `/apps/web/public/assets/gltf/`
3. Add entry to `ASSET_REGISTRY`
4. Verify in browser:
   - Model loads without errors
   - Materials apply correctly
   - Scale and position correct
   - Placeholder not rendered

### Debugging Failed Loads

If asset doesn't load:

1. Check browser console for errors
2. Verify file path matches registry entry
3. Check file exists in public directory
4. Use `getMeshNames()` to inspect model structure
5. Verify material mappings with `validateMaterialMappings()`

## Material Zone Reference

Materials are organized into zones:

```typescript
enum MaterialZone {
  BODY = 'BODY',        // Main cart body panels
  SEATS = 'SEATS',      // Seat surfaces
  ROOF = 'ROOF',        // Roof panels
  METAL = 'METAL',      // Metal parts (frame, hardware)
  GLASS = 'GLASS',      // Transparent parts (windshield)
}
```

Each zone can have different material types:

- **BODY**: Paint (gloss, matte, satin)
- **SEATS**: Vinyl (various colors/finishes)
- **ROOF**: Paint or vinyl
- **METAL**: Powdercoat (various colors)
- **GLASS**: Tinted glass (various opacity levels)

## Common Patterns

### Single Fixed Asset

Component always uses same asset:

```typescript
const asset = useCartAsset(SubassemblyId.CHASSIS);
```

### Option-Driven Asset

Asset varies based on selected option:

```typescript
const roofOption = selectedOptions.find(id => id.startsWith('roof-'));
const assetId = roofOption ? getRoofAssetId(roofOption) : undefined;
const asset = useCartAsset(assetId);
```

### Multiple Instances

Same asset rendered multiple times:

```typescript
{positions.map((pos, i) => (
  <group key={i} position={pos}>
    {asset.model && <primitive object={asset.model.clone(true)} />}
  </group>
))}
```

### Optional Accessory

Asset only rendered if option selected:

```typescript
if (!hasRearBasket) return null;

const asset = useCartAsset(SubassemblyId.STORAGE_BASKET);
// ... render if available
```

## Coordinate System

All assets should follow these conventions:

- **Origin**: Center of bounding box (X/Z), ground level (Y=0)
- **Forward**: +Z direction
- **Up**: +Y direction
- **Right**: +X direction
- **Units**: Meters (1 unit = 1 meter)

Use the `offset` property in asset metadata to adjust if needed.

## Example Asset Entry

Complete example for a roof asset:

```typescript
[SubassemblyId.ROOF_EXTENDED]: {
  path: '/assets/gltf/roof_extended_v2.glb',
  scale: { x: 0.01, y: 0.01, z: 0.01 },  // Convert cm to meters
  rotation: { x: 0, y: Math.PI, z: 0 },   // Face forward
  offset: { x: 0, y: 0.05, z: 0 },        // Lift slightly
  materialMapping: [
    { pattern: 'roof_top', zone: MaterialZone.ROOF },
    { pattern: 'support', zone: MaterialZone.METAL },
    { pattern: 'solar_panel', zone: MaterialZone.BODY },
  ],
}
```

## Status

### Completed

- ✅ Asset registry system
- ✅ useCartAsset hook
- ✅ Material application utilities
- ✅ Updated Chassis component
- ✅ Updated Wheels component
- ✅ Updated Roof component
- ✅ Updated Seats component
- ✅ Updated RearModule component
- ✅ Build verification
- ✅ Type safety throughout

### Not Yet Implemented

- ⬜ Actual GLTF files (intentionally - system designed to work without them)
- ⬜ Lighting and Audio components (minor, visual effects only)
- ⬜ LOD system (future optimization)
- ⬜ Asset preloader UI (future enhancement)

### Testing Required

When real assets become available:

1. Load first asset and verify rendering
2. Test material application with different configurations
3. Verify performance with full cart
4. Test asset hot-reloading (clear cache and reload)
5. Verify fallback to placeholders works correctly

## Next Steps

### For 3D Artists

1. Export models as GLB (binary GLTF)
2. Ensure proper coordinate system (see above)
3. Name meshes descriptively (e.g., "Body_Panel", "Wheel_Rim")
4. Keep polygon counts reasonable
5. Include UV maps for textures (if needed)

### For Developers

1. Add asset metadata to registry
2. Place GLB files in public directory
3. Test loading and material application
4. Adjust scale/rotation/offset as needed
5. Verify with different configurations

### For Optimization

Once assets are loaded:

1. Profile rendering performance
2. Implement LOD if needed
3. Add Draco compression
4. Consider mesh instancing for wheels
5. Implement asset preloading for loading screens

## Conclusion

The GLTF asset loading system is production-ready and fully integrated. Components gracefully fall back to placeholders when assets are unavailable, making iterative asset development straightforward. The centralized registry pattern ensures adding new assets requires minimal code changes.
