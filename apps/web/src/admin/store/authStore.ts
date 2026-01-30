/**
 * Admin auth store using Zustand.
 * 
 * Manages authentication state and user session.
 */

import { create } from 'zustand';
import { adminApi } from '../api/client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('admin_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.login(email, password);
      
      localStorage.setItem('admin_token', response.accessToken);
      localStorage.setItem('admin_refresh_token', response.refreshToken);
      
      set({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    
    // If we already have user data and are authenticated, skip the API call
    const currentState = useAuthStore.getState();
    if (currentState.isAuthenticated && currentState.user) {
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const response = await adminApi.getMe();
      
      set({
        user: response.user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));
