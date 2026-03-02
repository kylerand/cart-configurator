/**
 * Rich info panel modal for option details.
 * 
 * Shows extended description and optional image for a configuration option.
 * Inspired by Velocity Restorations' info-panel overlays.
 */

import { useEffect } from 'react';
import { ConfigOption } from '@cart-configurator/types';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/broncoTheme';

interface InfoPanelProps {
  option: ConfigOption;
  onClose: () => void;
}

export function InfoPanel({ option, onClose }: InfoPanelProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>✕</button>

        <div style={styles.content}>
          <h2 style={styles.heading}>{option.name}</h2>
          <span style={styles.category}>{option.category}</span>

          <p style={styles.description}>{option.description}</p>

          <div style={styles.specs}>
            <div style={styles.specRow}>
              <span style={styles.specLabel}>Parts Cost</span>
              <span style={styles.specValue}>${option.partPrice.toLocaleString()}</span>
            </div>
            <div style={styles.specRow}>
              <span style={styles.specLabel}>Labor Hours</span>
              <span style={styles.specValue}>{option.laborHours}h</span>
            </div>
            {option.requires.length > 0 && (
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Requires</span>
                <span style={styles.specValue}>{option.requires.join(', ')}</span>
              </div>
            )}
            {option.excludes.length > 0 && (
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Excludes</span>
                <span style={styles.specValue}>{option.excludes.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  panel: {
    position: 'relative',
    width: '480px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflowY: 'auto',
    background: colors.panelBg,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.warmGray}30`,
    boxShadow: shadows.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.cardBg,
    border: `1px solid ${colors.warmGray}30`,
    borderRadius: borderRadius.pill,
    color: colors.broncoSand,
    fontSize: '14px',
    cursor: 'pointer',
  },
  content: {
    padding: spacing.xl,
  },
  heading: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h1,
    color: colors.offWhite,
    letterSpacing: '1px',
    margin: 0,
    marginBottom: spacing.sm,
  },
  category: {
    display: 'inline-block',
    padding: `${spacing.xs} ${spacing.sm}`,
    background: `${colors.broncoOrange}20`,
    color: colors.broncoOrange,
    borderRadius: borderRadius.sm,
    fontSize: typography.sizes.tiny,
    fontFamily: typography.fontFamily.display,
    letterSpacing: '1px',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.sizes.body,
    color: colors.broncoSand,
    lineHeight: 1.6,
    margin: 0,
    marginBottom: spacing.xl,
  },
  specs: {
    borderTop: `1px solid ${colors.warmGray}20`,
    paddingTop: spacing.lg,
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.sm} 0`,
    borderBottom: `1px solid ${colors.warmGray}10`,
  },
  specLabel: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
  },
  specValue: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    color: colors.offWhite,
    letterSpacing: '0.5px',
  },
};
