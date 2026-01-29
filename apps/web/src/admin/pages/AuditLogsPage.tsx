/**
 * Audit log viewer page.
 * 
 * View system audit trail with filtering and pagination.
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { DateRangePicker, type DateRange } from '../components/DateRangePicker';
import { adminApi } from '../api/client';
import { exportAuditLogsCSV } from '../utils/csvExport';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: string;
  timestamp: string;
  ipAddress: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const AuditLogsPage: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
  });

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
    preset: 'all',
  });
  
  useEffect(() => {
    loadData();
  }, [currentPage, filters, dateRange]);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        adminApi.getAuditLogs({
          ...filters,
          action: filters.action || undefined,
          entityType: filters.entityType || undefined,
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined,
          page: currentPage,
          perPage: 25,
        }),
        currentPage === 1 ? adminApi.getAuditStats() : Promise.resolve(stats),
      ]);
      
      setLogs(logsRes.logs);
      setTotalPages(logsRes.pagination.totalPages);
      if (currentPage === 1) {
        setStats(statsRes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  };
  
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return { bg: '#d1fae5', text: '#065f46' };
      case 'UPDATE':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'DELETE':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'LOGIN':
        return { bg: '#e0e7ff', text: '#3730a3' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };
  
  const parseChanges = (changesStr: string) => {
    try {
      return JSON.parse(changesStr);
    } catch {
      return null;
    }
  };
  
  if (isLoading && logs.length === 0) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading audit logs...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Audit Logs</h1>
          <p style={styles.subtitle}>View system activity and changes</p>
        </div>
      </div>
      
      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError(null)} style={styles.errorClose}>×</button>
        </div>
      )}
      
      {/* Stats Cards */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalLogs}</div>
            <div style={styles.statLabel}>Total Logs</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.recentLogs}</div>
            <div style={styles.statLabel}>Last 24 Hours</div>
          </div>
          {stats.actionCounts.slice(0, 3).map((ac: any) => (
            <div key={ac.action} style={styles.statCard}>
              <div style={styles.statValue}>{ac.count}</div>
              <div style={styles.statLabel}>{ac.action}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Filters */}
      <div style={styles.filtersCard}>
        <h3 style={styles.filtersTitle}>Filters</h3>
        
        <div style={styles.filtersRow}>
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>Action</label>
            <select
              value={filters.action}
              onChange={(e) => {
                setFilters({ ...filters, action: e.target.value });
                setCurrentPage(1);
              }}
              style={styles.filterInput}
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
            </select>
          </div>
          
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>Entity Type</label>
            <select
              value={filters.entityType}
              onChange={(e) => {
                setFilters({ ...filters, entityType: e.target.value });
                setCurrentPage(1);
              }}
              style={styles.filterInput}
            >
              <option value="">All Entities</option>
              <option value="Platform">Platform</option>
              <option value="Option">Option</option>
              <option value="OptionRelation">Option Rule</option>
              <option value="Material">Material</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>

        <div style={styles.dateRangeSection}>
          <label style={styles.filterLabel}>Date Range</label>
          <DateRangePicker value={dateRange} onChange={(range) => {
            setDateRange(range);
            setCurrentPage(1);
          }} />
        </div>
          
        <div style={styles.filterActions}>
          <button
            onClick={() => {
              setFilters({ action: '', entityType: '' });
              setDateRange({ startDate: null, endDate: null, preset: 'all' });
              setCurrentPage(1);
            }}
            style={styles.clearButton}
          >
            Clear Filters
          </button>
          <button
            onClick={() => exportAuditLogsCSV(logs)}
            style={styles.exportButton}
            disabled={logs.length === 0}
          >
            📥 Export Filtered
          </button>
        </div>
      </div>
      
      {/* Logs List */}
      <div style={styles.logsCard}>
        {logs.length === 0 ? (
          <div style={styles.emptyState}>
            No audit logs found matching your filters.
          </div>
        ) : (
          <>
            {logs.map((log) => {
              const actionColor = getActionColor(log.action);
              const changes = parseChanges(log.changes);
              
              return (
                <div key={log.id} style={styles.logItem}>
                  <div style={styles.logHeader}>
                    <div style={styles.logHeaderLeft}>
                      <span
                        style={{
                          ...styles.actionBadge,
                          backgroundColor: actionColor.bg,
                          color: actionColor.text,
                        }}
                      >
                        {log.action}
                      </span>
                      <span style={styles.entityType}>{log.entityType}</span>
                      <span style={styles.entityId}>{log.entityId}</span>
                    </div>
                    <div style={styles.logTimestamp}>
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </div>
                  
                  <div style={styles.logBody}>
                    <div style={styles.userInfo}>
                      <span style={styles.userName}>{log.user.name}</span>
                      <span style={styles.userEmail}>({log.user.email})</span>
                      <span style={styles.userRole}>{log.user.role}</span>
                      {log.ipAddress && (
                        <span style={styles.ipAddress}>from {log.ipAddress}</span>
                      )}
                    </div>
                    
                    {changes && (
                      <details style={styles.changesDetails}>
                        <summary style={styles.changesSummary}>View Changes</summary>
                        <pre style={styles.changesContent}>
                          {JSON.stringify(changes, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                  }}
                >
                  ← Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  header: {
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '20px',
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '600',
    color: theme.text,
    marginBottom: '4px',
    transition: 'all 0.2s ease',
  },
  statLabel: {
    fontSize: '12px',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
  },
  filtersCard: {
    padding: '20px',
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
    transition: 'all 0.2s ease',
  },
  filtersTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: theme.text,
  },
  filtersRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    marginBottom: '16px',
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: theme.textSecondary,
    transition: 'all 0.2s ease',
  },
  filterInput: {
    padding: '8px 12px',
    fontSize: '14px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: theme.backgroundElevated,
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  dateRangeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  filterActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: theme.backgroundHover,
    color: theme.textSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  exportButton: {
    padding: '8px 16px',
    backgroundColor: theme.success,
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  logsCard: {
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    color: theme.textTertiary,
    transition: 'all 0.2s ease',
  },
  logItem: {
    padding: '20px',
    borderBottom: `1px solid ${theme.borderLight}`,
    transition: 'all 0.2s ease',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  logHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  actionBadge: {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '4px',
  },
  entityType: {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  entityId: {
    fontSize: '12px',
    color: theme.textTertiary,
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
  },
  logTimestamp: {
    fontSize: '13px',
    color: theme.textSecondary,
    transition: 'all 0.2s ease',
  },
  logBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  userName: {
    fontWeight: '500',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  userEmail: {
    color: theme.textSecondary,
    transition: 'all 0.2s ease',
  },
  userRole: {
    padding: '2px 6px',
    backgroundColor: theme.backgroundHover,
    color: theme.textSecondary,
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  ipAddress: {
    color: theme.textTertiary,
    fontSize: '12px',
    transition: 'all 0.2s ease',
  },
  changesDetails: {
    marginTop: '8px',
  },
  changesSummary: {
    fontSize: '13px',
    color: theme.primary,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s ease',
  },
  changesContent: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: theme.background,
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '300px',
    color: theme.text,
    transition: 'all 0.2s ease',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
  },
  pageButton: {
    padding: '8px 16px',
    backgroundColor: theme.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  pageButtonDisabled: {
    backgroundColor: theme.backgroundHover,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '14px',
    color: theme.textSecondary,
    transition: 'all 0.2s ease',
  },
});
