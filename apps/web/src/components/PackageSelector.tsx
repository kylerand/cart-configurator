/**
 * Package / starter template selector.
 * 
 * Inspired by Velocity Restorations' package system (Signature, Blackout, Ranger).
 * Allows users to quick-start with a pre-configured set of options.
 */

import { useCallback } from 'react';
import { useConfiguratorStore } from '../store/configurator';
import { OptionId } from '@cart-configurator/types';
import { colors, typography, spacing, borderRadius } from '../styles/broncoTheme';

interface Package {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedPrice: string;
  optionIds: OptionId[];
}

/**
 * Pre-configured packages. Update these option IDs to match
 * the actual options in your catalog.
 */
const PACKAGES: Package[] = [
  {
    id: 'economy',
    name: 'ESSENTIALS',
    description: 'Standard setup with basic options. Great starting point for budget-conscious builds.',
    icon: '⚡',
    estimatedPrice: '~$9,500',
    optionIds: [],
  },
  {
    id: 'popular',
    name: 'POPULAR BUILD',
    description: 'Our most requested configuration. Chrome wheels, extended roof, upgraded seats.',
    icon: '⭐',
    estimatedPrice: '~$13,000',
    optionIds: [],
  },
  {
    id: 'premium',
    name: 'FULLY LOADED',
    description: 'Every premium option included. The ultimate cart experience.',
    icon: '👑',
    estimatedPrice: '~$17,500',
    optionIds: [],
  },
];

export function PackageSelector() {
  const configuration = useConfiguratorStore(state => state.configuration);
  const addOption = useConfiguratorStore(state => state.addOption);
  const removeOption = useConfiguratorStore(state => state.removeOption);
  const allOptions = useConfiguratorStore(state => state.allOptions);

  const applyPackage = useCallback((pkg: Package) => {
    if (!configuration) return;

    // Remove all currently selected options
    for (const optionId of [...configuration.selectedOptions]) {
      removeOption(optionId);
    }

    // Add all package options
    for (const optionId of pkg.optionIds) {
      const exists = allOptions.find(o => o.id === optionId);
      if (exists) addOption(optionId);
    }
  }, [configuration, allOptions, addOption, removeOption]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>QUICK START</h3>
        <p style={styles.subtitle}>Choose a package or start from scratch</p>
      </div>

      <div style={styles.packages}>
        {PACKAGES.map(pkg => (
          <button
            key={pkg.id}
            style={styles.packageCard}
            onClick={() => applyPackage(pkg)}
          >
            <span style={styles.packageIcon}>{pkg.icon}</span>
            <div style={styles.packageInfo}>
              <span style={styles.packageName}>{pkg.name}</span>
              <span style={styles.packageDescription}>{pkg.description}</span>
              <span style={styles.packagePrice}>{pkg.estimatedPrice}</span>
            </div>
          </button>
        ))}

        {/* Start fresh option */}
        <button
          style={{
            ...styles.packageCard,
            ...styles.freshCard,
          }}
          onClick={() => {
            if (!configuration) return;
            for (const optionId of [...configuration.selectedOptions]) {
              removeOption(optionId);
            }
          }}
        >
          <span style={styles.packageIcon}>🔄</span>
          <div style={styles.packageInfo}>
            <span style={styles.packageName}>START FRESH</span>
            <span style={styles.packageDescription}>Clear all selections and build from scratch.</span>
          </div>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: spacing.md,
    borderBottom: `1px solid ${colors.warmGray}20`,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h3,
    color: colors.broncoOrange,
    letterSpacing: '1px',
    margin: 0,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    margin: 0,
  },

  packages: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },

  packageCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    background: colors.cardBg,
    border: `1px solid ${colors.warmGray}20`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    color: colors.offWhite,
    width: '100%',
  },
  freshCard: {
    background: 'transparent',
    border: `1px dashed ${colors.warmGray}40`,
  },

  packageIcon: {
    fontSize: '24px',
    flexShrink: 0,
    marginTop: '2px',
  },
  packageInfo: {
    flex: 1,
    minWidth: 0,
  },
  packageName: {
    display: 'block',
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    letterSpacing: '1px',
    marginBottom: spacing.xs,
  },
  packageDescription: {
    display: 'block',
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    lineHeight: 1.4,
    marginBottom: spacing.sm,
  },
  packagePrice: {
    display: 'block',
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    color: colors.broncoOrange,
    letterSpacing: '0.5px',
  },
};
