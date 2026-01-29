/**
 * CSV Import component for bulk creating/updating entities.
 * 
 * Features:
 * - File upload
 * - CSV parsing and validation
 * - Preview before import
 * - Error reporting
 * - Progress tracking
 */

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

interface CsvImporterProps {
  entityType: 'platforms' | 'options' | 'materials';
  onImport: (data: unknown[]) => Promise<void>;
  templateHeaders: string[];
  onClose: () => void;
}

interface ParsedRow {
  data: Record<string, string>;
  errors: string[];
  rowNumber: number;
}

export const CsvImporter: React.FC<CsvImporterProps> = ({
  entityType,
  onImport,
  templateHeaders,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const styles = useThemedStyles(createStyles);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ParsedRow[] = results.data.map((row: unknown, index: number) => {
          const rowData = row as Record<string, string>;
          const errors: string[] = [];

          // Validate required headers
          templateHeaders.forEach((header) => {
            if (!(header in rowData) || !rowData[header]?.trim()) {
              errors.push(`Missing required field: ${header}`);
            }
          });

          return {
            data: rowData,
            errors,
            rowNumber: index + 2, // +2 for header and 0-index
          };
        });

        setParsedData(rows);
        setIsProcessing(false);

        const errorCount = rows.filter((r) => r.errors.length > 0).length;
        if (errorCount > 0) {
          toast.error(`${errorCount} row(s) have validation errors`);
        } else {
          toast.success(`Parsed ${rows.length} row(s) successfully`);
        }
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
        setIsProcessing(false);
      },
    });
  };

  const handleImport = async () => {
    const validRows = parsedData.filter((r) => r.errors.length === 0);

    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setIsProcessing(true);

    try {
      await onImport(validRows.map((r) => r.data));
      toast.success(`Imported ${validRows.length} ${entityType} successfully`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csv = templateHeaders.join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const validRowCount = parsedData.filter((r) => r.errors.length === 0).length;
  const errorRowCount = parsedData.length - validRowCount;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Import {entityType}</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.content}>
          {!file ? (
            <div style={styles.uploadSection}>
              <p style={styles.instructions}>
                Upload a CSV file to bulk import {entityType}. The file must include these headers:
              </p>
              <div style={styles.headerList}>
                {templateHeaders.map((header) => (
                  <code key={header} style={styles.headerTag}>
                    {header}
                  </code>
                ))}
              </div>

              <button onClick={downloadTemplate} style={styles.templateButton}>
                📥 Download Template
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={styles.fileInput}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                style={styles.uploadButton}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : '📄 Select CSV File'}
              </button>
            </div>
          ) : (
            <div style={styles.previewSection}>
              <div style={styles.fileInfo}>
                <span style={styles.fileName}>{file.name}</span>
                <button onClick={() => {
                  setFile(null);
                  setParsedData([]);
                }} style={styles.clearButton}>
                  Clear
                </button>
              </div>

              {parsedData.length > 0 && (
                <>
                  <div style={styles.summary}>
                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>Total Rows:</span>
                      <span style={styles.summaryValue}>{parsedData.length}</span>
                    </div>
                    <div style={styles.summaryItem}>
                      <span style={{...styles.summaryLabel, color: '#10b981'}}>Valid:</span>
                      <span style={{...styles.summaryValue, color: '#10b981'}}>{validRowCount}</span>
                    </div>
                    <div style={styles.summaryItem}>
                      <span style={{...styles.summaryLabel, color: '#ef4444'}}>Errors:</span>
                      <span style={{...styles.summaryValue, color: '#ef4444'}}>{errorRowCount}</span>
                    </div>
                  </div>

                  <div style={styles.previewTable}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Row</th>
                          <th style={styles.th}>Status</th>
                          {templateHeaders.map((header) => (
                            <th key={header} style={styles.th}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 10).map((row) => (
                          <tr key={row.rowNumber} style={styles.tr}>
                            <td style={styles.td}>{row.rowNumber}</td>
                            <td style={styles.td}>
                              {row.errors.length === 0 ? (
                                <span style={styles.validBadge}>✓</span>
                              ) : (
                                <span style={styles.errorBadge} title={row.errors.join(', ')}>
                                  ✕
                                </span>
                              )}
                            </td>
                            {templateHeaders.map((header) => (
                              <td key={header} style={styles.td}>
                                {row.data[header] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 10 && (
                      <p style={styles.moreRows}>
                        ... and {parsedData.length - 10} more row(s)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          {parsedData.length > 0 && (
            <button
              onClick={handleImport}
              style={{
                ...styles.importButton,
                ...(validRowCount === 0 || isProcessing ? styles.importButtonDisabled : {}),
              }}
              disabled={validRowCount === 0 || isProcessing}
            >
              {isProcessing ? 'Importing...' : `Import ${validRowCount} Row(s)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: theme.backgroundElevated,
    borderRadius: '8px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: `1px solid ${theme.border}`,
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: theme.text,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: theme.textSecondary,
    cursor: 'pointer',
    padding: '4px 8px',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  uploadSection: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  instructions: {
    fontSize: '14px',
    color: theme.textSecondary,
    marginBottom: '16px',
  },
  headerList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  headerTag: {
    padding: '4px 8px',
    backgroundColor: theme.backgroundHover,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: theme.text,
  },
  templateButton: {
    padding: '10px 20px',
    backgroundColor: theme.secondary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    padding: '12px 24px',
    backgroundColor: theme.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fileInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: theme.backgroundHover,
    borderRadius: '4px',
  },
  fileName: {
    fontSize: '14px',
    color: theme.text,
    fontWeight: '500',
  },
  clearButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: theme.textSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  summary: {
    display: 'flex',
    gap: '24px',
    padding: '16px',
    backgroundColor: theme.backgroundHover,
    borderRadius: '4px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  summaryLabel: {
    fontSize: '12px',
    color: theme.textSecondary,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: theme.text,
  },
  previewTable: {
    overflow: 'auto',
    maxHeight: '400px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    padding: '8px 12px',
    textAlign: 'left',
    backgroundColor: theme.backgroundHover,
    color: theme.text,
    fontWeight: '600',
    borderBottom: `2px solid ${theme.border}`,
    position: 'sticky',
    top: 0,
  },
  tr: {
    borderBottom: `1px solid ${theme.border}`,
  },
  td: {
    padding: '8px 12px',
    color: theme.textSecondary,
  },
  validBadge: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: '16px',
  },
  errorBadge: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'help',
  },
  moreRows: {
    padding: '16px',
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: '13px',
    fontStyle: 'italic',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${theme.border}`,
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: theme.textSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  importButton: {
    padding: '10px 20px',
    backgroundColor: theme.success,
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  importButtonDisabled: {
    backgroundColor: theme.secondary,
    cursor: 'not-allowed',
  },
});
