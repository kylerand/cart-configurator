/**
 * Material selector panel.
 * 
 * Allows selection of materials for each zone (body, seats, roof, etc.).
 */

import { useConfiguratorStore } from '../store/configurator';
import { MaterialZone } from '@cart-configurator/types';

export function MaterialSelector() {
  const allMaterials = useConfiguratorStore(state => state.allMaterials);
  const configuration = useConfiguratorStore(state => state.configuration);
  const setMaterialSelection = useConfiguratorStore(state => state.setMaterialSelection);

  if (!configuration) return null;

  const zones = Object.values(MaterialZone);

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      <h2>Materials & Finishes</h2>
      
      {zones.map(zone => {
        const zoneMaterials = allMaterials.filter(mat => mat.zone === zone);
        if (zoneMaterials.length === 0) return null;

        const currentSelection = configuration.materialSelections.find(s => s.zone === zone);

        return (
          <div key={zone} style={{ marginBottom: '30px' }}>
            <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '8px' }}>
              {zone}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
              {zoneMaterials.map(material => {
                const isSelected = currentSelection?.materialId === material.id;
                
                return (
                  <button
                    key={material.id}
                    onClick={() => setMaterialSelection({ zone, materialId: material.id })}
                    style={{
                      padding: '12px',
                      border: isSelected ? '3px solid #0066cc' : '1px solid #ccc',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '60px',
                        background: material.color,
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }}
                    />
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {material.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {material.finish}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
