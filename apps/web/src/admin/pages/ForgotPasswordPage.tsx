/**
 * Forgot password page.
 * 
 * Allows users to request a password reset email.
 */

import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../lib/supabase';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const styles = useThemedStyles(createStyles);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Check Your Email</h1>
          <p style={styles.text}>
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
          <p style={styles.textSecondary}>
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>
          <div style={styles.footer}>
            <Link to="/admin/login" style={styles.link}>← Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot Password</h1>
        <p style={styles.subtitle}>Enter your email to receive a reset link</p>

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
              placeholder="admin@example.com"
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
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/admin/login" style={styles.link}>← Back to Login</Link>
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
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: theme.text,
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: theme.textSecondary,
    marginBottom: '24px',
    textAlign: 'center',
  },
  text: {
    color: theme.text,
    textAlign: 'center',
    marginBottom: '12px',
  },
  textSecondary: {
    color: theme.textSecondary,
    textAlign: 'center',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: theme.text,
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    fontSize: '14px',
    backgroundColor: theme.background,
    color: theme.text,
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: theme.primary,
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '14px',
    textAlign: 'center',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  link: {
    color: theme.primary,
    textDecoration: 'none',
    fontSize: '14px',
  },
});

export default ForgotPasswordPage;
