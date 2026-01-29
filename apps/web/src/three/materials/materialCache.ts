/**
 * Material Cache System
 * 
 * Prevents material instance explosion by reusing materials with identical properties.
 * Essential for performance and GPU memory management.
 * 
 * Architecture:
 * - Materials are cached by configuration hash
 * - Same preset + color = same material instance
 * - Automatic cleanup of unused materials
 * - Memory usage tracking and warnings
 * 
 * Performance note: Creating new materials every frame causes:
 * - GPU memory leaks
 * - Shader recompilation
 * - Texture uploads
 * - Draw call overhead
 * 
 * This cache prevents those issues by ensuring material identity stability.
 */

import { 
  MaterialBuildConfig, 
  BuiltMaterial, 
  buildMaterial,
  MATERIAL_PERFORMANCE,
  disposeMaterial,
} from './buildMaterial';
import { MaterialPresetId } from './materialPresets';

/**
 * Cache key for material lookup.
 * Combines all properties that affect material identity.
 */
interface MaterialCacheKey {
  presetId: MaterialPresetId;
  color: string; // Hex color
  opacity: number;
}

/**
 * Cache entry with metadata for management.
 */
interface CacheEntry {
  material: BuiltMaterial;
  key: MaterialCacheKey;
  createdAt: number; // Timestamp
  lastAccessedAt: number; // Timestamp
  accessCount: number;
}

/**
 * Material cache statistics for monitoring.
 */
export interface CacheStats {
  totalMaterials: number;
  totalMemoryUsage: number; // Bytes
  hitRate: number; // 0-1
  oldestMaterialAge: number; // Milliseconds
  mostUsedMaterial: MaterialCacheKey | null;
}

/**
 * Global material cache instance.
 * 
 * Architecture note: Singleton pattern is appropriate here because:
 * - Materials are shared across the entire scene
 * - Cache coordination must be centralized
 * - Memory limits apply globally, not per-component
 */
class MaterialCache {
  private cache: Map<string, CacheEntry> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  
  /**
   * Gets or creates a material.
   * 
   * This is the primary interface for material acquisition.
   * Always use this instead of calling buildMaterial directly.
   * 
   * @param config - Material build configuration
   * @returns Cached or newly built material
   */
  get(config: MaterialBuildConfig): BuiltMaterial {
    const key = this.createCacheKey(config);
    const keyString = this.serializeCacheKey(key);
    
    const entry = this.cache.get(keyString);
    
    if (entry) {
      // Cache hit - update access metadata
      entry.lastAccessedAt = Date.now();
      entry.accessCount++;
      this.hits++;
      
      return entry.material;
    } else {
      // Cache miss - build new material
      this.misses++;
      
      const material = buildMaterial(config);
      const newEntry: CacheEntry = {
        material,
        key,
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
        accessCount: 1,
      };
      
      this.cache.set(keyString, newEntry);
      
      // Check if we're approaching memory limits
      this.checkMemoryThreshold();
      
      return material;
    }
  }
  
  /**
   * Checks if a material with given properties exists in cache.
   * 
   * @param config - Material build configuration
   * @returns true if cached, false otherwise
   */
  has(config: MaterialBuildConfig): boolean {
    const key = this.createCacheKey(config);
    const keyString = this.serializeCacheKey(key);
    return this.cache.has(keyString);
  }
  
  /**
   * Manually adds a material to cache.
   * 
   * Use case: Pre-warming cache with known materials.
   * 
   * @param config - Material configuration
   * @param material - Pre-built material
   */
  set(config: MaterialBuildConfig, material: BuiltMaterial): void {
    const key = this.createCacheKey(config);
    const keyString = this.serializeCacheKey(key);
    
    const entry: CacheEntry = {
      material,
      key,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 0,
    };
    
    this.cache.set(keyString, entry);
  }
  
  /**
   * Removes a specific material from cache.
   * 
   * @param config - Material configuration to remove
   * @returns true if material was removed, false if not found
   */
  delete(config: MaterialBuildConfig): boolean {
    const key = this.createCacheKey(config);
    const keyString = this.serializeCacheKey(key);
    
    const entry = this.cache.get(keyString);
    if (entry) {
      disposeMaterial(entry.material.material);
      this.cache.delete(keyString);
      return true;
    }
    
    return false;
  }
  
  /**
   * Clears entire cache and disposes all materials.
   * 
   * Use case: Configuration reset, memory cleanup, hot reload.
   * 
   * Performance note: This triggers GPU resource deallocation.
   * Don't call during rendering or animation.
   */
  clear(): void {
    for (const entry of this.cache.values()) {
      disposeMaterial(entry.material.material);
    }
    
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
  
  /**
   * Removes least recently used materials until cache size is under threshold.
   * 
   * LRU eviction strategy ensures frequently used materials stay cached.
   * 
   * @param targetSize - Maximum number of materials to keep
   */
  evictLRU(targetSize: number): void {
    if (this.cache.size <= targetSize) return;
    
    // Sort entries by last access time (oldest first)
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt);
    
    // Remove oldest materials until we hit target size
    const toRemove = this.cache.size - targetSize;
    for (let i = 0; i < toRemove; i++) {
      const [keyString, entry] = entries[i];
      disposeMaterial(entry.material.material);
      this.cache.delete(keyString);
    }
  }
  
  /**
   * Removes materials that haven't been accessed in a given time period.
   * 
   * @param maxAge - Maximum age in milliseconds
   */
  evictOlderThan(maxAge: number): void {
    const now = Date.now();
    
    for (const [keyString, entry] of this.cache.entries()) {
      const age = now - entry.lastAccessedAt;
      if (age > maxAge) {
        disposeMaterial(entry.material.material);
        this.cache.delete(keyString);
      }
    }
  }
  
