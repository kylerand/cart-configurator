/**
 * API client for backend communication.
 */

import {
  Platform,
  ConfigOption,
  Material,
  CartConfiguration,
  QuoteRequest
} from '@cart-configurator/types';

// Ensure API URL always ends with /api
const getApiBase = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const API_BASE = getApiBase();

/**
 * Fetches the base platform definition.
 */
export async function fetchPlatform(): Promise<Platform> {
  const response = await fetch(`${API_BASE}/catalog/platform`);
  if (!response.ok) throw new Error('Failed to fetch platform');
  return response.json();
}

/**
 * Fetches all available options.
 */
export async function fetchOptions(): Promise<ConfigOption[]> {
  const response = await fetch(`${API_BASE}/catalog/options`);
  if (!response.ok) throw new Error('Failed to fetch options');
  return response.json();
}

/**
 * Fetches all available materials.
 */
export async function fetchMaterials(): Promise<Material[]> {
  const response = await fetch(`${API_BASE}/catalog/materials`);
  if (!response.ok) throw new Error('Failed to fetch materials');
  return response.json();
}

/**
 * Saves a configuration to the backend.
 */
export async function saveConfiguration(config: CartConfiguration): Promise<string> {
  const response = await fetch(`${API_BASE}/configurations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });

  if (!response.ok) throw new Error('Failed to save configuration');
  
  const result = await response.json();
  return result.configurationId;
}

/**
 * Loads a configuration from the backend.
 */
export async function loadConfiguration(id: string): Promise<CartConfiguration> {
  const response = await fetch(`${API_BASE}/configurations/${id}`);
  if (!response.ok) throw new Error('Failed to load configuration');
  
  const config = await response.json();
  
  // Reconstruct Date objects
  return {
    ...config,
    createdAt: new Date(config.createdAt),
    updatedAt: new Date(config.updatedAt)
  };
}

/**
 * Submits a quote request.
 */
export async function submitQuote(quoteRequest: QuoteRequest): Promise<string> {
  const response = await fetch(`${API_BASE}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quoteRequest)
  });

  if (!response.ok) throw new Error('Failed to submit quote');
  
  const result = await response.json();
  return result.quoteId;
}

/**
 * Fetches all quotes (admin).
 */
export async function fetchQuotes(): Promise<unknown[]> {
  const response = await fetch(`${API_BASE}/quotes`);
  if (!response.ok) throw new Error('Failed to fetch quotes');
  return response.json();
}
