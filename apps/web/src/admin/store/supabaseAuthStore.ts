/**
 * Supabase auth store using Zustand.
 * 
 * Manages authentication state using Supabase Auth.
 * Can be used alongside or instead of the existing JWT auth store.
 */

import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import {
  supabase,
  signInWithEmail,
  signOut,
  getSession,
  getUser,
  isSupabaseConfigured,
  UserMetadata,
} from '../../lib/supabase';

/**
 * Admin user structure (matching backend expectations).
 */
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  supabaseId?: string;
}

/**
 * Supabase auth state.
 */
interface SupabaseAuthState {
  // State
  user: AdminUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  getAccessToken: () => string | null;
}

/**
 * Convert Supabase user to AdminUser format.
 */
function toAdminUser(user: User): AdminUser {
  const metadata = user.user_metadata as UserMetadata;
  return {
    id: user.id,
    supabaseId: user.id,
    email: user.email || '',
    name: metadata?.name || user.email?.split('@')[0] || 'Unknown',
    role: metadata?.role || 'VIEWER',
  };
}

/**
 * Supabase auth store.
 */
export const useSupabaseAuthStore = create<SupabaseAuthState>((set, get) => ({
  // Initial state
  user: null,
  supabaseUser: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isConfigured: isSupabaseConfigured(),
  
  /**
   * Login with email and password.
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { session, user } = await signInWithEmail(email, password);
      
      if (!session || !user) {
        throw new Error('Login failed: No session returned');
      }
      
      set({
        user: toAdminUser(user),
        supabaseUser: user,
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({
        user: null,
        supabaseUser: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },
  
  /**
   * Logout the current user.
   */
  logout: async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        supabaseUser: null,
        session: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },
  
  /**
   * Check if user is authenticated (on app load).
   */
  checkAuth: async () => {
    if (!isSupabaseConfigured()) {
      set({ isLoading: false, isConfigured: false });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const [session, user] = await Promise.all([
        getSession(),
        getUser(),
      ]);
      
      if (session && user) {
        set({
          user: toAdminUser(user),
          supabaseUser: user,
          session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          supabaseUser: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({
        user: null,
        supabaseUser: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
  
  /**
   * Clear any error message.
   */
  clearError: () => set({ error: null }),
  
  /**
   * Get the current access token for API calls.
   */
  getAccessToken: () => {
    const { session } = get();
    return session?.access_token || null;
  },
}));

/**
 * Set up auth state listener.
 * Call this once when the app initializes.
 */
export function initSupabaseAuthListener() {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session?.user) {
      useSupabaseAuthStore.setState({
        user: toAdminUser(session.user),
        supabaseUser: session.user,
        session,
        isAuthenticated: true,
        isLoading: false,
      });
    } else if (event === 'SIGNED_OUT') {
      useSupabaseAuthStore.setState({
        user: null,
        supabaseUser: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } else if (event === 'TOKEN_REFRESHED' && session) {
      useSupabaseAuthStore.setState({
        session,
      });
    }
  });
}

/**
 * Hook to get the access token for API calls.
 * Returns null if not authenticated.
 */
export function useSupabaseAccessToken(): string | null {
  return useSupabaseAuthStore((state) => state.session?.access_token || null);
}