  /**
   * Gets cache statistics for monitoring and debugging.
   * 
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    const totalMaterials = this.cache.size;
    
    // Calculate total memory usage
    const totalMemoryUsage = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.material.estimatedMemoryCost, 0);
    
    // Calculate hit rate
    const totalAccesses = this.hits + this.misses;
    const hitRate = totalAccesses > 0 ? this.hits / totalAccesses : 0;
    
    // Find oldest material
    const now = Date.now();
    let oldestAge = 0;
    for (const entry of this.cache.values()) {
      const age = now - entry.createdAt;
      if (age > oldestAge) oldestAge = age;
    }
    
    // Find most used material
    let mostUsed: CacheEntry | null = null;
    for (const entry of this.cache.values()) {
      if (!mostUsed || entry.accessCount > mostUsed.accessCount) {
        mostUsed = entry;
      }
    }
    
    return {
      totalMaterials,
      totalMemoryUsage,
      hitRate,
      oldestMaterialAge: oldestAge,
      mostUsedMaterial: mostUsed?.key ?? null,
    };
  }
  
  /**
   * Prints cache statistics to console (debugging).
   */
  printStats(): void {
    const stats = this.getStats();
    console.group('Material Cache Statistics');
    console.log(`Total materials: ${stats.totalMaterials}`);
    console.log(`Memory usage: ${(stats.totalMemoryUsage / 1024).toFixed(2)} KB`);
    console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
    console.log(`Oldest material age: ${(stats.oldestMaterialAge / 1000).toFixed(1)}s`);
    if (stats.mostUsedMaterial) {
      console.log('Most used material:', stats.mostUsedMaterial);
    }
    console.groupEnd();
  }
  
  /**
   * Creates a cache key from material configuration.
   * 
   * @param config - Material build configuration
   * @returns Cache key object
   */
  private createCacheKey(config: MaterialBuildConfig): MaterialCacheKey {
    return {
      presetId: config.preset.id,
      color: config.color.toLowerCase(), // Normalize color format
      opacity: config.opacity ?? 1.0,
    };
  }
  
  /**
   * Serializes cache key to string for Map lookup.
   * 
   * Format: presetId|color|opacity
   * 
   * @param key - Cache key object
   * @returns Serialized key string
   */
  private serializeCacheKey(key: MaterialCacheKey): string {
    return `${key.presetId}|${key.color}|${key.opacity.toFixed(3)}`;
  }
  
  /**
   * Checks if cache is approaching memory limits and warns if necessary.
   * 
   * This is a safeguard against runaway material creation.
   * In production, you might want to automatically evict or throw errors.
   */
  private checkMemoryThreshold(): void {
    const stats = this.getStats();
    
    if (stats.totalMaterials >= MATERIAL_PERFORMANCE.MAX_MATERIAL_INSTANCES) {
      console.error(
        `Material cache exceeded maximum instances (${MATERIAL_PERFORMANCE.MAX_MATERIAL_INSTANCES}). ` +
        `Current: ${stats.totalMaterials}. Consider evicting unused materials.`
      );
      
      // Auto-evict to prevent further growth
      this.evictLRU(MATERIAL_PERFORMANCE.MAX_MATERIAL_INSTANCES * 0.8);
    } else if (stats.totalMaterials >= MATERIAL_PERFORMANCE.WARNING_THRESHOLD) {
      console.warn(
        `Material cache approaching threshold. ` +
        `Current: ${stats.totalMaterials}, Max: ${MATERIAL_PERFORMANCE.MAX_MATERIAL_INSTANCES}`
      );
    }
  }
}

/**
 * Global material cache instance.
 * 
 * Usage:
 *   const material = materialCache.get({ preset, color: '#ff0000' });
 */
export const materialCache = new MaterialCache();

/**
 * Pre-warms cache with commonly used materials.
 * 
 * Call this during app initialization or loading screen to prepare
 * materials before they're needed.
 * 
 * @param configs - Array of material configurations to pre-build
 */
export function prewarmMaterialCache(configs: MaterialBuildConfig[]): void {
  for (const config of configs) {
    materialCache.get(config);
  }
}

/**
 * Cleans up unused materials based on access patterns.
 * 
 * Call this periodically (e.g., when user closes configurator) or when
 * memory pressure is detected.
 * 
 * @param strategy - Cleanup strategy
 */
export function cleanupMaterialCache(
  strategy: 'lru' | 'age' | 'all' = 'lru'
): void {
  switch (strategy) {
    case 'lru':
      // Keep only 50% of max capacity
      materialCache.evictLRU(
        Math.floor(MATERIAL_PERFORMANCE.MAX_MATERIAL_INSTANCES * 0.5)
      );
      break;
    
    case 'age':
      // Remove materials not accessed in last 5 minutes
      materialCache.evictOlderThan(5 * 60 * 1000);
      break;
    
    case 'all':
      materialCache.clear();
      break;
  }
}

/**
 * Hook for monitoring cache health in development.
 * 
 * In production, you'd connect this to telemetry/monitoring.
 */
export function startCacheMonitoring(intervalMs: number = 10000): () => void {
  const interval = setInterval(() => {
    const stats = materialCache.getStats();
    
    // Log if cache is growing too large
    if (stats.totalMaterials > MATERIAL_PERFORMANCE.WARNING_THRESHOLD) {
      console.warn('Material cache health check:', stats);
    }
  }, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(interval);
}
