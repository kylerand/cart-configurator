/**
 * Hook for creating themed styles.
 * 
 * Provides a helper to generate styles that automatically
 * use theme colors for consistency across dark/light modes.
 */

import { useMemo } from 'react';
import { useThemeStore, type Theme } from '../store/themeStore';

type StylesFactory<T> = (theme: Theme) => Record<keyof T, React.CSSProperties>;

/**
 * Create themed styles using current theme.
 * Automatically memoizes based on theme changes.
 */
export function useThemedStyles<T extends string>(
  factory: StylesFactory<Record<T, React.CSSProperties>>
): Record<T, React.CSSProperties> {
  const { theme } = useThemeStore();
  
  return useMemo(() => factory(theme), [theme, factory]);
}
