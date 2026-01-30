/**
 * Platform selector component.
 * 
 * Allows users to switch between different platform types.
 */

import { useState, useEffect } from 'react';
import { fetchAllPlatforms } from '../api/client';
import { useConfiguratorStore } from '../store/configurator';
import type { Platform } from '@cart-configurator/types';

export function PlatformSelector() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentPlatformId = useConfiguratorStore(state => state.configuration?.platformId);
  const switchPlatform = useConfiguratorStore(state => state.switchPlatform);
  
  // Find the current platform object from the platforms list
  const currentPlatform = platforms.find(p => p.id === currentPlatformId);

  useEffect(() => {
    loadPlatforms();
  }, []);

  async function loadPlatforms() {
    try {
      const data = await fetchAllPlatforms();
      setPlatforms(data);
    } catch (error) {
      console.error('Failed to load platforms:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Loading platforms...</p>
      </div>
    );
  }

  if (platforms.length <= 1) {
    // Don't show selector if there's only one platform
    return null;
  }

  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
        Platform
      </label>
      <select
        value={currentPlatform?.id || ''}
        onChange={(e) => {
          const platform = platforms.find(p => p.id === e.target.value);
          if (platform) {
            switchPlatform(platform);
          }
        }}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px',
          background: 'white',
          cursor: 'pointer'
        }}
      >
        {platforms.map(platform => (
          <option key={platform.id} value={platform.id}>
            {platform.name} - ${platform.basePrice.toFixed(0)}
          </option>
        ))}
      </select>
      {currentPlatform && (
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '12px', 
          color: '#666',
          lineHeight: '1.4'
        }}>
          {currentPlatform.description}
        </p>
      )}
    </div>
  );
}
