/**
 * Admin dashboard landing page.
 * 
 * Shows overview and quick stats.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

export const AdminDashboard: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const cards = [
    {
      title: 'Platforms',
      description: 'Manage golf cart platform configurations',
      link: '/admin/platforms',
      icon: '🛠️',
      color: '#3b82f6',
    },
    {
      title: 'Options',
      description: 'Configure available customization options',
      link: '/admin/options',
      icon: '⚙️',
      color: '#8b5cf6',
    },
    {
      title: 'Materials',
      description: 'Manage material finishes and colors',
      link: '/admin/materials',
      icon: '🎨',
      color: '#ec4899',
    },
  ];
  
  return (
    <AdminLayout>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Manage your golf cart configurator</p>
      </div>
      
      <div style={styles.grid}>
        {cards.map((card) => (
          <Link
            key={card.link}
            to={card.link}
            style={{
              ...styles.card,
              borderLeftColor: card.color,
            }}
          >
            <div style={styles.cardIcon}>{card.icon}</div>
            <h2 style={styles.cardTitle}>{card.title}</h2>
            <p style={styles.cardDescription}>{card.description}</p>
            <div style={{ ...styles.cardArrow, color: card.color }}>→</div>
          </Link>
        ))}
      </div>
      
      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>Getting Started</h3>
        <ul style={styles.infoList}>
          <li>Create or edit <strong>Platforms</strong> to define base cart configurations</li>
          <li>Add <strong>Options</strong> for each platform with pricing and labor hours</li>
          <li>Define <strong>Materials</strong> with colors and finish types</li>
          <li>Set up option rules to enforce compatibility constraints</li>
        </ul>
      </div>
    </AdminLayout>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  header: {
    marginBottom: '32px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: '600',
    color: theme.text,
    transition: 'color 0.2s ease',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: theme.textSecondary,
    transition: 'color 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    borderLeft: '4px solid',
    boxShadow: theme.backgroundElevated === '#ffffff' 
      ? '0 1px 3px rgba(0, 0, 0, 0.1)' 
      : '0 1px 3px rgba(0, 0, 0, 0.5)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  cardIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: theme.text,
    transition: 'color 0.2s ease',
  },
  cardDescription: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: theme.textSecondary,
    lineHeight: '1.5',
    transition: 'color 0.2s ease',
  },
  cardArrow: {
    fontSize: '24px',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  infoBox: {
    padding: '24px',
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    transition: 'all 0.2s ease',
  },
  infoTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: theme.text,
    transition: 'color 0.2s ease',
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    lineHeight: '1.8',
    color: theme.textSecondary,
    fontSize: '14px',
    transition: 'color 0.2s ease',
  },
});
