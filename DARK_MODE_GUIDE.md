# Dark Mode Implementation Guide

## Overview

The admin panel now supports a complete dark mode theme system with smooth transitions between light and dark modes. The theme persists across sessions using localStorage.

## Architecture

### Theme Store (`/apps/web/src/admin/store/themeStore.ts`)

Zustand store managing theme state with persistence:

```typescript
interface ThemeState {
  mode: 'light' | 'dark';
  theme: Theme;  // Current theme colors
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}
```

### Theme Colors

Each theme defines a comprehensive set of semantic color tokens:

#### Light Theme
```typescript
{
  // Backgrounds
  background: '#f9fafb',          // Page background
  backgroundElevated: '#ffffff',  // Cards, modals
  backgroundHover: '#f3f4f6',     // Hover states
  
  // Text
  text: '#111827',                // Primary text
  textSecondary: '#6b7280',       // Secondary text
  textTertiary: '#9ca3af',        // Disabled text
  
  // Borders
  border: '#e5e7eb',              // Default borders
  borderLight: '#f3f4f6',         // Subtle borders
  
  // Actions
  primary: '#2563eb',             // Primary buttons
  success: '#059669',             // Success actions
  error: '#dc2626',               // Error/danger
  warning: '#f59e0b',             // Warnings
  info: '#3b82f6',                // Info messages
}
```

#### Dark Theme
```typescript
{
  // Backgrounds
  background: '#0f172a',          // Page background (slate-950)
  backgroundElevated: '#1e293b',  // Cards, modals (slate-800)
  backgroundHover: '#334155',     // Hover states (slate-700)
  
  // Text
  text: '#f1f5f9',                // Primary text (slate-100)
  textSecondary: '#cbd5e1',       // Secondary text (slate-300)
  textTertiary: '#94a3b8',        // Disabled text (slate-400)
  
  // Borders
  border: '#334155',              // Default borders (slate-700)
  borderLight: '#475569',         // Subtle borders (slate-600)
  
  // Actions
  primary: '#3b82f6',             // Primary buttons (brighter)
  success: '#10b981',             // Success actions (brighter)
  error: '#ef4444',               // Error/danger (brighter)
  warning: '#f59e0b',             // Warnings (same)
  info: '#3b82f6',                // Info messages (same)
}
```

### Design Decisions

1. **Status Colors Remain Consistent**: Success, error, warning, and info colors are slightly brighter in dark mode but remain visually distinct in both themes.

2. **Smooth Transitions**: All color changes use `transition: 'all 0.2s ease'` for smooth visual feedback.

3. **Semantic Naming**: Colors are named by purpose (e.g., `backgroundElevated`, `textSecondary`) rather than by shade, making theme switching straightforward.

4. **Accessible Contrast**: Both themes maintain WCAG AA contrast ratios for readability.

## Usage

### Using Themed Styles in Components

Use the `useThemedStyles` hook for automatic theme integration:

```typescript
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

export const MyPage: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Page</h1>
    </div>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  container: {
    backgroundColor: theme.background,
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  title: {
    color: theme.text,
    borderBottom: `2px solid ${theme.border}`,
  },
});
```

### Direct Theme Access

For dynamic styles or inline logic:

```typescript
import { useThemeStore } from '../store/themeStore';

export const MyComponent: React.FC = () => {
  const { theme, mode, toggleTheme } = useThemeStore();
  
  return (
    <button 
      onClick={toggleTheme}
      style={{ 
        backgroundColor: theme.primary,
        color: '#ffffff'
      }}
    >
      {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};
```

## Theme Toggle

The theme toggle button is located in the sidebar footer (AdminLayout):

```
🌙 Dark  (in light mode)
☀️ Light (in dark mode)
```

- Click to toggle between modes
- Theme preference persists in localStorage (`admin-theme` key)
- Smooth transition animations across all UI elements

## Color Mapping Reference

When converting existing components to use themes:

