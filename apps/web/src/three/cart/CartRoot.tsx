/**
 * CartRoot component - the top-level cart assembly.
 * 
 * This component orchestrates all subassemblies and is the primary interface
 * between configuration state and 3D rendering. It:
 * 
 * 1. Receives a CartConfiguration and material catalog
 * 2. Creates a material map from configuration selections
 * 3. Extracts selected options by category
 * 4. Passes appropriate data to each subassembly
 * 
 * Architecture note: Each subassembly is independent and receives only the
 * data it needs. This makes it easy to:
 * - Test subassemblies in isolation
 * - Replace placeholder geometry with GLTF models
 * - Add new subassemblies without affecting others
 * 
 * Future integration: When loading GLTF models, this component should:
 * 1. Check each option's assetPath
 * 2. Load the model asynchronously
 * 3. Mount it in place of the placeholder component
 * 4. Apply materials from the material map to named mesh children
 */

import { useMemo } from 'react';
import { 
  CartConfiguration, 
  Material as ConfigMaterial,
  OptionCategory,
  MaterialZone 
} from '@cart-configurator/types';
import { createMaterialMap, createDefaultMaterialMap, getMaterialForZone } from '../materials/materialFactory';
import { Chassis } from './Chassis';
import { Wheels } from './Wheels';
import { Roof } from './Roof';
import { Seats } from './Seats';
import { RearModule } from './RearModule';
import { Lighting } from './Lighting';
import { Audio } from './Audio';

interface CartRootProps {
  /**
   * Complete cart configuration from state.
   */
  configuration: CartConfiguration;
  
  /**
   * Complete material catalog for resolving material IDs.
   */
  allMaterials: ConfigMaterial[];
  
  /**
   * Complete option catalog for extracting option details.
   */
  allOptions: Array<{
    id: string;
    category: OptionCategory;
    name: string;
  }>;
}

export function CartRoot({ configuration, allMaterials, allOptions }: CartRootProps) {
  /**
   * Create material map from configuration.
   * Recalculates only when material selections change.
   */
  const materialMap = useMemo(() => {
    if (configuration.materialSelections.length > 0) {
      return createMaterialMap(configuration.materialSelections, allMaterials);
    }
    return createDefaultMaterialMap();
  }, [configuration.materialSelections, allMaterials]);
  
  /**
   * Extract selected options by category for easier subassembly access.
   */
  const optionsByCategory = useMemo(() => {
    const categorized: Record<string, string[]> = {};
    
    for (const optionId of configuration.selectedOptions) {
      const option = allOptions.find(opt => opt.id === optionId);
      if (option) {
        const category = option.category;
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push(optionId);
      }
    }
    
    return categorized;
  }, [configuration.selectedOptions, allOptions]);
  
  // Get materials for each zone
  const bodyMaterial = getMaterialForZone(materialMap, MaterialZone.BODY);
  const seatMaterial = getMaterialForZone(materialMap, MaterialZone.SEATS);
  const roofMaterial = getMaterialForZone(materialMap, MaterialZone.ROOF);
  const metalMaterial = getMaterialForZone(materialMap, MaterialZone.METAL);
  
  // Extract specific option selections
  const wheelOptions = optionsByCategory[OptionCategory.WHEELS] || [];
  const roofOptions = optionsByCategory[OptionCategory.ROOF] || [];
  const seatOptions = optionsByCategory[OptionCategory.SEATING] || [];
  const storageOptions = optionsByCategory[OptionCategory.STORAGE] || [];
  const lightingOptions = optionsByCategory[OptionCategory.LIGHTING] || [];
  const audioOptions = optionsByCategory[OptionCategory.ELECTRONICS] || [];
  
  return (
    <group name="cart-root" position={[0, 0, 0]}>
      {/* Core structure - always present */}
      <Chassis 
        material={bodyMaterial}
        materialMap={materialMap}
      />
      
      {/* Wheels - always present (one option required) */}
      <Wheels 
        selectedWheelOption={wheelOptions[0] || null}
        metalMaterial={metalMaterial}
        materialMap={materialMap}
      />
      
      {/* Roof - always present (one option required) */}
      <Roof 
        selectedRoofOption={roofOptions[0] || null}
        roofMaterial={roofMaterial}
        materialMap={materialMap}
      />
      
      {/* Seats - always present (one option required) */}
      <Seats 
        selectedSeatOption={seatOptions[0] || null}
        seatMaterial={seatMaterial}
        materialMap={materialMap}
      />
      
      {/* Optional accessories */}
      <RearModule 
        selectedStorageOptions={storageOptions}
        metalMaterial={metalMaterial}
        materialMap={materialMap}
      />
      
      <Lighting 
        selectedLightingOptions={lightingOptions}
      />
      
      <Audio 
        selectedAudioOptions={audioOptions}
      />
    </group>
  );
}
