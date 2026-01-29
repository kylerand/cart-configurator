/**
 * Admin API client.
 * 
 * Centralized HTTP client for admin endpoints with auth token injection.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiError {
  error: string;
  message?: string;
}

/**
 * Make authenticated API request.
 */
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('admin_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.error || error.message || 'Request failed');
  }
  
  return response.json();
}

export const adminApi = {
  // Auth endpoints
  async login(email: string, password: string) {
    return fetchWithAuth<{
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  async logout() {
    return fetchWithAuth<{ message: string }>('/api/admin/auth/logout', {
      method: 'POST',
    });
  },
  
  async getMe() {
    return fetchWithAuth<{
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }>('/api/admin/auth/me');
  },
  
  // Platform endpoints
  async getPlatforms() {
    return fetchWithAuth<{ platforms: any[] }>('/api/admin/platforms');
  },
  
  async getPlatform(id: string) {
    return fetchWithAuth<{ platform: any }>(`/api/admin/platforms/${id}`);
  },
  
  async createPlatform(data: any) {
    return fetchWithAuth<{ platform: any }>('/api/admin/platforms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async updatePlatform(id: string, data: any) {
    return fetchWithAuth<{ platform: any }>(`/api/admin/platforms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async deletePlatform(id: string) {
    return fetchWithAuth<{ message: string }>(`/api/admin/platforms/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Option endpoints
  async getOptions(filters?: { platformId?: string; category?: string }) {
    const query = new URLSearchParams(filters as any).toString();
    return fetchWithAuth<{ options: any[] }>(
      `/api/admin/options${query ? `?${query}` : ''}`
    );
  },
  
  async getOption(id: string) {
    return fetchWithAuth<{ option: any }>(`/api/admin/options/${id}`);
  },
  
  async createOption(data: any) {
    return fetchWithAuth<{ option: any }>('/api/admin/options', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async updateOption(id: string, data: any) {
    return fetchWithAuth<{ option: any }>(`/api/admin/options/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async deleteOption(id: string) {
    return fetchWithAuth<{ message: string }>(`/api/admin/options/${id}`, {
      method: 'DELETE',
    });
  },
  
  async createOptionRule(optionId: string, data: any) {
    return fetchWithAuth<{ rule: any }>(`/api/admin/options/${optionId}/rules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async deleteOptionRule(optionId: string, ruleId: string) {
    return fetchWithAuth<{ message: string }>(
      `/api/admin/options/${optionId}/rules/${ruleId}`,
      { method: 'DELETE' }
    );
  },
  
  // Material endpoints
  async getMaterials(filters?: { zone?: string; type?: string }) {
    const query = new URLSearchParams(filters as any).toString();
    return fetchWithAuth<{ materials: any[] }>(
      `/api/admin/materials${query ? `?${query}` : ''}`
    );
  },
  
  async getMaterial(id: string) {
    return fetchWithAuth<{ material: any }>(`/api/admin/materials/${id}`);
  },
  
  async createMaterial(data: any) {
    return fetchWithAuth<{ material: any }>('/api/admin/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async updateMaterial(id: string, data: any) {
    return fetchWithAuth<{ material: any }>(`/api/admin/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async deleteMaterial(id: string) {
    return fetchWithAuth<{ message: string }>(`/api/admin/materials/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Audit log endpoints
  async getAuditLogs(filters?: {
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    perPage?: number;
  }) {
    const query = new URLSearchParams(filters as any).toString();
    return fetchWithAuth<{
      logs: any[];
      pagination: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/admin/audit-logs${query ? `?${query}` : ''}`);
  },
  
  async getAuditStats() {
    return fetchWithAuth<{
      totalLogs: number;
      recentLogs: number;
      actionCounts: Array<{ action: string; count: number }>;
    }>('/api/admin/audit-logs/stats');
  },
  
  // User management endpoints
  async getUsers() {
    return fetchWithAuth<{ users: any[] }>('/api/admin/users');
  },
  
  async getUser(id: string) {
    return fetchWithAuth<{ user: any }>(`/api/admin/users/${id}`);
  },
  
  async createUser(data: any) {
    return fetchWithAuth<{ user: any }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async updateUser(id: string, data: any) {
    return fetchWithAuth<{ user: any }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async changeUserPassword(id: string, password: string) {
    return fetchWithAuth<{ message: string }>(`/api/admin/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  },
  
  async deleteUser(id: string) {
    return fetchWithAuth<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Global search
  globalSearch: async (query: string) => {
    return fetchWithAuth(`${API_BASE}/admin/search?q=${encodeURIComponent(query)}`);
  },
};
