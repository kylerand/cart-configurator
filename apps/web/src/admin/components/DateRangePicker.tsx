/**
 * Date Range Picker component for filtering data.
 * 
 * Features:
 * - Quick presets (Today, Last 7 days, Last 30 days, All time)
 * - Custom date range selection
 * - Dark mode support
 */

import React, { useState } from 'react';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
  preset: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [showCustom, setShowCustom] = useState(false);
  const styles = useThemedStyles(createStyles);

  const presets = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'Custom', value: 'custom' },
  ];

  const handlePresetChange = (preset: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    let startDate: string | null = null;
    let endDate: string | null = null;

    switch (preset) {
      case 'today':
        startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        endDate = new Date().toISOString();
        break;
      case '7days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        endDate = new Date().toISOString();
        break;
      case '30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        endDate = new Date().toISOString();
        break;
      case 'all':
        startDate = null;
        endDate = null;
        break;
      case 'custom':
        setShowCustom(true);
        return;
    }

    onChange({ startDate, endDate, preset });
    setShowCustom(false);
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', dateValue: string) => {
    onChange({
      ...value,
      [field]: dateValue ? new Date(dateValue).toISOString() : null,
      preset: 'custom',
    });
  };

  const formatDateForInput = (isoString: string | null): string => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  return (
    <div style={styles.container}>
      <div style={styles.presets}>
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetChange(preset.value)}
            style={{
              ...styles.presetButton,
              ...(value.preset === preset.value ? styles.presetButtonActive : {}),
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {(showCustom || value.preset === 'custom') && (
        <div style={styles.customRange}>
          <div style={styles.dateField}>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              value={formatDateForInput(value.startDate)}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              style={styles.dateInput}
            />
          </div>
          <div style={styles.dateField}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              value={formatDateForInput(value.endDate)}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              style={styles.dateInput}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  presets: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  presetButton: {
    padding: '8px 16px',
    backgroundColor: theme.surface,
    color: theme.textSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  presetButtonActive: {
    backgroundColor: theme.primary,
    color: '#ffffff',
    borderColor: theme.primary,
  },
  customRange: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: theme.backgroundHover,
    borderRadius: '4px',
    border: `1px solid ${theme.border}`,
  },
  dateField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: theme.textSecondary,
    textTransform: 'uppercase',
  },
  dateInput: {
    padding: '8px 12px',
    fontSize: '14px',
    backgroundColor: theme.surface,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
});
