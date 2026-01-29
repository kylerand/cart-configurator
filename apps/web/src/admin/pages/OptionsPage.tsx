/**
 * Options management page.
 * 
 * List, create, edit, and delete configuration options.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AdminLayout } from '../components/AdminLayout';
import { adminApi } from '../api/client';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

interface Option {
  id: string;
  platformId: string;
  category: string;
  name: string;
  description: string;
  partPrice: number;
  laborHours: number;
  assetPath: string;
  isActive: boolean;
  platform?: { name: string };
}

export const OptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const styles = useThemedStyles(createStyles);
  const [options, setOptions] = useState<Option[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    platformId: '',
    category: '',
    name: '',
    description: '',
    partPrice: '',
    laborHours: '',
    assetPath: '',
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [optionsRes, platformsRes] = await Promise.all([
        adminApi.getOptions(),
        adminApi.getPlatforms(),
      ]);
      setOptions(optionsRes.options);
      setPlatforms(platformsRes.platforms);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreate = () => {
    setFormData({
      id: '',
      platformId: platforms[0]?.id || '',
      category: 'ROOF',
      name: '',
      description: '',
      partPrice: '',
      laborHours: '',
      assetPath: '',
    });
    setEditingId(null);
    setShowForm(true);
  };
  
  const handleEdit = (option: Option) => {
    setFormData({
      id: option.id,
      platformId: option.platformId,
      category: option.category,
      name: option.name,
      description: option.description,
      partPrice: option.partPrice.toString(),
      laborHours: option.laborHours.toString(),
      assetPath: option.assetPath || '',
    });
    setEditingId(option.id);
    setShowForm(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        partPrice: parseFloat(formData.partPrice),
        laborHours: parseFloat(formData.laborHours),
      };
      
      if (editingId) {
        await adminApi.updateOption(editingId, data);
        toast.success('Option updated successfully');
      } else {
        await adminApi.createOption(data);
        toast.success('Option created successfully');
      }
      
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save option');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this option?')) return;
    
    try {
      await adminApi.deleteOption(id);
      toast.success('Option deleted successfully');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete option');
    }
  };
  
  const categories = ['ROOF', 'SEATS', 'WHEELS', 'BODY', 'LIGHTING', 'AUDIO', 'STORAGE'];
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading options...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Options</h1>
          <p style={styles.subtitle}>Manage configuration options and rules</p>
        </div>
        <button onClick={handleCreate} style={styles.createButton} disabled={platforms.length === 0}>
          + Create Option
        </button>
      </div>
      
      {platforms.length === 0 && (
        <div style={styles.warning}>
          ⚠️ Create a platform first before adding options.
        </div>
      )}
      
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingId ? 'Edit Option' : 'Create Option'}
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Option ID</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  required
                  disabled={!!editingId}
                  style={styles.input}
                  placeholder="roof-extended"
                />
              </div>
              
              <div style={styles.formField}>
                <label style={styles.label}>Platform</label>
                <select
                  value={formData.platformId}
                  onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                  required
                  disabled={!!editingId}
                  style={styles.input}
                >
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="Extended Roof"
                />
              </div>
              
              <div style={styles.formField}>
                <label style={styles.label}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  style={styles.input}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={styles.formField}>
              <label style={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                style={{ ...styles.input, minHeight: '60px' }}
                placeholder="Full coverage extended roof"
              />
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Part Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.partPrice}
                  onChange={(e) => setFormData({ ...formData, partPrice: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="450.00"
                />
              </div>
              
              <div style={styles.formField}>
                <label style={styles.label}>Labor Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.laborHours}
                  onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="2.5"
                />
              </div>
            </div>
            
            <div style={styles.formField}>
              <label style={styles.label}>Asset Path (optional)</label>
              <input
                type="text"
                value={formData.assetPath}
                onChange={(e) => setFormData({ ...formData, assetPath: e.target.value })}
                style={styles.input}
                placeholder="/assets/options/roof-extended.glb"
              />
            </div>
            
            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>
                {editingId ? 'Update' : 'Create'} Option
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div style={styles.list}>
        {options.length === 0 ? (
          <div style={styles.empty}>
            No options yet. Create one to get started.
          </div>
        ) : (
          options.map((option) => (
            <div key={option.id} style={styles.card}>
              <div style={styles.cardBadge}>{option.category}</div>
              <h3 style={styles.cardTitle}>{option.name}</h3>
              <p style={styles.cardId}>ID: {option.id}</p>
              <p style={styles.cardDescription}>{option.description}</p>
              <div style={styles.cardMeta}>
                <span>💰 ${option.partPrice.toFixed(2)}</span>
                <span>⏱️ {option.laborHours}h</span>
              </div>
              {option.platform && (
                <p style={styles.cardPlatform}>Platform: {option.platform.name}</p>
              )}
              <div style={styles.cardActions}>
                <button onClick={() => navigate(`/admin/options/${option.id}`)} style={styles.viewButton}>
                  View Rules
                </button>
                <button onClick={() => handleEdit(option)} style={styles.editButton}>
                  Edit
                </button>
                <button onClick={() => handleDelete(option.id)} style={styles.deleteButton}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
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
  warning: {
    padding: '12px 16px',
    marginBottom: '20px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fed7aa',
    borderRadius: '4px',
    color: '#92400e',
    fontSize: '14px',
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
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  empty: {
    padding: '60px 20px',
    textAlign: 'center',
    color: theme.textTertiary,
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    gridColumn: '1 / -1',
    transition: 'all 0.2s ease',
  },
  card: {
    padding: '20px',
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  cardBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#ede9fe',
    color: '#6b21a8',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  cardTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  cardId: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    color: theme.textTertiary,
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
  },
  cardDescription: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: theme.textSecondary,
    lineHeight: '1.5',
    transition: 'all 0.2s ease',
  },
  cardMeta: {
    display: 'flex',
    gap: '16px',
    marginBottom: '8px',
    fontSize: '13px',
    color: theme.textSecondary,
    transition: 'all 0.2s ease',
  },
  cardPlatform: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    color: theme.textTertiary,
    transition: 'all 0.2s ease',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  viewButton: {
    padding: '8px 16px',
    backgroundColor: '#ede9fe',
    color: '#6b21a8',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: theme.backgroundHover,
    color: theme.text,
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#fee',
    color: '#c33',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
});
