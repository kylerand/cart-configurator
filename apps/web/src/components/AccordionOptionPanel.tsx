/**
 * Accordion-style option panel for the 2D configurator.
 * 
 * Velocity-style L1 accordion categories that expand to show option cards.
 * Each category click can auto-switch the image compositor view angle.
 * Supports both radio-group (mutually exclusive) and checkbox (add-on) option types.
 */

import { useState, useCallback } from 'react';
import { useConfiguratorStore } from '../store/configurator';
import { ConfigOption, OptionCategory } from '@cart-configurator/types';
import { InfoPanel } from './InfoPanel';
import { ViewAngle, CATEGORY_TO_VIEW } from './ImageCompositor';
import { colors, typography, spacing, borderRadius } from '../styles/broncoTheme';

const categoryConfig: Record<string, { icon: string; label: string; viewAngle: ViewAngle }> = {
  [OptionCategory.WHEELS]: { icon: '🛞', label: 'WHEELS & TIRES', viewAngle: 'front' },
  [OptionCategory.ROOF]: { icon: '🏠', label: 'ROOF OPTIONS', viewAngle: 'front' },
  [OptionCategory.SEATING]: { icon: '💺', label: 'SEATING', viewAngle: 'interior' },
  [OptionCategory.STORAGE]: { icon: '📦', label: 'STORAGE & CARGO', viewAngle: 'rear' },
  [OptionCategory.LIGHTING]: { icon: '💡', label: 'LIGHTING', viewAngle: 'front' },
  [OptionCategory.ELECTRONICS]: { icon: '🔊', label: 'AUDIO & ELECTRONICS', viewAngle: 'interior' },
  [OptionCategory.SUSPENSION]: { icon: '🔧', label: 'SUSPENSION', viewAngle: 'front' },
  [OptionCategory.FABRICATION]: { icon: '⚒️', label: 'FABRICATION', viewAngle: 'rear' },
};

// Categories where options are mutually exclusive (radio-button behavior)
const RADIO_CATEGORIES = new Set([
  OptionCategory.WHEELS,
  OptionCategory.ROOF,
  OptionCategory.SUSPENSION,
]);

interface AccordionOptionPanelProps {
  onViewChange?: (view: ViewAngle) => void;
}

