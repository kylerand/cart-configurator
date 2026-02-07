/**
 * Main configurator page - Retro Bronco Edition.
 * 
 * A premium, immersive cart building experience inspired by
 * classic Ford Bronco aesthetics and vintage automotive design.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartScene } from '../three/scene/CartScene';
import { OptionSelector } from '../components/OptionSelectorBronco';
import { MaterialSelector } from '../components/MaterialSelectorBronco';
import { PricingSummary } from '../components/PricingSummaryBronco';
import { PlatformSelector } from '../components/PlatformSelectorBronco';
import { useConfiguratorStore } from '../store/configurator';
import { saveConfiguration } from '../api/client';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/broncoTheme';

export function ConfiguratorPage() {
  const navigate = useNavigate();
  const configuration = useConfiguratorStore(state => state.configuration);
  const allMaterials = useConfiguratorStore(state => state.allMaterials);
  const allOptions = useConfiguratorStore(state => state.allOptions);
  const platform = useConfiguratorStore(state => state.platform);
  const pricing = useConfiguratorStore(state => state.pricing);
  const [activePanel, setActivePanel] = useState<'build' | 'colors' | 'summary'>('build');
  const [isSaving, setIsSaving] = useState(false);

  const handleRequestQuote = async () => {
    if (!configuration) return;

    setIsSaving(true);
    try {
      await saveConfiguration(configuration);
      navigate('/quote');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!configuration) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <img 
            src="/assets/GG_circle_grill_full_color-01.png" 
            alt="GG Logo" 
            style={styles.loadingLogoImage} 
          />
          <h2 style={styles.loadingTitle}>LOADING YOUR BUILD</h2>
          <div style={styles.loadingBar}>
            <div style={styles.loadingProgress} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoContainer}>
            <img 
              src="/assets/GG_circle_grill_full_color-01.png" 
              alt="GG Logo" 
              style={styles.logoImage} 
            />
            <div>
              <h1 style={styles.logoText}>BUILD YOUR RIDE</h1>
              <span style={styles.logoSubtext}>Custom Cart Configurator</span>
            </div>
          </div>
        </div>
        
        <div style={styles.headerCenter}>
          {/* Navigation tabs */}
          <nav style={styles.nav}>
            {[
              { id: 'build', label: 'BUILD', icon: '🔧' },
              { id: 'colors', label: 'COLORS', icon: '🎨' },
              { id: 'summary', label: 'SUMMARY', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id as typeof activePanel)}
                style={{
                  ...styles.navButton,
                  ...(activePanel === tab.id ? styles.navButtonActive : {}),
                }}
              >
                <span style={styles.navIcon}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.priceTag}>
            <span style={styles.priceLabel}>YOUR BUILD</span>
            <span style={styles.priceValue}>
              ${pricing?.grandTotal?.toLocaleString() || '---'}
            </span>
          </div>
          <button
            onClick={handleRequestQuote}
            disabled={isSaving}
            style={{
              ...styles.ctaButton,
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'SAVING...' : 'GET A QUOTE →'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div style={styles.main}>
        {/* Left panel - Configuration options */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarContent}>
            <PlatformSelector />
            
            {activePanel === 'build' && <OptionSelector />}
            {activePanel === 'colors' && <MaterialSelector />}
            {activePanel === 'summary' && <PricingSummary />}
          </div>
        </aside>

        {/* Center - 3D Viewport */}
        <main style={styles.viewport}>
          <div style={styles.viewportInner}>
            <CartScene 
              configuration={configuration}
              allMaterials={allMaterials}
              allOptions={allOptions}
              platform={platform}
            />
          </div>
          
          {/* Viewport controls overlay */}
          <div style={styles.viewportControls}>
            <div style={styles.viewportHint}>
              <span>🖱️</span>
              <span>Drag to rotate • Scroll to zoom</span>
            </div>
          </div>
          
          {/* Platform name badge */}
          {platform && (
            <div style={styles.platformBadge}>
              <span style={styles.platformBadgeLabel}>PLATFORM</span>
              <span style={styles.platformBadgeName}>{platform.name}</span>
            </div>
          )}
        </main>
      </div>

      {/* Footer stats bar */}
      <footer style={styles.footer}>
        <div style={styles.footerStat}>
          <span style={styles.footerStatLabel}>OPTIONS</span>
          <span style={styles.footerStatValue}>{configuration.selectedOptions.length}</span>
        </div>
        <div style={styles.footerDivider} />
        <div style={styles.footerStat}>
          <span style={styles.footerStatLabel}>MATERIALS</span>
          <span style={styles.footerStatValue}>{configuration.materialSelections.length}</span>
        </div>
        <div style={styles.footerDivider} />
        <div style={styles.footerStat}>
          <span style={styles.footerStatLabel}>BASE PRICE</span>
          <span style={styles.footerStatValue}>${pricing?.basePlatformPrice?.toLocaleString() || '---'}</span>
        </div>
        <div style={styles.footerDivider} />
        <div style={styles.footerStat}>
          <span style={styles.footerStatLabel}>OPTIONS TOTAL</span>
          <span style={styles.footerStatValue}>${(pricing?.subtotal ? pricing.subtotal - pricing.basePlatformPrice : 0).toLocaleString() || '---'}</span>
        </div>
      </footer>

      {/* Google Font import for display font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes loadingPulse {
          0%, 100% { width: 0%; }
          50% { width: 100%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: colors.canvasBg,
    fontFamily: typography.fontFamily.body,
    color: colors.offWhite,
    overflow: 'hidden',
  },
  
  // Loading state
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: colors.canvasBg,
  },
  loadingContent: {
    textAlign: 'center',
  },
  loadingLogoImage: {
    width: '64px',
    height: '64px',
    objectFit: 'contain',
    marginBottom: spacing.lg,
    animation: 'spin 2s linear infinite',
  },
  loadingTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h1,
    color: colors.broncoOrange,
    letterSpacing: '3px',
    margin: 0,
    marginBottom: spacing.lg,
  },
  loadingBar: {
    width: '200px',
    height: '4px',
    background: colors.warmGray,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    background: `linear-gradient(90deg, ${colors.broncoOrange}, ${colors.desertSunset})`,
    animation: 'loadingPulse 1.5s ease-in-out infinite',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md} ${spacing.xl}`,
    background: colors.panelBg,
    borderBottom: `1px solid ${colors.warmGray}30`,
    zIndex: 100,
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    display: 'flex',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  
  // Logo
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoImage: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  logoText: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h2,
    color: colors.broncoOrange,
    letterSpacing: '2px',
    margin: 0,
    lineHeight: 1,
  },
  logoSubtext: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    letterSpacing: '1px',
  },

  // Navigation
  nav: {
    display: 'flex',
    gap: spacing.sm,
    background: colors.cardBg,
    padding: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.lg}`,
    background: 'transparent',
    border: 'none',
    borderRadius: borderRadius.md,
    color: colors.broncoSand,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    background: `linear-gradient(180deg, ${colors.broncoOrange} 0%, ${colors.broncoRust} 100%)`,
    color: colors.offWhite,
    boxShadow: shadows.glow,
  },
  navIcon: {
    fontSize: '16px',
  },

  // Price tag
  priceTag: {
    textAlign: 'right',
  },
  priceLabel: {
    display: 'block',
    fontSize: typography.sizes.tiny,
    color: colors.broncoSand,
    letterSpacing: '1px',
    marginBottom: '2px',
  },
  priceValue: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h2,
    color: colors.offWhite,
    letterSpacing: '1px',
  },

  // CTA Button
  ctaButton: {
    padding: `${spacing.md} ${spacing.xl}`,
    background: `linear-gradient(180deg, ${colors.broncoOrange} 0%, ${colors.broncoRust} 100%)`,
    color: colors.offWhite,
    border: 'none',
    borderRadius: borderRadius.md,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    letterSpacing: '2px',
    boxShadow: shadows.md,
    transition: 'all 0.2s ease',
  },

  // Main content
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  // Sidebar
  sidebar: {
    width: '380px',
    background: colors.panelBg,
    borderRight: `1px solid ${colors.warmGray}20`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },

  // Viewport
  viewport: {
    flex: 1,
    position: 'relative',
    background: `radial-gradient(ellipse at center, ${colors.charcoal} 0%, ${colors.canvasBg} 100%)`,
  },
  viewportInner: {
    position: 'absolute',
    inset: 0,
  },
  viewportControls: {
    position: 'absolute',
    bottom: spacing.lg,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  viewportHint: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    background: `${colors.panelBg}CC`,
    borderRadius: borderRadius.pill,
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    backdropFilter: 'blur(8px)',
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

  // Footer
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: `${spacing.sm} ${spacing.xl}`,
    background: colors.panelBg,
    borderTop: `1px solid ${colors.warmGray}20`,
  },
  footerStat: {
    textAlign: 'center',
  },
  footerStatLabel: {
    display: 'block',
    fontSize: typography.sizes.tiny,
    color: colors.broncoSand,
    letterSpacing: '1px',
    marginBottom: '2px',
  },
  footerStatValue: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h3,
    color: colors.offWhite,
    letterSpacing: '1px',
  },
  footerDivider: {
    width: '1px',
    height: '30px',
    background: colors.warmGray,
    opacity: 0.3,
  },
};
