/**
 * Main configurator page.
 * 
 * Layout: 3D scene in center, option selector on left, pricing on right.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartScene } from '../three/scene/CartScene';
import { OptionSelector } from '../components/OptionSelector';
import { MaterialSelector } from '../components/MaterialSelector';
import { PricingSummary } from '../components/PricingSummary';
import { PlatformSelector } from '../components/PlatformSelector';
import { useConfiguratorStore } from '../store/configurator';
import { saveConfiguration } from '../api/client';

export function ConfiguratorPage() {
  const navigate = useNavigate();
  const configuration = useConfiguratorStore(state => state.configuration);
  const allMaterials = useConfiguratorStore(state => state.allMaterials);
  const allOptions = useConfiguratorStore(state => state.allOptions);
  const [activePanel, setActivePanel] = useState<'options' | 'materials'>('options');
  const [isSaving, setIsSaving] = useState(false);

  const handleRequestQuote = async () => {
    if (!configuration) return;

    setIsSaving(true);
    try {
      await saveConfiguration(configuration);
      navigate('/quote');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!configuration) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading configuration...</p>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header
        style={{
          background: '#1a1a1a',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>Golf Cart Configurator</h1>
        <button
          onClick={handleRequestQuote}
          disabled={isSaving}
          style={{
            padding: '12px 24px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1
          }}
        >
          {isSaving ? 'Saving...' : 'Request Quote'}
        </button>
      </header>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel - Platform/Options/Materials */}
        <div style={{ width: '350px', borderRight: '1px solid #ccc', background: 'white', display: 'flex', flexDirection: 'column' }}>
          {/* Platform selector at top */}
          <PlatformSelector />
          
          <div style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
            <button
              onClick={() => setActivePanel('options')}
              style={{
                flex: 1,
                padding: '12px',
                background: activePanel === 'options' ? '#0066cc' : '#f5f5f5',
                color: activePanel === 'options' ? 'white' : 'black',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Options
            </button>
            <button
              onClick={() => setActivePanel('materials')}
              style={{
                flex: 1,
                padding: '12px',
                background: activePanel === 'materials' ? '#0066cc' : '#f5f5f5',
                color: activePanel === 'materials' ? 'white' : 'black',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Materials
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activePanel === 'options' ? <OptionSelector /> : <MaterialSelector />}
          </div>
        </div>

        {/* Center panel - 3D Scene */}
        <div style={{ flex: 1, background: '#f5f5f5' }}>
          <CartScene 
            configuration={configuration}
            allMaterials={allMaterials}
            allOptions={allOptions}
          />
        </div>

        {/* Right panel - Pricing */}
        <div style={{ width: '350px', borderLeft: '1px solid #ccc', background: 'white' }}>
          <PricingSummary />
        </div>
      </div>
    </div>
  );
}
