/**
 * 2D Image Compositor — Velocity-style layered image viewer.
 * 
 * Renders stacked transparent images based on current configuration
 * selections. Each view angle (front, rear, interior) shows layered
 * images that composite to form the configured cart appearance.
 * 
 * Image naming convention:
 *   /assets/2d/{optionId}-cart-{view}{component}-{variant}.webp
 * 
 * Falls back to placeholder silhouettes when images aren't available.
 */

import { useState, useCallback } from 'react';
import { useConfiguratorStore } from '../store/configurator';
import { OptionCategory, MaterialZone } from '@cart-configurator/types';
import { colors, typography, spacing, borderRadius } from '../styles/broncoTheme';

export type ViewAngle = 'front' | 'rear' | 'interior';

interface ViewConfig {
  id: ViewAngle;
  label: string;
  icon: string;
  layers: string[];
}

const VIEW_CONFIGS: ViewConfig[] = [
  { id: 'front', label: 'Front', icon: '🚗', layers: ['background', 'body', 'wheels', 'roof', 'accessories'] },
  { id: 'rear', label: 'Rear', icon: '🔙', layers: ['background', 'body', 'wheels', 'roof', 'storage', 'accessories'] },
  { id: 'interior', label: 'Interior', icon: '🪑', layers: ['background', 'seats', 'dash', 'audio'] },
];

// Map option categories to their image layer slot
const CATEGORY_TO_LAYER: Record<string, string> = {
  [OptionCategory.WHEELS]: 'wheels',
  [OptionCategory.ROOF]: 'roof',
  [OptionCategory.SEATING]: 'seats',
  [OptionCategory.STORAGE]: 'storage',
  [OptionCategory.LIGHTING]: 'accessories',
  [OptionCategory.ELECTRONICS]: 'audio',
  [OptionCategory.SUSPENSION]: 'body',
  [OptionCategory.FABRICATION]: 'accessories',
};

// Map option categories to the best view angle
export const CATEGORY_TO_VIEW: Partial<Record<string, ViewAngle>> = {
  [OptionCategory.WHEELS]: 'front',
  [OptionCategory.ROOF]: 'front',
  [OptionCategory.SEATING]: 'interior',
  [OptionCategory.STORAGE]: 'rear',
  [OptionCategory.LIGHTING]: 'front',
  [OptionCategory.ELECTRONICS]: 'interior',
  [OptionCategory.SUSPENSION]: 'front',
  [OptionCategory.FABRICATION]: 'rear',
};

interface ImageCompositorProps {
  activeView?: ViewAngle;
  onViewChange?: (view: ViewAngle) => void;
}

