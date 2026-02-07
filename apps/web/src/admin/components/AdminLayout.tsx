/**
 * Admin layout with sidebar navigation.
 * 
 * Provides consistent layout for all admin pages.
 */

import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { GlobalSearch } from './GlobalSearch';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, mode } = useThemeStore();
  
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/platforms', label: 'Platforms', icon: '🛠️' },
    { path: '/admin/options', label: 'Options', icon: '⚙️' },
    { path: '/admin/materials', label: 'Materials', icon: '🎨' },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📝' },
    { path: '/admin/users', label: 'Users', icon: '👥', adminOnly: true },
  ];
  
  return (
    <div style={{
      ...styles.container,
      backgroundColor: theme.background,
    }}>
      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        backgroundColor: theme.backgroundElevated,
        borderColor: theme.border,
      }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}>
            <img 
              src="/assets/GG_circle_grill_full_color-01.png" 
              alt="GG Logo" 
              style={styles.logoImage} 
            />
            <h1 style={{
              ...styles.logo,
              color: theme.text,
            }}>Golf Cart Admin</h1>
          </div>
          <p style={{
            ...styles.userInfo,
            color: theme.textSecondary,
          }}>{user?.name}</p>
          <p style={{
            ...styles.userRole,
            color: theme.textTertiary,
          }}>{user?.role}</p>
        </div>
        
        <nav style={styles.nav}>
          {navItems.map((item) => {
            // Hide admin-only items for non-super-admins
            if (item.adminOnly && user?.role !== 'SUPER_ADMIN') {
              return null;
            }
            
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  color: isActive ? theme.primary : theme.textSecondary,
                  backgroundColor: isActive ? theme.backgroundHover : 'transparent',
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div style={styles.sidebarFooter}>
          <button 
            onClick={toggleTheme} 
            style={{
              ...styles.themeToggle,
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
            }}
            title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          >
            {mode === 'light' ? '🌙' : '☀️'} {mode === 'light' ? 'Dark' : 'Light'}
          </button>
          <button onClick={handleLogout} style={{
            ...styles.logoutButton,
            backgroundColor: theme.danger,
            color: '#ffffff',
          }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main style={{
        ...styles.main,
        backgroundColor: theme.background,
      }}>
        <div style={styles.searchHeader}>
          <GlobalSearch />
        </div>
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    transition: 'background-color 0.2s ease',
  },
  sidebar: {
    width: '260px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
    borderRight: '1px solid',
    transition: 'all 0.2s ease',
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  logoImage: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
  },
  logo: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '600',
    transition: 'color 0.2s ease',
  },
  userInfo: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    transition: 'color 0.2s ease',
  },
  userRole: {
    margin: 0,
    fontSize: '12px',
    textTransform: 'uppercase',
    transition: 'color 0.2s ease',
  },
  nav: {
    flex: 1,
    padding: '16px 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  navIcon: {
    fontSize: '18px',
  },
  sidebarFooter: {
    padding: '12px 20px',
    borderTop: '1px solid rgba(128, 128, 128, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  themeToggle: {
    width: '100%',
    padding: '10px',
    border: '1px solid',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500',
  },
  logoutButton: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500',
  },
  main: {
    marginLeft: '260px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'background-color 0.2s ease',
  },
  searchHeader: {
    padding: '16px 32px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    padding: '32px',
  },
};
