/**
 * Pricing summary panel - Retro Bronco Edition.
 * 
 * A detailed build sheet with rugged, premium styling.
 */

import { useConfiguratorStore } from '../store/configurator';
import { formatPrice } from '@cart-configurator/pricing';
import { colors, typography, spacing } from '../styles/broncoTheme';

export function PricingSummary() {
  const pricing = useConfiguratorStore(state => state.pricing);

  if (!pricing) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>BUILD SHEET</h2>
        </div>
        <div style={styles.loading}>
          <span style={styles.loadingIcon}>📋</span>
          <p style={styles.loadingText}>Calculating your build...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>BUILD SHEET</h2>
        <p style={styles.subtitle}>Complete pricing breakdown</p>
      </div>

      <div style={styles.content}>
        {/* Base Platform */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🏎️</span>
            <span style={styles.sectionTitle}>BASE PLATFORM</span>
          </div>
          <div style={styles.lineItem}>
            <span style={styles.lineItemName}>Platform Base Price</span>
            <span style={styles.lineItemPrice}>{formatPrice(pricing.basePlatformPrice)}</span>
          </div>
        </div>

        {/* Options */}
        {pricing.optionLineItems.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>🔧</span>
              <span style={styles.sectionTitle}>OPTIONS ({pricing.optionLineItems.length})</span>
            </div>
            {pricing.optionLineItems.map(item => (
              <div key={item.optionId} style={styles.lineItem}>
                <div style={styles.lineItemDetails}>
                  <span style={styles.lineItemName}>{item.optionName}</span>
                  <span style={styles.lineItemBreakdown}>
                    Parts: {formatPrice(item.partsCost)} • Labor: {formatPrice(item.laborCost)}
                  </span>
                </div>
                <span style={styles.lineItemPrice}>{formatPrice(item.totalCost)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Materials */}
        {pricing.materialLineItems.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>🎨</span>
              <span style={styles.sectionTitle}>MATERIALS</span>
            </div>
            {pricing.materialLineItems.map(item => (
              <div key={`${item.zone}-${item.materialId}`} style={styles.lineItem}>
                <div style={styles.lineItemDetails}>
                  <span style={styles.lineItemName}>{item.materialName}</span>
                  <span style={styles.lineItemBreakdown}>{item.zone}</span>
                </div>
                <span style={styles.lineItemPrice}>{formatPrice(item.cost)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div style={styles.totals}>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Subtotal</span>
          <span style={styles.totalValue}>{formatPrice(pricing.subtotal)}</span>
        </div>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Labor Total</span>
          <span style={styles.totalValue}>{formatPrice(pricing.laborTotal)}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.grandTotal}>
          <div>
            <span style={styles.grandTotalLabel}>YOUR BUILD</span>
            <span style={styles.grandTotalHint}>Final price before tax</span>
          </div>
          <span style={styles.grandTotalValue}>{formatPrice(pricing.grandTotal)}</span>
        </div>
      </div>

      {/* Action hint */}
      <div style={styles.actionHint}>
        <span style={styles.actionIcon}>💬</span>
        <span style={styles.actionText}>Ready to build? Request a quote and our team will reach out within 24 hours.</span>
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

  loading: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingIcon: {
    fontSize: '48px',
    opacity: 0.5,
  },
  loadingText: {
    color: colors.broncoSand,
    margin: 0,
  },

  content: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.md,
  },

  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottom: `1px solid ${colors.warmGray}20`,
  },
  sectionIcon: {
    fontSize: '16px',
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    letterSpacing: '1px',
  },

  lineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: `${spacing.sm} 0`,
    borderBottom: `1px solid ${colors.warmGray}10`,
  },
  lineItemDetails: {
    flex: 1,
    marginRight: spacing.md,
  },
  lineItemName: {
    display: 'block',
    fontSize: typography.sizes.body,
    color: colors.offWhite,
    marginBottom: '2px',
  },
  lineItemBreakdown: {
    display: 'block',
    fontSize: typography.sizes.tiny,
    color: colors.broncoSand,
  },
  lineItemPrice: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    color: colors.offWhite,
    letterSpacing: '0.5px',
  },

  totals: {
    padding: spacing.lg,
    background: colors.cardBg,
    borderTop: `1px solid ${colors.warmGray}20`,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
  },
  totalValue: {
    fontSize: typography.sizes.body,
    color: colors.offWhite,
  },
  divider: {
    height: '1px',
    background: colors.warmGray,
    opacity: 0.3,
    margin: `${spacing.md} 0`,
  },
  grandTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    display: 'block',
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.body,
    color: colors.broncoOrange,
    letterSpacing: '1px',
  },
  grandTotalHint: {
    display: 'block',
    fontSize: typography.sizes.tiny,
    color: colors.broncoSand,
    marginTop: '2px',
  },
  grandTotalValue: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.sizes.h1,
    color: colors.offWhite,
    letterSpacing: '1px',
  },

  actionHint: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.lg,
    background: `${colors.broncoOrange}15`,
    borderTop: `1px solid ${colors.broncoOrange}30`,
  },
  actionIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  actionText: {
    fontSize: typography.sizes.small,
    color: colors.broncoSand,
    lineHeight: 1.4,
  },
};