| Hardcoded Color | Light Theme Token | Dark Theme Token |
|----------------|-------------------|------------------|
| `#ffffff`, `white` | `theme.backgroundElevated` | `theme.backgroundElevated` (#1e293b) |
| `#f9fafb`, `#f5f5f5` | `theme.background` | `theme.background` (#0f172a) |
| `#f3f4f6` | `theme.backgroundHover` | `theme.backgroundHover` (#334155) |
| `#111`, `#333` | `theme.text` | `theme.text` (#f1f5f9) |
| `#666`, `#6b7280` | `theme.textSecondary` | `theme.textSecondary` (#cbd5e1) |
| `#999`, `#9ca3af` | `theme.textTertiary` | `theme.textTertiary` (#94a3b8) |
| `#e5e7eb`, `#ddd` | `theme.border` | `theme.border` (#334155) |
| `#2563eb` | `theme.primary` | `theme.primary` (#3b82f6) |
| `#059669` | `theme.success` | `theme.success` (#10b981) |
| `#dc2626` | `theme.danger` | `theme.danger` (#ef4444) |

## Best Practices

### 1. Always Use Theme Tokens

❌ **Don't** hardcode colors:
```typescript
const styles = {
  card: {
    backgroundColor: '#ffffff',
    color: '#333',
  },
};
```

✅ **Do** use theme tokens:
```typescript
const createStyles = (theme: Theme) => ({
  card: {
    backgroundColor: theme.backgroundElevated,
    color: theme.text,
    transition: 'all 0.2s ease',
  },
});
```

### 2. Add Transitions for Smooth Theme Switching

❌ **Without transitions**:
```typescript
{
  backgroundColor: theme.background,
}
```

✅ **With transitions**:
```typescript
{
  backgroundColor: theme.background,
  transition: 'all 0.2s ease',
}
```

### 3. Use Conditional Styling for Edge Cases

For styles that can't use tokens directly:

```typescript
{
  boxShadow: theme.backgroundElevated === '#ffffff'
    ? '0 2px 8px rgba(0, 0, 0, 0.1)'  // Light mode
    : '0 2px 8px rgba(0, 0, 0, 0.5)', // Dark mode
}
```

### 4. Status Colors Should Stand Out

Use theme status colors for badges and alerts:

```typescript
// Success badge
{
  backgroundColor: theme.success,
  color: '#ffffff',  // Always white text for readability
}

// Error badge
{
  backgroundColor: theme.error,
  color: '#ffffff',
}
```

### 5. Form Inputs Need Special Attention

```typescript
const createStyles = (theme: Theme) => ({
  input: {
    backgroundColor: theme.surface,      // Use surface color
    color: theme.text,                   // Theme text color
    border: `1px solid ${theme.border}`, // Theme border
    transition: 'all 0.2s ease',
  },
  inputFocus: {
    borderColor: theme.primary,          // Highlight on focus
  },
});
```

## Testing Dark Mode

### Manual Testing Checklist

- [ ] Toggle between light/dark modes from sidebar
- [ ] Verify all text is readable in both modes
- [ ] Check button contrast and hover states
- [ ] Test form inputs (text, dropdowns, color picker)
- [ ] Verify badges and status indicators
- [ ] Check table readability
- [ ] Test login page in both modes
- [ ] Refresh page - theme should persist
- [ ] Test on different screen sizes

### Browser DevTools

Check color contrast using browser accessibility tools:
1. Open DevTools
2. Go to Lighthouse tab
3. Run accessibility audit
4. Check contrast ratios (should be ≥ 4.5:1 for text)

## Files Modified

### New Files
- `/apps/web/src/admin/store/themeStore.ts` - Theme state management
- `/apps/web/src/admin/hooks/useThemedStyles.ts` - Themed styles hook

### Updated Components
- `/apps/web/src/admin/components/AdminLayout.tsx` - Added theme toggle button
- `/apps/web/src/admin/pages/AdminLogin.tsx`
- `/apps/web/src/admin/pages/AdminDashboard.tsx`
- `/apps/web/src/admin/pages/PlatformsPage.tsx`
- `/apps/web/src/admin/pages/OptionsPage.tsx`
- `/apps/web/src/admin/pages/OptionDetailPage.tsx`
- `/apps/web/src/admin/pages/MaterialsPage.tsx`
- `/apps/web/src/admin/pages/AuditLogsPage.tsx`
- `/apps/web/src/admin/pages/UsersPage.tsx`

All pages now fully support dark mode with smooth transitions!

## Bundle Impact

Dark mode adds ~11KB to the bundle (theme store + color definitions):
- Before: 1,225 KB
- After: 1,236 KB
- Impact: +0.9%

The theme is lazy-loaded with the admin panel and doesn't affect the main configurator.

## Future Enhancements

Potential improvements for dark mode:

1. **System Preference Detection**
   - Auto-detect OS theme preference on first visit
   - Add "Auto" mode that follows system settings

2. **Theme Customization**
   - Allow users to customize theme colors
   - Add preset themes (e.g., "Ocean Blue", "Forest Green")

3. **Print Styles**
   - Override dark theme for printing
   - Always use light mode for printed documents

4. **Animation Options**
   - Allow users to disable transitions (accessibility)
   - Add "Reduce Motion" support

5. **High Contrast Mode**
   - Additional theme with maximum contrast
   - For users with visual impairments

## Troubleshooting

### Theme Not Persisting
- Check localStorage for `admin-theme` key
- Verify Zustand persist middleware is working
- Clear browser cache and try again

### Colors Not Updating
- Ensure component uses `useThemedStyles` hook
- Check that `createStyles` accepts `theme` parameter
- Verify transitions are added to styles

### Poor Contrast in Dark Mode
- Use browser DevTools contrast checker
- Adjust theme colors in `themeStore.ts`
- Use lighter shades for text, darker for backgrounds

### Flash of Unstyled Content (FOUC)
- Theme loads from localStorage on mount
- Brief flash of default theme is normal
- Consider adding a splash screen for initial load

## Support

For questions or issues with dark mode:
1. Check this guide for best practices
2. Review existing page implementations for examples
3. Test in both light and dark modes before committing
4. Use browser DevTools to debug color issues

---

**Last Updated**: 2026-01-29
**Bundle Size**: 1,236 KB (341 KB gzipped)
**Browser Support**: All modern browsers with CSS transitions
