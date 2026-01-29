/**
 * Theme store for dark mode support.
 * 
 * Manages theme state (light/dark) and provides color tokens
 * that components can use for consistent styling.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  // Background colors
  background: string;
  backgroundElevated: string;
  backgroundHover: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Surface colors
  surface: string;
  surfaceHover: string;
  
  // Status colors (remain consistent)
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Action colors
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  danger: string;
  dangerHover: string;
}

const lightTheme: Theme = {
  background: '#f9fafb',
  backgroundElevated: '#ffffff',
  backgroundHover: '#f3f4f6',
  
  text: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  surface: '#ffffff',
  surfaceHover: '#f9fafb',
  
  success: '#059669',
  error: '#dc2626',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  secondary: '#6b7280',
  secondaryHover: '#4b5563',
  danger: '#dc2626',
  dangerHover: '#b91c1c',
};

const darkTheme: Theme = {
  background: '#0f172a',
  backgroundElevated: '#1e293b',
  backgroundHover: '#334155',
  
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  
  border: '#334155',
  borderLight: '#475569',
  
  surface: '#1e293b',
  surfaceHover: '#334155',
  
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#64748b',
  secondaryHover: '#475569',
  danger: '#ef4444',
  dangerHover: '#dc2626',
};

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      theme: lightTheme,
      
      toggleTheme: () => set((state) => {
        const newMode = state.mode === 'light' ? 'dark' : 'light';
        return {
          mode: newMode,
          theme: newMode === 'light' ? lightTheme : darkTheme,
        };
      }),
      
      setTheme: (mode: ThemeMode) => set({
        mode,
        theme: mode === 'light' ? lightTheme : darkTheme,
      }),
    }),
    {
      name: 'admin-theme',
    }
  )
);
