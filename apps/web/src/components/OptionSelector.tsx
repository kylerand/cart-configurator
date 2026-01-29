/**
 * Option selector panel.
 * 
 * Displays available options grouped by category with add/remove controls.
 */

import { useConfiguratorStore } from '../store/configurator';
import { OptionCategory } from '@cart-configurator/types';

export function OptionSelector() {
  const allOptions = useConfiguratorStore(state => state.allOptions);
  const configuration = useConfiguratorStore(state => state.configuration);
  const addOption = useConfiguratorStore(state => state.addOption);
  const removeOption = useConfiguratorStore(state => state.removeOption);

  if (!configuration) return null;

  const categories = Object.values(OptionCategory);

  return (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
      <h2>Configure Your Cart</h2>
      
      {categories.map(category => {
        const categoryOptions = allOptions.filter(opt => opt.category === category);
        if (categoryOptions.length === 0) return null;

        return (
          <div key={category} style={{ marginBottom: '30px' }}>
            <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '8px' }}>
              {category}
            </h3>
            
            {categoryOptions.map(option => {
              const isSelected = configuration.selectedOptions.includes(option.id);
              
              return (
                <div
                  key={option.id}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    border: isSelected ? '2px solid #0066cc' : '1px solid #ccc',
                    borderRadius: '4px',
                    background: isSelected ? '#e6f2ff' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{option.name}</strong>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                        {option.description}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        Parts: ${option.partPrice.toLocaleString()} | Labor: {option.laborHours}h
                      </p>
                    </div>
                    
                    <button
                      onClick={() => isSelected ? removeOption(option.id) : addOption(option.id)}
                      style={{
                        padding: '8px 16px',
                        marginLeft: '12px',
                        background: isSelected ? '#cc0000' : '#0066cc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? 'Remove' : 'Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
