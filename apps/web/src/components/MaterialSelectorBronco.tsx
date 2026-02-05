/**
 * Material selector panel - Retro Bronco Edition.
 * 
 * Color swatches and material finishes with a premium, 
 * vintage automotive feel.
 */

import { useConfiguratorStore } from '../store/configurator';
import { MaterialZone } from '@cart-configurator/types';
import { colors, typography, spacing, borderRadius } from '../styles/broncoTheme';

// Zone configuration
const zoneConfig: Record<string, { icon: string; label: string; description: string }> = {
  [MaterialZone.BODY]: { 
    icon: '🚗', 
    label: 'BODY COLOR', 
    description: 'Main exterior finish' 
  },
  [MaterialZone.SEATS]: { 
    icon: '💺', 
    label: 'SEAT MATERIAL', 
    description: 'Interior upholstery' 
  },
  [MaterialZone.ROOF]: { 
    icon: '🏠', 
    label: 'ROOF FINISH', 
    description: 'Top covering material' 
  },
  [MaterialZone.METAL]: { 
    icon: '✨', 
    label: 'METAL TRIM', 
    description: 'Chrome, black, or custom' 
  },
  [MaterialZone.GLASS]: { 
    icon: '🪟', 
    label: 'GLASS TINT', 
    description: 'Window tint level' 
  },
};

export function MaterialSelector() {
  const allMaterials = useConfiguratorStore(state => state.allMaterials);
  const configuration = useConfiguratorStore(state => state.configuration);
  const setMaterialSelection = useConfiguratorStore(state => state.setMaterialSelection);

  if (!configuration) return null;

  const zones = Object.values(MaterialZone);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>COLORS & MATERIALS</h2>
        <p style={styles.subtitle}>Choose your perfect finish</p>
      </div>

      <div style={styles.zonesList}>
        {zones.map(zone => {
          const zoneMaterials = allMaterials.filter(mat => mat.zone === zone);
          if (zoneMaterials.length === 0) return null;

          const currentSelection = configuration.materialSelections.find(s => s.zone === zone);
          const selectedMaterial = zoneMaterials.find(m => m.id === currentSelection?.materialId);
          const config = zoneConfig[zone] || { icon: '🎨', label: zone, description: '' };

          return (
            <div key={zone} style={styles.zoneSection}>
              {/* Zone Header */}
              <div style={styles.zoneHeader}>
                <div style={styles.zoneInfo}>
                  <span style={styles.zoneIcon}>{config.icon}</span>
                  <div>
                    <span style={styles.zoneLabel}>{config.label}</span>
                    <span style={styles.zoneDescription}>{config.description}</span>
                  </div>
                </div>
                {selectedMaterial && (
                  <div style={styles.selectedPreview}>
                    <div 
                      style={{
                        ...styles.selectedSwatch,
                        background: selectedMaterial.color,
                      }}
                    />
                    <span style={styles.selectedName}>{selectedMaterial.name}</span>
                  </div>
                )}
              </div>

              {/* Material Swatches */}
              <div style={styles.swatchGrid}>
                {zoneMaterials.map(material => {
                  const isSelected = currentSelection?.materialId === material.id;

                  return (
                    <button
                      key={material.id}
                      onClick={() => setMaterialSelection({ zone, materialId: material.id })}
                      style={{
                        ...styles.swatchButton,
                        ...(isSelected ? styles.swatchButtonSelected : {}),
                      }}
                      title={`${material.name} - ${material.finish}`}
                    >
                      <div 
                        style={{
                          ...styles.swatchColor,
                          background: material.color,
                        }}
                      >
                        {isSelected && (
                          <div style={styles.swatchCheck}>✓</div>
                        )}
                      </div>
                      <div style={styles.swatchInfo}>
                        <span style={styles.swatchName}>{material.name}</span>
                        <span style={styles.swatchFinish}>{material.finish}</span>
                        {material.priceMultiplier > 1 && (
                          <span style={styles.swatchPrice}>
                            +{Math.round((material.priceMultiplier - 1) * 100)}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
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

  zonesList: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.md,
  },

  zoneSection: {
    marginBottom: spacing.xl,
  },
  
  zoneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottom: `1px solid ${colors.warmGray}20`,
  },
  zoneInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  zoneIcon: {
    fontSize: '24px',
  },
  zoneLabel: {
    display: 'block',
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    color: colors.offWhite,
    letterSpacing: '1px',
  },
  zoneDescription: {
    display: 'block',
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    marginTop: '2px',
  },
  
  selectedPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.xs} ${spacing.md}`,
    background: colors.cardBg,
    borderRadius: borderRadius.pill,
  },
  selectedSwatch: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: `2px solid ${colors.offWhite}`,
  },
  selectedName: {
    fontSize: typography.sizes.small,
    color: colors.offWhite,
    fontWeight: typography.weights.medium,
  },

  swatchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: spacing.md,
  },

  swatchButton: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    background: colors.cardBg,
    border: `2px solid transparent`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  swatchButtonSelected: {
    border: `2px solid ${colors.broncoOrange}`,
    boxShadow: `0 0 12px ${colors.broncoOrange}40`,
  },

  swatchColor: {
    position: 'relative',
    width: '100%',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchCheck: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: colors.offWhite,
    color: colors.broncoOrange,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: typography.weights.bold,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },

  swatchInfo: {
    padding: spacing.sm,
    background: colors.panelBg,
  },
  swatchName: {
    display: 'block',
    fontSize: typography.sizes.small,
    color: colors.offWhite,
    fontWeight: typography.weights.medium,
    marginBottom: '2px',
  },
  swatchFinish: {
    display: 'block',
    fontSize: typography.sizes.tiny,
    color: colors.broncoSand,
    textTransform: 'capitalize',
  },
  swatchPrice: {
    display: 'block',
    fontSize: typography.sizes.tiny,
    color: colors.desertSunset,
    marginTop: spacing.xs,
    fontWeight: typography.weights.bold,
  },
};
