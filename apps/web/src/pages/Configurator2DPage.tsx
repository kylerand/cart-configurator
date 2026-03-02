/**
 * 2D Configurator Page — Image compositing edition.
 * 
 * A separate configurator experience using layered 2D images instead of Three.js.
 * Shares the same Zustand store, types, pricing, and rules as the 3D configurator.
 * Inspired by the Velocity Restorations configurator architecture.
 */

import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ImageCompositor, ViewAngle } from '../components/ImageCompositor';
import { AccordionOptionPanel } from '../components/AccordionOptionPanel';
import { PackageSelector } from '../components/PackageSelector';
import { MaterialSelector } from '../components/MaterialSelectorBronco';
import { PricingSummary } from '../components/PricingSummaryBronco';
import { PlatformSelector } from '../components/PlatformSelectorBronco';
import { AnimatedPrice } from '../components/AnimatedPrice';
import { useConfiguratorStore } from '../store/configurator';
import { saveConfiguration } from '../api/client';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/broncoTheme';

type PanelMode = 'build' | 'colors' | 'summary';

export function Configurator2DPage() {
  const navigate = useNavigate();
  const configuration = useConfiguratorStore(state => state.configuration);
  const pricing = useConfiguratorStore(state => state.pricing);
  const [activePanel, setActivePanel] = useState<PanelMode>('build');
  const [activeView, setActiveView] = useState<ViewAngle>('front');
  const [isSaving, setIsSaving] = useState(false);

  const handleViewChange = useCallback((view: ViewAngle) => {
    setActiveView(view);
  }, []);

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
              <span style={styles.logoSubtext}>2D Configurator</span>
            </div>
          </div>
        </div>

        <div style={styles.headerCenter}>
          {/* Navigation tabs */}
          <nav style={styles.nav}>
            {[
              { id: 'build' as PanelMode, label: 'BUILD', icon: '🔧' },
              { id: 'colors' as PanelMode, label: 'COLORS', icon: '🎨' },
              { id: 'summary' as PanelMode, label: 'SUMMARY', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
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

          {/* 3D/2D toggle */}
          <div style={styles.viewToggle}>
            <Link to="/" style={styles.viewToggleLink}>3D</Link>
            <span style={styles.viewToggleActive}>2D</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.priceTag}>
            <span style={styles.priceLabel}>YOUR BUILD</span>
            <AnimatedPrice value={pricing?.grandTotal || 0} />
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
        {/* Left panel - Options */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarContent}>
            <PlatformSelector />

            {activePanel === 'build' && (
              <>
                <PackageSelector />
                <AccordionOptionPanel onViewChange={handleViewChange} />
              </>
            )}
            {activePanel === 'colors' && <MaterialSelector />}
            {activePanel === 'summary' && <PricingSummary />}
          </div>
        </aside>

        {/* Center - 2D Image Compositor Viewport */}
        <main style={styles.viewport}>
          <ImageCompositor
            activeView={activeView}
            onViewChange={handleViewChange}
          />
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

      {/* Google Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes loadingPulse {
          0%, 100% { width: 0%; }
          50% { width: 100%; }
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
    alignItems: 'center',
    gap: spacing.lg,
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

  // 3D/2D toggle
  viewToggle: {
    display: 'flex',
    gap: '2px',
    background: colors.cardBg,
    padding: '2px',
    borderRadius: borderRadius.md,
  },
  viewToggleLink: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    color: colors.broncoSand,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.small,
    letterSpacing: '1px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  viewToggleActive: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    background: colors.broncoOrange,
    color: colors.offWhite,
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.small,
    letterSpacing: '1px',
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
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },

  // Viewport
  viewport: {
    flex: 1,
    position: 'relative',
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
