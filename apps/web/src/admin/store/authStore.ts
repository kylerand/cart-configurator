/**
 * Admin auth store using Zustand.
 * 
 * Manages authentication state and user session.
 * Supports both legacy JWT and Supabase auth based on feature flag.
 */

import { create } from 'zustand';
import { adminApi, USE_SUPABASE_AUTH } from '../api/client';
import { signInWithEmail, signOut, getSession, getUser } from '../../lib/supabase';

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
  isLoading: true, // Start with loading true to prevent redirect before auth check
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      if (USE_SUPABASE_AUTH) {
        // Use Supabase authentication
        const { session, user } = await signInWithEmail(email, password);
        
        if (!session || !user) {
          throw new Error('Login failed');
        }
        
        const metadata = user.user_metadata as { name?: string; role?: string } || {};
        
        set({
          user: {
            id: user.id,
            email: user.email || '',
            name: metadata.name || user.email?.split('@')[0] || 'User',
            role: metadata.role || 'VIEWER',
          },
          token: session.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Use legacy JWT authentication
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
      }
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
      if (USE_SUPABASE_AUTH) {
        await signOut();
      } else {
        await adminApi.logout();
      }
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
    if (USE_SUPABASE_AUTH) {
      // Check Supabase session
      const session = await getSession();
      
      if (!session) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      
      // If we already have user data and are authenticated, just ensure loading is false
      const currentState = useAuthStore.getState();
      if (currentState.isAuthenticated && currentState.user) {
        set({ isLoading: false });
        return;
      }
      
      set({ isLoading: true });
      
      try {
        const user = await getUser();
        
        if (!user) {
          throw new Error('No user found');
        }
        
        const metadata = user.user_metadata as { name?: string; role?: string } || {};
        
        set({
          user: {
            id: user.id,
            email: user.email || '',
            name: metadata.name || user.email?.split('@')[0] || 'User',
            role: metadata.role || 'VIEWER',
          },
          token: session.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } else {
      // Legacy JWT auth check
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      
      // If we already have user data and are authenticated, just ensure loading is false
      const currentState = useAuthStore.getState();
      if (currentState.isAuthenticated && currentState.user) {
        set({ isLoading: false });
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
    }
  },
  
  clearError: () => set({ error: null }),
}));
