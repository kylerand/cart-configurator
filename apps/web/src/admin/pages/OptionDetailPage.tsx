/**
 * Option detail page with rules management.
 * 
 * Shows option details and allows managing compatibility rules.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  platform: { name: string };
  requires: Array<{
    id: string;
    type: string;
    reason: string;
    related: { id: string; name: string; category: string };
  }>;
  requiredBy: Array<{
    id: string;
    type: string;
    reason: string;
    option: { id: string; name: string; category: string };
  }>;
}

export const OptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const styles = useThemedStyles(createStyles);
  const [option, setOption] = useState<Option | null>(null);
  const [availableOptions, setAvailableOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRuleForm, setShowRuleForm] = useState(false);
  
  const [ruleFormData, setRuleFormData] = useState({
    relatedId: '',
    type: 'REQUIRES',
    reason: '',
  });
  
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [optionRes, optionsRes] = await Promise.all([
        adminApi.getOption(id!),
        adminApi.getOptions({ platformId: undefined }),
      ]);
      
      setOption(optionRes.option);
      // Filter out current option and already related options
      const existingRelatedIds = new Set([
        id,
        ...optionRes.option.requires.map((r: any) => r.related.id),
      ]);
      setAvailableOptions(
        optionsRes.options.filter((opt: any) => !existingRelatedIds.has(opt.id))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load option');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await adminApi.createOptionRule(id!, ruleFormData);
      setShowRuleForm(false);
      setRuleFormData({ relatedId: '', type: 'REQUIRES', reason: '' });
      toast.success('Rule added successfully');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add rule');
    }
  };
  
  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      await adminApi.deleteOptionRule(id!, ruleId);
      toast.success('Rule deleted successfully');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete rule');
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading option...</div>
      </AdminLayout>
    );
  }
  
  if (!option) {
    return (
      <AdminLayout>
        <div style={styles.error}>Option not found</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div style={styles.header}>
        <button onClick={() => navigate('/admin/options')} style={styles.backButton}>
          ← Back to Options
        </button>
      </div>
      
      <div style={styles.content}>
        {/* Option Details Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <span style={styles.badge}>{option.category}</span>
              <h1 style={styles.title}>{option.name}</h1>
              <p style={styles.optionId}>ID: {option.id}</p>
            </div>
            <button onClick={() => navigate(`/admin/options`)} style={styles.editButton}>
              Edit Option
            </button>
          </div>
          
          <p style={styles.description}>{option.description}</p>
          
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Platform</span>
              <span style={styles.detailValue}>{option.platform.name}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Part Price</span>
              <span style={styles.detailValue}>${option.partPrice.toFixed(2)}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Labor Hours</span>
              <span style={styles.detailValue}>{option.laborHours}h</span>
            </div>
            {option.assetPath && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Asset Path</span>
                <span style={{ ...styles.detailValue, fontFamily: 'monospace', fontSize: '12px' }}>
                  {option.assetPath}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Rules Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>Compatibility Rules</h2>
            <button
              onClick={() => setShowRuleForm(!showRuleForm)}
              style={styles.addButton}
              disabled={availableOptions.length === 0}
            >
              + Add Rule
            </button>
          </div>
          
          {showRuleForm && (
            <form onSubmit={handleAddRule} style={styles.ruleForm}>
              <div style={styles.formRow}>
                <div style={styles.formField}>
                  <label style={styles.label}>Related Option</label>
                  <select
                    value={ruleFormData.relatedId}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, relatedId: e.target.value })}
                    required
                    style={styles.input}
                  >
                    <option value="">Select an option...</option>
                    {availableOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({opt.category})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.label}>Rule Type</label>
                  <select
                    value={ruleFormData.type}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, type: e.target.value })}
                    required
                    style={styles.input}
                  >
                    <option value="REQUIRES">REQUIRES</option>
                    <option value="EXCLUDES">EXCLUDES</option>
                  </select>
                </div>
              </div>
              
              <div style={styles.formField}>
                <label style={styles.label}>Reason (optional)</label>
                <textarea
                  value={ruleFormData.reason}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, reason: e.target.value })}
                  style={{ ...styles.input, minHeight: '60px' }}
                  placeholder="Why is this rule needed?"
                />
              </div>
              
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowRuleForm(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Add Rule
                </button>
              </div>
            </form>
          )}
          
          {option.requires.length === 0 && option.requiredBy.length === 0 && !showRuleForm && (
            <div style={styles.emptyState}>
              No compatibility rules defined yet.
            </div>
          )}
          
          {option.requires.length > 0 && (
            <div style={styles.rulesSection}>
              <h3 style={styles.rulesSubtitle}>This option requires:</h3>
              {option.requires.map((rule) => (
                <div key={rule.id} style={styles.ruleItem}>
                  <div style={styles.ruleInfo}>
                    <span style={{ ...styles.ruleBadge, ...styles.requiresBadge }}>
                      REQUIRES
                    </span>
                    <div>
                      <div style={styles.ruleName}>{rule.related.name}</div>
                      <div style={styles.ruleCategory}>{rule.related.category}</div>
                      {rule.reason && <div style={styles.ruleReason}>{rule.reason}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    style={styles.deleteRuleButton}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {option.requiredBy.length > 0 && (
            <div style={styles.rulesSection}>
              <h3 style={styles.rulesSubtitle}>Required by these options:</h3>
              {option.requiredBy.map((rule) => (
                <div key={rule.id} style={styles.ruleItem}>
                  <div style={styles.ruleInfo}>
                    <span style={{ ...styles.ruleBadge, ...styles.requiredByBadge }}>
                      REQUIRED BY
                    </span>
                    <div>
                      <div style={styles.ruleName}>{rule.option.name}</div>
                      <div style={styles.ruleCategory}>{rule.option.category}</div>
                      {rule.reason && <div style={styles.ruleReason}>{rule.reason}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  header: {
    marginBottom: '20px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: theme.backgroundElevated,
    color: theme.textSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '14px',
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
    padding: '40px',
    textAlign: 'center',
    color: '#c33',
    transition: 'all 0.2s ease',
  },
  errorBanner: {
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    padding: '24px',
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#ede9fe',
    color: '#6b21a8',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '600',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  optionId: {
    margin: 0,
    fontSize: '13px',
    color: theme.textTertiary,
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: theme.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  description: {
    margin: '0 0 20px 0',
    fontSize: '15px',
    color: theme.textSecondary,
    lineHeight: '1.6',
    transition: 'all 0.2s ease',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: theme.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
  },
  detailValue: {
    fontSize: '16px',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  addButton: {
    padding: '8px 16px',
    backgroundColor: theme.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  ruleForm: {
    padding: '20px',
    backgroundColor: theme.background,
    borderRadius: '6px',
    marginBottom: '20px',
    transition: 'all 0.2s ease',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px',
    marginBottom: '16px',
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
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: theme.backgroundElevated,
    color: theme.textSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    padding: '8px 16px',
    backgroundColor: theme.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: theme.textTertiary,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  rulesSection: {
    marginTop: '20px',
  },
  rulesSubtitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
  },
  ruleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: theme.background,
    borderRadius: '6px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
  },
  ruleInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  ruleBadge: {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  },
  requiresBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  requiredByBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  ruleName: {
    fontSize: '15px',
    fontWeight: '500',
    color: theme.text,
    marginBottom: '2px',
    transition: 'all 0.2s ease',
  },
  ruleCategory: {
    fontSize: '12px',
    color: theme.textTertiary,
    marginBottom: '4px',
    transition: 'all 0.2s ease',
  },
  ruleReason: {
    fontSize: '13px',
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginTop: '4px',
    transition: 'all 0.2s ease',
  },
  deleteRuleButton: {
    padding: '6px 12px',
    backgroundColor: '#fee',
    color: '#c33',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
});