export function AccordionOptionPanel({ onViewChange }: AccordionOptionPanelProps) {
  const allOptions = useConfiguratorStore(state => state.allOptions);
  const configuration = useConfiguratorStore(state => state.configuration);
  const addOption = useConfiguratorStore(state => state.addOption);
  const removeOption = useConfiguratorStore(state => state.removeOption);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(OptionCategory.WHEELS);
  const [infoOption, setInfoOption] = useState<ConfigOption | null>(null);

  const handleCategoryClick = useCallback((category: string) => {
    const isExpanding = expandedCategory !== category;
    setExpandedCategory(isExpanding ? category : null);

    // Auto-switch view when expanding a category
    if (isExpanding && onViewChange) {
      const view = CATEGORY_TO_VIEW[category];
      if (view) onViewChange(view);
    }
  }, [expandedCategory, onViewChange]);

  const handleOptionToggle = useCallback((option: ConfigOption) => {
    if (!configuration) return;

    const isSelected = configuration.selectedOptions.includes(option.id);
    const isRadio = RADIO_CATEGORIES.has(option.category as OptionCategory);

    if (isRadio && !isSelected) {
      // Deselect other options in same category first
      const categoryOptions = allOptions.filter(o => o.category === option.category);
      for (const opt of categoryOptions) {
        if (configuration.selectedOptions.includes(opt.id)) {
          removeOption(opt.id);
        }
      }
      addOption(option.id);
    } else if (isSelected) {
      removeOption(option.id);
    } else {
      addOption(option.id);
    }
  }, [configuration, allOptions, addOption, removeOption]);

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

          const config = categoryConfig[category] || { icon: '⚙️', label: category, viewAngle: 'front' };
          const isExpanded = expandedCategory === category;
          const isRadio = RADIO_CATEGORIES.has(category);
          const selectedCount = categoryOptions.filter(opt =>
            configuration.selectedOptions.includes(opt.id)
          ).length;

          return (
            <div key={category} style={styles.categorySection}>
              {/* Category Header */}
              <button
                onClick={() => handleCategoryClick(category)}
                style={styles.categoryHeader}
              >
                <div style={styles.categoryInfo}>
                  <span style={styles.categoryIcon}>{config.icon}</span>
                  <div>
                    <span style={styles.categoryLabel}>{config.label}</span>
                    {isRadio && (
                      <span style={styles.categoryHint}>Choose one</span>
                    )}
                  </div>
                </div>
                <div style={styles.categoryMeta}>
                  {selectedCount > 0 && (
                    <span style={styles.selectedBadge}>{selectedCount}</span>
                  )}
                  <span style={{
                    ...styles.expandIcon,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▼</span>
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
                      >
                        <div
                          style={styles.optionClickArea}
                          onClick={() => handleOptionToggle(option)}
                        >
                          {/* Radio or Checkbox indicator */}
                          <div style={{
                            ...(isRadio ? styles.radio : styles.checkbox),
                            ...(isSelected ? (isRadio ? styles.radioSelected : styles.checkboxSelected) : {}),
                          }}>
                            {isSelected && (isRadio ? '●' : '✓')}
                          </div>

                          <div style={styles.optionContent}>
                            <h4 style={styles.optionName}>{option.name}</h4>
                            <p style={styles.optionDescription}>{option.description}</p>
                            <div style={styles.optionPrice}>
                              <span style={styles.priceText}>
                                +${option.partPrice.toLocaleString()}
                              </span>
                              {option.laborHours > 0 && (
                                <span style={styles.laborText}>
                                  {option.laborHours}h labor
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Info button */}
                        <button
                          style={styles.infoButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setInfoOption(option);
                          }}
                          title="More info"
                        >
                          ⓘ
                        </button>

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

      {/* Prev/Next navigation */}
      <div style={styles.navButtons}>
        <button
          style={styles.navButton}
          onClick={() => {
            const idx = categories.indexOf(expandedCategory as OptionCategory);
            if (idx > 0) handleCategoryClick(categories[idx - 1]);
          }}
          disabled={!expandedCategory || categories.indexOf(expandedCategory as OptionCategory) === 0}
        >
          ← PREV
        </button>
        <button
          style={styles.navButton}
          onClick={() => {
            const idx = categories.indexOf(expandedCategory as OptionCategory);
            if (idx < categories.length - 1) handleCategoryClick(categories[idx + 1]);
          }}
          disabled={!expandedCategory || categories.indexOf(expandedCategory as OptionCategory) === categories.length - 1}
        >
          NEXT →
        </button>
      </div>

      {/* Info Panel Modal */}
      {infoOption && (
        <InfoPanel option={infoOption} onClose={() => setInfoOption(null)} />
      )}
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
    display: 'block',
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    letterSpacing: '1px',
  },
  categoryHint: {
    display: 'block',
    fontSize: typography.sizes.tiny,
    color: colors.broncoSand,
    letterSpacing: '0.5px',
    marginTop: '2px',
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
    display: 'flex',
    alignItems: 'stretch',
    background: colors.panelBg,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.warmGray}20`,
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },
  optionCardSelected: {
    border: `1px solid ${colors.broncoOrange}60`,
    background: `${colors.broncoOrange}10`,
  },

  optionClickArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    cursor: 'pointer',
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
    marginTop: '2px',
  },
  checkboxSelected: {
    background: colors.broncoOrange,
    border: `2px solid ${colors.broncoOrange}`,
  },
  radio: {
    width: '22px',
    height: '22px',
    borderRadius: borderRadius.pill,
    border: `2px solid ${colors.warmGray}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: colors.offWhite,
    transition: 'all 0.2s ease',
    flexShrink: 0,
    marginTop: '2px',
  },
  radioSelected: {
    background: colors.broncoOrange,
    border: `2px solid ${colors.broncoOrange}`,
  },

  optionContent: {
    flex: 1,
    minWidth: 0,
  },
  optionName: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.offWhite,
    margin: 0,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    margin: 0,
    marginBottom: spacing.sm,
    lineHeight: 1.4,
  },
  optionPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceText: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    color: colors.offWhite,
    letterSpacing: '0.5px',
  },
  laborText: {
    fontSize: typography.sizes.tiny,
    color: colors.broncoSand,
    letterSpacing: '0.5px',
  },

  infoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    background: 'transparent',
    border: 'none',
    borderLeft: `1px solid ${colors.warmGray}15`,
    color: colors.broncoSand,
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    flexShrink: 0,
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

  navButtons: {
    display: 'flex',
    gap: spacing.sm,
    padding: spacing.md,
    borderTop: `1px solid ${colors.warmGray}20`,
  },
  navButton: {
    flex: 1,
    padding: `${spacing.sm} ${spacing.md}`,
    background: colors.cardBg,
    border: `1px solid ${colors.warmGray}20`,
    borderRadius: borderRadius.md,
    color: colors.broncoSand,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.small,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
};
