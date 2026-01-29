/**
 * Global Search Component
 * 
 * Unified search across all admin entities with keyboard shortcuts.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../api/client';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

interface SearchResult {
  type: 'platform' | 'option' | 'material' | 'user';
  id: string;
  title: string;
  subtitle: string;
  url: string;
  color?: string;
}

interface SearchResults {
  platforms: SearchResult[];
  options: SearchResult[];
  materials: SearchResult[];
  users: SearchResult[];
}

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const styles = useThemedStyles(createStyles);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return undefined;
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      await performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      const data: any = await adminApi.globalSearch(searchQuery);
      setResults(data.results);
      setSelectedIndex(0);
    } catch (err) {
      toast.error('Search failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const allResults: SearchResult[] = results
    ? [...results.platforms, ...results.options, ...results.materials, ...results.users]
    : [];

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
    setResults(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results || allResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      handleResultClick(allResults[selectedIndex]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'platform':
        return '🛠️';
      case 'option':
        return '⚙️';
      case 'material':
        return '🎨';
      case 'user':
        return '👤';
      default:
        return '📄';
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={styles.trigger}>
        🔍 Search{' '}
        <span style={styles.shortcut}>
          {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
        </span>
      </button>
    );
  }

  return (
    <div style={styles.overlay}>
      <div ref={searchRef} style={styles.modal}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search platforms, options, materials, users..."
            style={styles.searchInput}
            autoFocus
          />
          {isLoading && <span style={styles.loadingSpinner}>⏳</span>}
        </div>

        {query.trim().length < 2 && (
          <div style={styles.hint}>
            Type at least 2 characters to search...
          </div>
        )}

        {results && allResults.length === 0 && query.trim().length >= 2 && (
          <div style={styles.noResults}>
            No results found for "{query}"
          </div>
        )}

        {results && allResults.length > 0 && (
          <div style={styles.results}>
            {Object.entries(results).map(([type, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={type} style={styles.resultGroup}>
                  <div style={styles.resultGroupTitle}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} ({items.length})
                  </div>
                  {items.map((result: SearchResult) => {
                    const globalIndex = allResults.indexOf(result);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <div
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        style={{
                          ...styles.resultItem,
                          ...(isSelected ? styles.resultItemSelected : {}),
                        }}
                      >
                        <span style={styles.resultIcon}>
                          {result.color ? (
                            <span
                              style={{
                                display: 'inline-block',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: result.color,
                                border: '2px solid #fff',
                              }}
                            />
                          ) : (
                            getTypeIcon(result.type)
                          )}
                        </span>
                        <div style={styles.resultContent}>
                          <div style={styles.resultTitle}>{result.title}</div>
                          <div style={styles.resultSubtitle}>{result.subtitle}</div>
                        </div>
                        {isSelected && <span style={styles.enterHint}>↵</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        <div style={styles.footer}>
          <span style={styles.footerHint}>
            ↑↓ Navigate · ↵ Select · ESC Close
          </span>
        </div>
      </div>
    </div>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: theme.backgroundHover,
    color: theme.textSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  shortcut: {
    fontSize: '12px',
    padding: '2px 6px',
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    fontFamily: 'monospace',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '15vh',
    zIndex: 2000,
  },
  modal: {
    width: '90%',
    maxWidth: '600px',
    backgroundColor: theme.backgroundElevated,
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderBottom: `1px solid ${theme.border}`,
  },
  searchIcon: {
    fontSize: '20px',
    marginRight: '12px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    backgroundColor: 'transparent',
    color: theme.text,
  },
  loadingSpinner: {
    fontSize: '16px',
  },
  hint: {
    padding: '40px 20px',
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: '14px',
  },
  noResults: {
    padding: '40px 20px',
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: '14px',
  },
  results: {
    maxHeight: '400px',
    overflow: 'auto',
    padding: '8px',
  },
  resultGroup: {
    marginBottom: '16px',
  },
  resultGroupTitle: {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: theme.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  resultItemSelected: {
    backgroundColor: theme.backgroundHover,
  },
  resultIcon: {
    fontSize: '20px',
    width: '24px',
    textAlign: 'center',
  },
  resultContent: {
    flex: 1,
    minWidth: 0,
  },
  resultTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  resultSubtitle: {
    fontSize: '12px',
    color: theme.textSecondary,
    marginTop: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  enterHint: {
    fontSize: '12px',
    color: theme.textTertiary,
    fontWeight: '600',
  },
  footer: {
    padding: '12px 16px',
    borderTop: `1px solid ${theme.border}`,
    backgroundColor: theme.backgroundHover,
  },
  footerHint: {
    fontSize: '12px',
    color: theme.textSecondary,
  },
});
