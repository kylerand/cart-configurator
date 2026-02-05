/**
 * Platform selector component - Retro Bronco Edition.
 * 
 * Premium platform selection with vintage car card design.
 */

import { useState, useEffect } from 'react';
import { fetchAllPlatforms } from '../api/client';
import { useConfiguratorStore } from '../store/configurator';
import type { Platform } from '@cart-configurator/types';
import { colors, typography, spacing } from '../styles/broncoTheme';

export function PlatformSelector() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const currentPlatformId = useConfiguratorStore(state => state.configuration?.platformId);
  const switchPlatform = useConfiguratorStore(state => state.switchPlatform);
  
  const currentPlatform = platforms.find(p => p.id === currentPlatformId);

  useEffect(() => {
    loadPlatforms();
  }, []);

  async function loadPlatforms() {
    try {
      const data = await fetchAllPlatforms();
      setPlatforms(data);
    } catch (error) {
      console.error('Failed to load platforms:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <span style={styles.loadingText}>Loading platforms...</span>
        </div>
      </div>
    );
  }

  if (platforms.length <= 1 && currentPlatform) {
    // Single platform - show as static display
    return (
      <div style={styles.container}>
        <div style={styles.singlePlatform}>
          <span style={styles.label}>PLATFORM</span>
          <div style={styles.platformName}>{currentPlatform.name}</div>
          <div style={styles.platformPrice}>Starting at ${currentPlatform.basePrice.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button 
        style={styles.selector}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={styles.selectorContent}>
          <span style={styles.label}>SELECT YOUR PLATFORM</span>
          {currentPlatform ? (
            <div style={styles.selectedPlatform}>
              <span style={styles.platformName}>{currentPlatform.name}</span>
              <span style={styles.platformPrice}>${currentPlatform.basePrice.toLocaleString()}</span>
            </div>
          ) : (
            <span style={styles.placeholder}>Choose a platform...</span>
          )}
        </div>
        <span style={{
          ...styles.arrow,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▼</span>
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          {platforms.map(platform => {
            const isSelected = platform.id === currentPlatformId;
            
            return (
              <button
                key={platform.id}
                style={{
                  ...styles.option,
                  ...(isSelected ? styles.optionSelected : {}),
                }}
                onClick={() => {
                  switchPlatform(platform);
                  setIsOpen(false);
                }}
              >
                <div style={styles.optionContent}>
                  <div style={styles.optionHeader}>
                    <span style={styles.optionName}>{platform.name}</span>
                    {isSelected && <span style={styles.checkmark}>✓</span>}
                  </div>
                  <p style={styles.optionDescription}>{platform.description}</p>
                  <div style={styles.optionFooter}>
                    <span style={styles.optionPrice}>
                      Starting at <strong>${platform.basePrice.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
                
                {/* Selection indicator */}
                <div style={{
                  ...styles.selectionBar,
                  ...(isSelected ? styles.selectionBarActive : {}),
                }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderBottom: `1px solid ${colors.warmGray}20`,
  },
  
  loading: {
    padding: spacing.lg,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
  },

  singlePlatform: {
    padding: spacing.lg,
  },

  selector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: spacing.lg,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s ease',
  },
  selectorContent: {
    flex: 1,
  },
  
  label: {
    display: 'block',
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.tiny,
    color: colors.broncoOrange,
    letterSpacing: '1px',
    marginBottom: spacing.xs,
  },
  
  selectedPlatform: {
    display: 'flex',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  platformName: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h3,
    color: colors.offWhite,
    letterSpacing: '1px',
  },
  platformPrice: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
  },
  placeholder: {
    fontSize: typography.sizes.body,
    color: colors.broncoSand,
  },
  
  arrow: {
    fontSize: '12px',
    color: colors.broncoSand,
    transition: 'transform 0.2s ease',
  },

  dropdown: {
    borderTop: `1px solid ${colors.warmGray}20`,
    background: colors.cardBg,
  },

  option: {
    position: 'relative',
    display: 'block',
    width: '100%',
    padding: spacing.md,
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${colors.warmGray}10`,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s ease',
    overflow: 'hidden',
  },
  optionSelected: {
    background: `${colors.broncoOrange}10`,
  },
  optionContent: {
    position: 'relative',
    zIndex: 1,
  },
  optionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  optionName: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    color: colors.offWhite,
    letterSpacing: '1px',
  },
  checkmark: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: colors.broncoOrange,
    color: colors.offWhite,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: typography.weights.bold,
  },
  optionDescription: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    margin: 0,
    marginBottom: spacing.sm,
    lineHeight: 1.4,
  },
  optionFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionPrice: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
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
