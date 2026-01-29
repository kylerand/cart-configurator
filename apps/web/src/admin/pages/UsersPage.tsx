/**
 * User management page.
 * 
 * Manage admin users (Super Admin only).
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../components/AdminLayout';
import { adminApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const UsersPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const styles = useThemedStyles(createStyles);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'VIEWER',
  });
  
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response.users);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreate = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'VIEWER',
    });
    setEditingId(null);
    setShowForm(true);
  };
  
  const handleEdit = (user: User) => {
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
    });
    setEditingId(user.id);
    setShowForm(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await adminApi.updateUser(editingId, {
          name: formData.name,
          role: formData.role,
        });
        toast.success('User updated successfully');
      } else {
        await adminApi.createUser(formData);
        toast.success('User created successfully');
      }
      
      setShowForm(false);
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save user');
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      await adminApi.changeUserPassword(showPasswordForm!, passwordData.password);
      setShowPasswordForm(null);
      setPasswordData({ password: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    }
  };
  
  const handleToggleActive = async (user: User) => {
    if (!window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }
    
    try {
      await adminApi.updateUser(user.id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    }
  };
  
  const roles = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', color: '#dc2626' },
    { value: 'ADMIN', label: 'Admin', color: '#ea580c' },
    { value: 'SALES', label: 'Sales', color: '#2563eb' },
    { value: 'ENGINEERING', label: 'Engineering', color: '#7c3aed' },
    { value: 'PRODUCTION', label: 'Production', color: '#059669' },
    { value: 'VIEWER', label: 'Viewer', color: '#6b7280' },
  ];
  
  // Only Super Admins can access this page
  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout>
        <div style={styles.accessDenied}>
          <h1>Access Denied</h1>
          <p>Only Super Admins can manage users.</p>
        </div>
      </AdminLayout>
    );
  }
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading users...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Users</h1>
          <p style={styles.subtitle}>Manage admin users and permissions</p>
        </div>
        <button onClick={handleCreate} style={styles.createButton}>
          + Create User
        </button>
      </div>
      
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingId ? 'Edit User' : 'Create User'}
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingId}
                  style={styles.input}
                  placeholder="admin@example.com"
                />
              </div>
              
              <div style={styles.formField}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            {!editingId && (
              <div style={styles.formField}>
                <label style={styles.label}>Password (min 8 characters)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                  minLength={8}
                  style={styles.input}
                  placeholder="••••••••"
                />
              </div>
            )}
            
            <div style={styles.formField}>
              <label style={styles.label}>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                style={styles.input}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>
                {editingId ? 'Update' : 'Create'} User
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Password Change Form */}
      {showPasswordForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Change Password</h2>
          <form onSubmit={handlePasswordChange} style={styles.form}>
            <div style={styles.formField}>
              <label style={styles.label}>New Password (min 8 characters)</label>
              <input
                type="password"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                required
                minLength={8}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>
            
            <div style={styles.formField}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                minLength={8}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>
            
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(null);
                  setPasswordData({ password: '', confirmPassword: '' });
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>
                Change Password
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Users Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const roleInfo = roles.find((r) => r.value === user.role);
              return (
                <tr key={user.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.userName}>{user.name}</div>
                    {user.id === currentUser?.id && (
                      <span style={styles.youBadge}>You</span>
                    )}
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.roleBadge,
                        backgroundColor: roleInfo?.color + '20',
                        color: roleInfo?.color,
                      }}
                    >
                      {roleInfo?.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(user.isActive ? styles.statusActive : styles.statusInactive),
                      }}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(user)}
                        style={styles.actionButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowPasswordForm(user.id)}
                        style={styles.actionButton}
                      >
                        Password
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        style={{
                          ...styles.actionButton,
                          ...(user.isActive ? styles.deactivateButton : styles.activateButton),
                        }}
                        disabled={user.id === currentUser?.id}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '600',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: theme.textSecondary,
    transition: 'all 0.2s ease',
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: theme.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: theme.textSecondary,
    transition: 'all 0.2s ease',
  },
  accessDenied: {
    padding: '60px 20px',
    textAlign: 'center',
  },
  error: {
    padding: '12px 16px',
    marginBottom: '20px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c33',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#c33',
  },
  formCard: {
    padding: '24px',
    marginBottom: '24px',
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  },
  formTitle: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: theme.backgroundElevated,
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: theme.backgroundElevated,
    color: theme.textSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: theme.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tableCard: {
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'auto',
    transition: 'all 0.2s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: theme.background,
    borderBottom: `2px solid ${theme.border}`,
    transition: 'all 0.2s ease',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
  },
  tableRow: {
    borderBottom: `1px solid ${theme.borderLight}`,
    transition: 'all 0.2s ease',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  userName: {
    fontWeight: '500',
    marginBottom: '4px',
  },
  youBadge: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: '600',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    padding: '6px 12px',
    backgroundColor: theme.backgroundHover,
    color: theme.text,
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deactivateButton: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  activateButton: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
});
