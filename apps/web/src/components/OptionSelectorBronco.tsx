/**
 * Option selector panel - Retro Bronco Edition.
 * 
 * Displays available options grouped by category with rugged, 
 * vintage-inspired design cards.
 */

import { useState } from 'react';
import { useConfiguratorStore } from '../store/configurator';
import { OptionCategory } from '@cart-configurator/types';
import { colors, typography, spacing, borderRadius } from '../styles/broncoTheme';

// Category icons and display names
const categoryConfig: Record<string, { icon: string; label: string }> = {
  [OptionCategory.WHEELS]: { icon: '🛞', label: 'WHEELS & TIRES' },
  [OptionCategory.ROOF]: { icon: '🏠', label: 'ROOF OPTIONS' },
  [OptionCategory.SEATING]: { icon: '💺', label: 'SEATING' },
  [OptionCategory.STORAGE]: { icon: '📦', label: 'STORAGE & CARGO' },
  [OptionCategory.LIGHTING]: { icon: '💡', label: 'LIGHTING' },
  [OptionCategory.ELECTRONICS]: { icon: '🔊', label: 'AUDIO & ELECTRONICS' },
  [OptionCategory.SUSPENSION]: { icon: '🔧', label: 'SUSPENSION' },
  [OptionCategory.FABRICATION]: { icon: '⚒️', label: 'FABRICATION' },
};

export function OptionSelector() {
  const allOptions = useConfiguratorStore(state => state.allOptions);
  const configuration = useConfiguratorStore(state => state.configuration);
  const addOption = useConfiguratorStore(state => state.addOption);
  const removeOption = useConfiguratorStore(state => state.removeOption);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(OptionCategory.WHEELS);

  if (!configuration) return null;

  const categories = Object.values(OptionCategory);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>CUSTOMIZE YOUR BUILD</h2>
        <p style={styles.subtitle}>Select options to make it yours</p>
      </div>

      <div style={styles.categoriesList}>
        {categories.map(category => {
          const categoryOptions = allOptions.filter(opt => opt.category === category);
          if (categoryOptions.length === 0) return null;

          const config = categoryConfig[category] || { icon: '⚙️', label: category };
          const isExpanded = expandedCategory === category;
          const selectedCount = categoryOptions.filter(opt => 
            configuration.selectedOptions.includes(opt.id)
          ).length;

          return (
            <div key={category} style={styles.categorySection}>
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                style={styles.categoryHeader}
              >
                <div style={styles.categoryInfo}>
                  <span style={styles.categoryIcon}>{config.icon}</span>
                  <span style={styles.categoryLabel}>{config.label}</span>
                </div>
                <div style={styles.categoryMeta}>
                  {selectedCount > 0 && (
                    <span style={styles.selectedBadge}>{selectedCount}</span>
                  )}
                  <span style={{
                    ...styles.expandIcon,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Category Options */}
              {isExpanded && (
                <div style={styles.optionsList}>
                  {categoryOptions.map(option => {
                    const isSelected = configuration.selectedOptions.includes(option.id);

                    return (
                      <div
                        key={option.id}
                        style={{
                          ...styles.optionCard,
                          ...(isSelected ? styles.optionCardSelected : {}),
                        }}
                        onClick={() => isSelected ? removeOption(option.id) : addOption(option.id)}
                      >
                        <div style={styles.optionContent}>
                          <div style={styles.optionHeader}>
                            <h4 style={styles.optionName}>{option.name}</h4>
                            <div style={{
                              ...styles.checkbox,
                              ...(isSelected ? styles.checkboxSelected : {}),
                            }}>
                              {isSelected && '✓'}
                            </div>
                          </div>
                          
                          <p style={styles.optionDescription}>{option.description}</p>
                          
                          <div style={styles.optionPricing}>
                            <div style={styles.priceItem}>
                              <span style={styles.priceLabel}>Parts</span>
                              <span style={styles.priceValue}>${option.partPrice.toLocaleString()}</span>
                            </div>
                            <div style={styles.priceDivider} />
                            <div style={styles.priceItem}>
                              <span style={styles.priceLabel}>Labor</span>
                              <span style={styles.priceValue}>{option.laborHours}h</span>
                            </div>
                          </div>
                        </div>

                        {/* Selection indicator bar */}
                        <div style={{
                          ...styles.selectionBar,
                          ...(isSelected ? styles.selectionBarActive : {}),
                        }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    padding: spacing.lg,
    borderBottom: `1px solid ${colors.warmGray}20`,
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h2,
    color: colors.broncoOrange,
    letterSpacing: '2px',
    margin: 0,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    margin: 0,
  },
  
  categoriesList: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.md,
  },
  
  categorySection: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    background: colors.cardBg,
    border: `1px solid ${colors.warmGray}20`,
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: spacing.md,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: colors.offWhite,
  },
  categoryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryIcon: {
    fontSize: '20px',
  },
  categoryLabel: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    letterSpacing: '1px',
  },
  categoryMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: borderRadius.pill,
    background: colors.broncoOrange,
    color: colors.offWhite,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.bold,
  },
  expandIcon: {
    fontSize: '10px',
    color: colors.broncoSand,
    transition: 'transform 0.2s ease',
  },

  optionsList: {
    padding: `0 ${spacing.md} ${spacing.md}`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  
  optionCard: {
    position: 'relative',
    padding: spacing.md,
    background: colors.panelBg,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.warmGray}20`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  },
  optionCardSelected: {
    border: `1px solid ${colors.broncoOrange}60`,
    background: `${colors.broncoOrange}10`,
  },
  
  optionContent: {
    position: 'relative',
    zIndex: 1,
  },
  optionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  optionName: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.offWhite,
    margin: 0,
  },
  checkbox: {
    width: '22px',
    height: '22px',
    borderRadius: borderRadius.sm,
    border: `2px solid ${colors.warmGray}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: colors.offWhite,
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  checkboxSelected: {
    background: colors.broncoOrange,
    border: `2px solid ${colors.broncoOrange}`,
  },
  
  optionDescription: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    margin: 0,
    marginBottom: spacing.md,
    lineHeight: 1.4,
  },
  
  optionPricing: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTop: `1px solid ${colors.warmGray}20`,
  },
  priceItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: typography.sizes.tiny,
    color: colors.broncoSand,
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },
  priceValue: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    color: colors.offWhite,
    letterSpacing: '0.5px',
  },
  priceDivider: {
    width: '1px',
    height: '24px',
    background: colors.warmGray,
    opacity: 0.3,
  },
  
  selectionBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    background: 'transparent',
    transition: 'background 0.2s ease',
  },
  selectionBarActive: {
    background: colors.broncoOrange,
  },
};
