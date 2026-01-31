/**
 * Admin login page.
 * 
 * Simple email/password form with validation.
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, checkAuth, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const styles = useThemedStyles(createStyles);
  
  // Check auth on mount - if already authenticated, redirect
  useEffect(() => {
    checkAuth().then(() => {
      if (useAuthStore.getState().isAuthenticated) {
        navigate('/admin');
      }
    });
  }, []);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      // Error is already in store
      setIsSubmitting(false);
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Golf Cart Admin</h1>
        <p style={styles.subtitle}>Sign in to manage configurator</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
          
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.button,
              ...(isSubmitting ? styles.buttonDisabled : {}),
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={styles.footer}>
          <a href="/" style={styles.link}>← Back to Configurator</a>
        </div>
      </div>
    </div>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: theme.background,
    padding: '20px',
    transition: 'background-color 0.2s ease',
  },
  card: {
    backgroundColor: theme.backgroundElevated,
    padding: '40px',
    borderRadius: '8px',
    boxShadow: theme.backgroundElevated === '#ffffff' 
      ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
      : '0 2px 8px rgba(0, 0, 0, 0.5)',
    width: '100%',
    maxWidth: '400px',
    transition: 'all 0.2s ease',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '600',
    color: theme.text,
    transition: 'color 0.2s ease',
  },
  subtitle: {
    margin: '0 0 32px 0',
    fontSize: '14px',
    color: theme.textSecondary,
    transition: 'color 0.2s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.text,
    transition: 'color 0.2s ease',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: theme.surface,
    color: theme.text,
  },
  button: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: theme.primary,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  buttonDisabled: {
    backgroundColor: theme.secondary,
    cursor: 'not-allowed',
  },
  error: {
    padding: '12px',
    backgroundColor: theme.backgroundElevated === '#ffffff' ? '#fee2e2' : '#7f1d1d',
    border: `1px solid ${theme.error}`,
    borderRadius: '4px',
    color: theme.error,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  link: {
    fontSize: '14px',
    color: theme.primary,
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
});
