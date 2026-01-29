/**
 * Materials management page.
 * 
 * List, create, edit, and delete materials with color picker.
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../components/AdminLayout';
import { adminApi } from '../api/client';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

interface Material {
  id: string;
  zone: string;
  type: string;
  name: string;
  description: string;
  color: string;
  finish: string;
  priceMultiplier: number;
  isActive: boolean;
}

export const MaterialsPage: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    zone: 'BODY',
    type: 'PAINT',
    name: '',
    description: '',
    color: '#FF0000',
    finish: 'GLOSS',
    priceMultiplier: '1.0',
  });
  
  useEffect(() => {
    loadMaterials();
  }, []);
  
  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getMaterials();
      setMaterials(response.materials);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreate = () => {
    setFormData({
      id: '',
      zone: 'BODY',
      type: 'PAINT',
      name: '',
      description: '',
      color: '#FF0000',
      finish: 'GLOSS',
      priceMultiplier: '1.0',
    });
    setEditingId(null);
    setShowForm(true);
  };
  
  const handleEdit = (material: Material) => {
    setFormData({
      id: material.id,
      zone: material.zone,
      type: material.type,
      name: material.name,
      description: material.description,
      color: material.color,
      finish: material.finish,
      priceMultiplier: material.priceMultiplier.toString(),
    });
    setEditingId(material.id);
    setShowForm(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        priceMultiplier: parseFloat(formData.priceMultiplier),
      };
      
      if (editingId) {
        await adminApi.updateMaterial(editingId, data);
        toast.success('Material updated successfully');
      } else {
        await adminApi.createMaterial(data);
        toast.success('Material created successfully');
      }
      
      setShowForm(false);
      loadMaterials();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save material');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await adminApi.deleteMaterial(id);
      toast.success('Material deleted successfully');
      loadMaterials();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete material');
    }
  };
  
  const zones = ['BODY', 'SEATS', 'ROOF', 'TRIM', 'GLASS'];
  const types = ['PAINT', 'POWDER_COAT', 'VINYL', 'FABRIC', 'PLASTIC', 'GLASS', 'METAL'];
  const finishes = ['GLOSS', 'SATIN', 'MATTE', 'METALLIC'];
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading materials...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Materials</h1>
          <p style={styles.subtitle}>Manage material finishes and colors</p>
        </div>
        <button onClick={handleCreate} style={styles.createButton}>
          + Create Material
        </button>
      </div>
      
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingId ? 'Edit Material' : 'Create Material'}
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Material ID</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  required
                  disabled={!!editingId}
                  style={styles.input}
                  placeholder="paint-red-gloss"
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
                  placeholder="Gloss Red Paint"
                />
              </div>
            </div>
            
            <div style={styles.formField}>
              <label style={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                style={{ ...styles.input, minHeight: '60px' }}
                placeholder="High-gloss automotive red finish"
              />
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Zone</label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  required
                  style={styles.input}
                >
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
              
              <div style={styles.formField}>
                <label style={styles.label}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={styles.input}
                >
                  {types.map((type) => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Color</label>
                <div style={styles.colorInputGroup}>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value.toUpperCase() })}
                    required
                    style={styles.colorPicker}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value.toUpperCase() })}
                    required
                    pattern="^#[0-9A-Fa-f]{6}$"
                    style={styles.colorInput}
                    placeholder="#FF0000"
                  />
                </div>
              </div>
              
              <div style={styles.formField}>
                <label style={styles.label}>Finish</label>
                <select
                  value={formData.finish}
                  onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                  required
                  style={styles.input}
                >
                  {finishes.map((finish) => (
                    <option key={finish} value={finish}>{finish}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={styles.formField}>
              <label style={styles.label}>Price Multiplier</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.priceMultiplier}
                onChange={(e) => setFormData({ ...formData, priceMultiplier: e.target.value })}
                required
                style={styles.input}
                placeholder="1.0"
              />
              <small style={styles.fieldHelp}>1.0 = base price, 1.5 = 50% premium</small>
            </div>
            
            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>
                {editingId ? 'Update' : 'Create'} Material
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div style={styles.list}>
        {materials.length === 0 ? (
          <div style={styles.empty}>
            No materials yet. Create one to get started.
          </div>
        ) : (
          materials.map((material) => (
            <div key={material.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{ ...styles.colorSwatch, backgroundColor: material.color }} />
                <div style={styles.cardBadges}>
                  <span style={styles.badge}>{material.zone}</span>
                  <span style={styles.badge}>{material.type.replace('_', ' ')}</span>
                </div>
              </div>
              <h3 style={styles.cardTitle}>{material.name}</h3>
              <p style={styles.cardId}>ID: {material.id}</p>
              <p style={styles.cardDescription}>{material.description}</p>
              <div style={styles.cardMeta}>
                <span>🎨 {material.color}</span>
                <span>✨ {material.finish}</span>
                <span>💰 {material.priceMultiplier}x</span>
              </div>
              <div style={styles.cardActions}>
                <button onClick={() => handleEdit(material)} style={styles.editButton}>
                  Edit
                </button>
                <button onClick={() => handleDelete(material.id)} style={styles.deleteButton}>
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
  colorInputGroup: {
    display: 'flex',
    gap: '8px',
  },
  colorPicker: {
    width: '60px',
    height: '42px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  colorInput: {
    flex: 1,
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'monospace',
    backgroundColor: theme.backgroundElevated,
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  fieldHelp: {
    fontSize: '12px',
    color: theme.textTertiary,
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
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  colorSwatch: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    border: `2px solid ${theme.border}`,
    transition: 'all 0.2s ease',
  },
  cardBadges: {
    display: 'flex',
    gap: '8px',
  },
  badge: {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#fce7f3',
    color: '#9f1239',
    borderRadius: '4px',
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
    gap: '12px',
    marginBottom: '12px',
    fontSize: '12px',
    color: theme.textSecondary,
    transition: 'all 0.2s ease',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
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
