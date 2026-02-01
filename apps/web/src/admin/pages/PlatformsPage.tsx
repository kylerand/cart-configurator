/**
 * Platform management page.
 * 
 * List, create, edit, and delete platforms.
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../components/AdminLayout';
import { CsvImporter } from '../components/CsvImporter';
import { FileUpload } from '../components/FileUpload';
import { GLBPreview } from '../components/GLBPreview';
import { OffsetEditor, SubassemblyOffsets } from '../components/OffsetEditor';
import { adminApi } from '../api/client';
import { exportPlatformsCSV } from '../utils/csvExport';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

interface Platform {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  defaultAssetPath: string;
  subassemblyOffsets?: SubassemblyOffsets;
  isActive: boolean;
}

export const PlatformsPage: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    basePrice: '',
    defaultAssetPath: '',
    subassemblyOffsets: {} as SubassemblyOffsets,
  });
  
  useEffect(() => {
    loadPlatforms();
  }, []);
  
  const loadPlatforms = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getPlatforms();
      setPlatforms(response.platforms);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load platforms');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreate = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      basePrice: '',
      defaultAssetPath: '',
      subassemblyOffsets: {},
    });
    setEditingId(null);
    setShowForm(true);
  };
  
  const handleEdit = (platform: Platform) => {
    setFormData({
      id: platform.id,
      name: platform.name,
      description: platform.description,
      basePrice: platform.basePrice.toString(),
      defaultAssetPath: platform.defaultAssetPath || '',
      subassemblyOffsets: platform.subassemblyOffsets || {},
    });
    setEditingId(platform.id);
    setShowForm(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
      };
      
      if (editingId) {
        await adminApi.updatePlatform(editingId, data);
        toast.success('Platform updated successfully');
      } else {
        await adminApi.createPlatform(data);
        toast.success('Platform created successfully');
      }
      
      setShowForm(false);
      loadPlatforms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save platform');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this platform?')) return;
    
    try {
      await adminApi.deletePlatform(id);
      toast.success('Platform deleted successfully');
      loadPlatforms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete platform');
    }
  };

  const handleImport = async (data: unknown[]) => {
    const platforms = data as Array<{ name: string; description: string; basePrice: string; defaultAssetPath: string }>;
    
    for (const platform of platforms) {
      await adminApi.createPlatform({
        name: platform.name,
        description: platform.description,
        basePrice: parseFloat(platform.basePrice),
        defaultAssetPath: platform.defaultAssetPath || '',
      });
    }
    
    loadPlatforms();
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading platforms...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Platforms</h1>
          <p style={styles.subtitle}>Manage golf cart platform configurations</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowImporter(true)}
            style={styles.importButton}
          >
            📤 Import CSV
          </button>
          <button
            onClick={() => exportPlatformsCSV(platforms)}
            style={styles.exportButton}
            disabled={platforms.length === 0}
          >
            📥 Export CSV
          </button>
          <button onClick={handleCreate} style={styles.createButton}>
            + Create Platform
          </button>
        </div>
      </div>
      
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingId ? 'Edit Platform' : 'Create Platform'}
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Platform ID</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  required
                  disabled={!!editingId}
                  style={styles.input}
                  placeholder="standard-4seat"
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
                  placeholder="Standard 4-Seater"
                />
              </div>
            </div>
            
            <div style={styles.formField}>
              <label style={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                style={{ ...styles.input, minHeight: '80px' }}
                placeholder="Classic 4-passenger golf cart platform"
              />
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Base Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="8500.00"
                />
              </div>
              
              <div style={styles.formField}>
                <FileUpload
                  category="models"
                  label="Platform 3D Model"
                  currentUrl={formData.defaultAssetPath}
                  onUploadComplete={(url) => setFormData({ ...formData, defaultAssetPath: url })}
                  onError={(error) => toast.error(error)}
                />
              </div>
            </div>
            
            {/* 3D Preview */}
            {formData.defaultAssetPath && (
              <div style={styles.formRow}>
                <div style={{ ...styles.formField, flex: 1 }}>
                  <label style={styles.label}>3D Model Preview</label>
                  <GLBPreview 
                    url={formData.defaultAssetPath} 
                    height={300}
                  />
                </div>
              </div>
            )}
            
            {/* Subassembly Offsets */}
            <div style={styles.formRow}>
              <div style={{ ...styles.formField, flex: 1 }}>
                <OffsetEditor
                  offsets={formData.subassemblyOffsets}
                  onChange={(offsets) => setFormData({ ...formData, subassemblyOffsets: offsets })}
                />
              </div>
            </div>
            
            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.submitButton}>
                {editingId ? 'Update' : 'Create'} Platform
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div style={styles.list}>
        {platforms.length === 0 ? (
          <div style={styles.empty}>
            No platforms yet. Create one to get started.
          </div>
        ) : (
          platforms.map((platform) => (
            <div key={platform.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>{platform.name}</h3>
                  <p style={styles.cardId}>ID: {platform.id}</p>
                </div>
                <div style={styles.cardPrice}>${platform.basePrice.toFixed(2)}</div>
              </div>
              <p style={styles.cardDescription}>{platform.description}</p>
              {platform.defaultAssetPath && (
                <p style={styles.cardAsset}>Asset: {platform.defaultAssetPath}</p>
              )}
              <div style={styles.cardActions}>
                <button onClick={() => handleEdit(platform)} style={styles.editButton}>
                  Edit
                </button>
                <button onClick={() => handleDelete(platform.id)} style={styles.deleteButton}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showImporter && (
        <CsvImporter
          entityType="platforms"
          templateHeaders={['name', 'description', 'basePrice', 'defaultAssetPath']}
          onImport={handleImport}
          onClose={() => setShowImporter(false)}
        />
      )}
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
  importButton: {
    padding: '10px 20px',
    backgroundColor: theme.info,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  exportButton: {
    padding: '10px 20px',
    backgroundColor: theme.success,
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
    alignItems: 'flex-start',
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
    margin: 0,
    fontSize: '12px',
    color: theme.textTertiary,
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
  },
  cardPrice: {
    fontSize: '20px',
    fontWeight: '600',
    color: theme.primary,
    transition: 'all 0.2s ease',
  },
  cardDescription: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: theme.textSecondary,
    lineHeight: '1.5',
    transition: 'all 0.2s ease',
  },
  cardAsset: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    color: theme.textTertiary,
    fontFamily: 'monospace',
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
