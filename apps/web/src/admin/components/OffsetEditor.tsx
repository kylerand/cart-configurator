/**
 * Subassembly Offset Editor Component.
 * 
 * Allows editing position/rotation/scale for each subassembly
 * with a live 3D preview.
 */

import React, { useState, useCallback } from 'react';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

export interface Transform3D {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SubassemblyOffsets {
  chassis?: Transform3D;
  wheels?: Transform3D;
  roof?: Transform3D;
  seats?: Transform3D;
  rearModule?: Transform3D;
  lighting?: Transform3D;
  audio?: Transform3D;
}

const SUBASSEMBLY_KEYS = ['chassis', 'wheels', 'roof', 'seats', 'rearModule', 'lighting', 'audio'] as const;
type SubassemblyKey = typeof SUBASSEMBLY_KEYS[number];

const SUBASSEMBLY_LABELS: Record<SubassemblyKey, string> = {
  chassis: 'Chassis',
  wheels: 'Wheels',
  roof: 'Roof',
  seats: 'Seats',
  rearModule: 'Rear Module',
  lighting: 'Lighting',
  audio: 'Audio',
};

const DEFAULT_TRANSFORM: Transform3D = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

interface OffsetEditorProps {
  offsets: SubassemblyOffsets;
  onChange: (offsets: SubassemblyOffsets) => void;
}

export const OffsetEditor: React.FC<OffsetEditorProps> = ({ offsets, onChange }) => {
  const styles = useThemedStyles(createStyles);
  const [expandedKey, setExpandedKey] = useState<SubassemblyKey | null>(null);

  const handleTransformChange = useCallback((
    key: SubassemblyKey,
    field: keyof Transform3D,
    index: number,
    value: number
  ) => {
    const currentTransform = offsets[key] || { ...DEFAULT_TRANSFORM };
    const newArray = [...currentTransform[field]] as [number, number, number];
    newArray[index] = value;
    
    onChange({
      ...offsets,
      [key]: {
        ...currentTransform,
        [field]: newArray,
      },
    });
  }, [offsets, onChange]);

  const handleResetTransform = useCallback((key: SubassemblyKey) => {
    const newOffsets = { ...offsets };
    delete newOffsets[key];
    onChange(newOffsets);
  }, [offsets, onChange]);

  const toggleExpanded = (key: SubassemblyKey) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Subassembly Offsets</h4>
        <span style={styles.hint}>Adjust position, rotation, and scale for each part</span>
      </div>
      
      <div style={styles.list}>
        {SUBASSEMBLY_KEYS.map((key) => {
          const transform = offsets[key] || DEFAULT_TRANSFORM;
          const isModified = !!offsets[key];
          const isExpanded = expandedKey === key;
          
          return (
            <div key={key} style={styles.item}>
              <div 
                style={styles.itemHeader}
                onClick={() => toggleExpanded(key)}
              >
                <span style={styles.itemLabel}>
                  {SUBASSEMBLY_LABELS[key]}
                  {isModified && <span style={styles.modifiedBadge}>Modified</span>}
                </span>
                <span style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
              </div>
              
              {isExpanded && (
                <div style={styles.transformEditor}>
                  {/* Position */}
                  <div style={styles.transformRow}>
                    <label style={styles.fieldLabel}>Position (X, Y, Z)</label>
                    <div style={styles.inputGroup}>
                      {['X', 'Y', 'Z'].map((axis, i) => (
                        <div key={axis} style={styles.inputWrapper}>
                          <span style={styles.axisLabel}>{axis}</span>
                          <input
                            type="number"
                            step="0.01"
                            value={transform.position[i]}
                            onChange={(e) => handleTransformChange(key, 'position', i, parseFloat(e.target.value) || 0)}
                            style={styles.input}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Rotation */}
                  <div style={styles.transformRow}>
                    <label style={styles.fieldLabel}>Rotation (degrees)</label>
                    <div style={styles.inputGroup}>
                      {['X', 'Y', 'Z'].map((axis, i) => (
                        <div key={axis} style={styles.inputWrapper}>
                          <span style={styles.axisLabel}>{axis}</span>
                          <input
                            type="number"
                            step="1"
                            value={Math.round((transform.rotation[i] * 180 / Math.PI) * 100) / 100}
                            onChange={(e) => handleTransformChange(key, 'rotation', i, (parseFloat(e.target.value) || 0) * Math.PI / 180)}
                            style={styles.input}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Scale */}
                  <div style={styles.transformRow}>
                    <label style={styles.fieldLabel}>Scale</label>
                    <div style={styles.inputGroup}>
                      {['X', 'Y', 'Z'].map((axis, i) => (
                        <div key={axis} style={styles.inputWrapper}>
                          <span style={styles.axisLabel}>{axis}</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={transform.scale[i]}
                            onChange={(e) => handleTransformChange(key, 'scale', i, parseFloat(e.target.value) || 1)}
                            style={styles.input}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Reset Button */}
                  {isModified && (
                    <button
                      onClick={() => handleResetTransform(key)}
                      style={styles.resetButton}
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  container: {
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    padding: '12px 16px',
    backgroundColor: theme.background,
    borderBottom: `1px solid ${theme.border}`,
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: theme.text,
  },
  hint: {
    fontSize: '12px',
    color: theme.textSecondary,
    marginTop: '4px',
    display: 'block',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    borderBottom: `1px solid ${theme.border}`,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    backgroundColor: theme.surface,
    transition: 'background-color 0.2s',
  },
  itemLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: theme.text,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modifiedBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: theme.primary,
    color: 'white',
    borderRadius: '4px',
    fontWeight: 600,
  },
  expandIcon: {
    fontSize: '10px',
    color: theme.textSecondary,
  },
  transformEditor: {
    padding: '16px',
    backgroundColor: theme.background,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  transformRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: theme.textSecondary,
  },
  inputGroup: {
    display: 'flex',
    gap: '8px',
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  axisLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: theme.textSecondary,
    width: '14px',
  },
  input: {
    flex: 1,
    padding: '6px 8px',
    fontSize: '13px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: theme.surface,
    color: theme.text,
    width: '60px',
  },
  resetButton: {
    alignSelf: 'flex-start',
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: 'transparent',
    color: theme.error || '#d32f2f',
    border: `1px solid ${theme.error || '#d32f2f'}`,
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '4px',
  },
});

export default OffsetEditor;
