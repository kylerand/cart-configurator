/**
 * Retro Bronco Design System
 * 
 * Inspired by classic Ford Bronco aesthetics - rugged, vintage, adventurous.
 * Color palette draws from desert landscapes, vintage automotive colors,
 * and classic off-road adventure vibes.
 */

// Color Palette
export const colors = {
  // Primary colors - inspired by vintage Bronco colors
  broncoOrange: '#D2691E',
  broncoRust: '#A0522D',
  broncoSand: '#C4A77D',
  broncoCream: '#F5E6D3',
  
  // Accent colors
  desertSunset: '#E07B39',
  sageGreen: '#6B8E6B',
  vintageChrome: '#C0C0C0',
  
  // Neutrals
  charcoal: '#2C2C2C',
  warmGray: '#4A4A4A',
  lightGray: '#E8E4E0',
  offWhite: '#FAF8F5',
  
  // UI colors
  success: '#6B8E6B',
  warning: '#E07B39',
  error: '#B22222',
  
  // Backgrounds
  canvasBg: '#1C1915',
  panelBg: '#2C2820',
  cardBg: '#3A352D',
};

// Typography
export const typography = {
  fontFamily: {
    display: '"Bebas Neue", "Impact", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  sizes: {
    hero: '48px',
    h1: '32px',
    h2: '24px',
    h3: '18px',
    body: '14px',
    small: '12px',
    tiny: '10px',
  },
  weights: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
};

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

// Border radius
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  pill: '999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.3)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.4)',
  glow: '0 0 20px rgba(210, 105, 30, 0.3)',
};

// Common styles
export const commonStyles = {
  panel: {
    background: colors.panelBg,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.warmGray}30`,
  },
  card: {
    background: colors.cardBg,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.warmGray}20`,
  },
  button: {
    primary: {
      background: `linear-gradient(180deg, ${colors.broncoOrange} 0%, ${colors.broncoRust} 100%)`,
      color: colors.offWhite,
      border: 'none',
      borderRadius: borderRadius.md,
      fontFamily: typography.fontFamily.display,
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
      boxShadow: shadows.md,
    },
    secondary: {
      background: 'transparent',
      color: colors.broncoSand,
      border: `2px solid ${colors.broncoSand}`,
      borderRadius: borderRadius.md,
    },
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
};
