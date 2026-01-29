/**
 * Custom hook for loading catalog data on app initialization.
 */

import { useEffect, useState } from 'react';
import { useConfiguratorStore } from '../store/configurator';
import { fetchPlatform, fetchOptions, fetchMaterials } from '../api/client';

export function useCatalogLoader() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const setPlatform = useConfiguratorStore(state => state.setPlatform);
  const setOptions = useConfiguratorStore(state => state.setOptions);
  const setMaterials = useConfiguratorStore(state => state.setMaterials);
  const initializeConfiguration = useConfiguratorStore(state => state.initializeConfiguration);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [platform, options, materials] = await Promise.all([
          fetchPlatform(),
          fetchOptions(),
          fetchMaterials()
        ]);

        setPlatform(platform);
        setOptions(options);
        setMaterials(materials);
        initializeConfiguration(platform.id);
        
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }

    loadCatalog();
  }, [setPlatform, setOptions, setMaterials, initializeConfiguration]);

  return { loading, error };
}