export function ImageCompositor({ activeView: controlledView, onViewChange }: ImageCompositorProps) {
  const [internalView, setInternalView] = useState<ViewAngle>('front');
  const configuration = useConfiguratorStore(state => state.configuration);
  const allOptions = useConfiguratorStore(state => state.allOptions);
  const platform = useConfiguratorStore(state => state.platform);

  const activeView = controlledView ?? internalView;

  const handleViewChange = useCallback((view: ViewAngle) => {
    if (onViewChange) {
      onViewChange(view);
    } else {
      setInternalView(view);
    }
  }, [onViewChange]);

  const currentViewConfig = VIEW_CONFIGS.find(v => v.id === activeView) || VIEW_CONFIGS[0];

  // Build image layers based on current selections
  const bodyMaterial = configuration?.materialSelections.find(s => s.zone === MaterialZone.BODY);
  const imageLayers = buildImageLayers(
    currentViewConfig,
    configuration?.selectedOptions || [],
    allOptions,
    bodyMaterial?.materialId
  );

  return (
    <div style={styles.container}>
      {/* Image viewport */}
      <div style={styles.viewport}>
        {/* Background gradient */}
        <div style={styles.background} />

        {/* Stacked image layers */}
        <div style={styles.layerStack}>
          {imageLayers.map((layer, index) => (
            <img
              key={`${activeView}-${layer.slot}-${index}`}
              src={layer.src}
              alt={layer.alt}
              style={{
                ...styles.layer,
                zIndex: index + 1,
              }}
              onError={(e) => {
                // Hide broken images gracefully
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ))}

          {/* Placeholder when no images */}
          {imageLayers.length === 0 && (
            <div style={styles.placeholder}>
              <span style={styles.placeholderIcon}>🛒</span>
              <span style={styles.placeholderText}>
                {activeView === 'front' ? 'Front View' : activeView === 'rear' ? 'Rear View' : 'Interior View'}
              </span>
              <span style={styles.placeholderHint}>
                Add 2D render images to /assets/2d/ to see your build
              </span>
            </div>
          )}
        </div>

        {/* Platform badge */}
        {platform && (
          <div style={styles.platformBadge}>
            <span style={styles.platformBadgeLabel}>PLATFORM</span>
            <span style={styles.platformBadgeName}>{platform.name}</span>
          </div>
        )}
      </div>

      {/* View selector dots */}
      <div style={styles.viewSelector}>
        {VIEW_CONFIGS.map(view => (
          <button
            key={view.id}
            onClick={() => handleViewChange(view.id)}
            style={{
              ...styles.viewButton,
              ...(activeView === view.id ? styles.viewButtonActive : {}),
            }}
            title={view.label}
          >
            <span style={styles.viewIcon}>{view.icon}</span>
            <span style={styles.viewLabel}>{view.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ImageLayer {
  src: string;
  alt: string;
  slot: string;
}

function buildImageLayers(
  viewConfig: ViewConfig,
  selectedOptions: string[],
  allOptions: { id: string; category: string; name: string }[],
  bodyMaterialId?: string
): ImageLayer[] {
  const layers: ImageLayer[] = [];
  const view = viewConfig.id;

  // Background layer
  const bgSrc = `/assets/2d/background-${view}.webp`;
  layers.push({ src: bgSrc, alt: `${view} background`, slot: 'background' });

  // Body color layer from material selection
  if (bodyMaterialId) {
    const bodySrc = `/assets/2d/${bodyMaterialId}-cart-${view}-body.webp`;
    layers.push({ src: bodySrc, alt: `Body color (${view})`, slot: 'body-color' });
  }

  // Option layers — find selected options and map to image paths
  for (const optionId of selectedOptions) {
    const option = allOptions.find(o => o.id === optionId);
    if (!option) continue;

    const layerSlot = CATEGORY_TO_LAYER[option.category];
    if (!layerSlot || !viewConfig.layers.includes(layerSlot)) continue;

    const src = `/assets/2d/${optionId}-cart-${view}-${layerSlot}.webp`;
    layers.push({
      src,
      alt: `${option.name} (${view} ${layerSlot})`,
      slot: layerSlot,
    });
  }

  return layers;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  viewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(ellipse at center, ${colors.charcoal} 0%, ${colors.canvasBg} 100%)`,
  },
  layerStack: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
  },
  placeholder: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    zIndex: 10,
  },
  placeholderIcon: {
    fontSize: '80px',
    opacity: 0.2,
  },
  placeholderText: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h2,
    color: colors.broncoSand,
    letterSpacing: '2px',
    opacity: 0.5,
  },
  placeholderHint: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    opacity: 0.3,
    maxWidth: '300px',
    textAlign: 'center',
  },
  platformBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    padding: `${spacing.sm} ${spacing.md}`,
    background: `${colors.panelBg}EE`,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.broncoOrange}40`,
    backdropFilter: 'blur(8px)',
    zIndex: 20,
  },
  platformBadgeLabel: {
    display: 'block',
    fontSize: typography.sizes.tiny,
    color: colors.broncoOrange,
    letterSpacing: '1px',
    marginBottom: '2px',
  },
  platformBadgeName: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h3,
    color: colors.offWhite,
    letterSpacing: '1px',
  },
  viewSelector: {
    display: 'flex',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    background: colors.panelBg,
    borderTop: `1px solid ${colors.warmGray}20`,
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    background: colors.cardBg,
    border: `1px solid ${colors.warmGray}20`,
    borderRadius: borderRadius.md,
    color: colors.broncoSand,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewButtonActive: {
    background: `${colors.broncoOrange}20`,
    border: `1px solid ${colors.broncoOrange}60`,
    color: colors.offWhite,
  },
  viewIcon: {
    fontSize: '16px',
  },
  viewLabel: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.small,
    letterSpacing: '1px',
  },
};
