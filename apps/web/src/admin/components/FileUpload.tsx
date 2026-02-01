/**
 * File upload component for 3D models and textures.
 * 
 * Supports drag-and-drop and click-to-upload.
 * Shows upload progress and file preview.
 */

import React, { useState, useRef, useCallback } from 'react';
import { adminApi } from '../api/client';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

export type FileCategory = 'models' | 'textures' | 'images';

interface FileUploadProps {
  category: FileCategory;
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  label?: string;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  category,
  currentUrl,
  onUploadComplete,
  onError,
  label,
  accept,
}) => {
  const styles = useThemedStyles(createStyles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Default accept types based on category
  const defaultAccept = {
    models: '.glb,.gltf',
    textures: '.png,.jpg,.jpeg,.webp',
    images: '.png,.jpg,.jpeg,.webp,.svg',
  };

  const acceptTypes = accept || defaultAccept[category];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [category]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [category]);

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file first
      const validation = await adminApi.validateUpload(file.name, file.size, category);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid file');
      }

      setUploadProgress(30);

      // Upload based on category
      let result;
      if (category === 'models') {
        result = await adminApi.uploadModel(file);
      } else if (category === 'textures') {
        result = await adminApi.uploadTexture(file);
      } else {
        result = await adminApi.uploadImage(file);
      }

      setUploadProgress(100);

      if (result.success && result.url) {
        onUploadComplete(result.url);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUploadComplete(e.target.value);
  };

  const getFileIcon = () => {
    switch (category) {
      case 'models':
        return '📦';
      case 'textures':
        return '🎨';
      case 'images':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <div style={styles.container}>
      {label && <label style={styles.label}>{label}</label>}
      
      {/* URL Input */}
      <div style={styles.urlInputContainer}>
        <input
          type="text"
          value={currentUrl || ''}
          onChange={handleUrlInput}
          placeholder={`Enter URL or upload a ${category.slice(0, -1)} file...`}
          style={styles.urlInput}
        />
      </div>

      {/* Drag & Drop Zone */}
      <div
        style={{
          ...styles.dropZone,
          ...(isDragging ? styles.dropZoneActive : {}),
          ...(isUploading ? styles.dropZoneUploading : {}),
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileSelect}
          style={styles.hiddenInput}
        />
        
        {isUploading ? (
          <div style={styles.uploadingContent}>
            <div style={styles.spinner} />
            <span style={styles.uploadingText}>Uploading... {uploadProgress}%</span>
            <div style={styles.progressBar}>
              <div 
                style={{ 
                  ...styles.progressFill, 
                  width: `${uploadProgress}%` 
                }} 
              />
            </div>
          </div>
        ) : (
          <div style={styles.dropContent}>
            <span style={styles.icon}>{getFileIcon()}</span>
            <span style={styles.dropText}>
              Drag & drop or <span style={styles.link}>browse</span>
            </span>
            <span style={styles.hint}>
              {category === 'models' && 'GLB, GLTF (max 50MB)'}
              {category === 'textures' && 'PNG, JPG, WebP (max 10MB)'}
              {category === 'images' && 'PNG, JPG, WebP, SVG (max 5MB)'}
            </span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* Current File Preview */}
      {currentUrl && !isUploading && (
        <div style={styles.preview}>
          <span style={styles.previewIcon}>✓</span>
          <span style={styles.previewText} title={currentUrl}>
            {currentUrl.length > 50 ? `...${currentUrl.slice(-47)}` : currentUrl}
          </span>
        </div>
      )}
    </div>
  );
};

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: theme.text,
  },
  urlInputContainer: {
    display: 'flex',
    gap: '8px',
  },
  urlInput: {
    flex: 1,
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    backgroundColor: theme.surface,
    color: theme.text,
  },
  dropZone: {
    border: `2px dashed ${theme.border}`,
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: theme.background,
  },
  dropZoneActive: {
    borderColor: theme.primary,
    backgroundColor: theme.backgroundHover,
  },
  dropZoneUploading: {
    cursor: 'not-allowed',
    opacity: 0.8,
  },
  hiddenInput: {
    display: 'none',
  },
  dropContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  icon: {
    fontSize: '32px',
  },
  dropText: {
    fontSize: '14px',
    color: theme.textSecondary,
  },
  link: {
    color: theme.primary,
    textDecoration: 'underline',
  },
  hint: {
    fontSize: '12px',
    color: theme.textTertiary,
  },
  uploadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: `3px solid ${theme.border}`,
    borderTopColor: theme.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  uploadingText: {
    fontSize: '14px',
    color: theme.text,
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: theme.border,
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    transition: 'width 0.3s ease',
  },
  error: {
    padding: '8px 12px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '13px',
  },
  preview: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: theme.backgroundHover,
    borderRadius: '6px',
  },
  previewIcon: {
    color: '#059669',
    fontSize: '14px',
  },
  previewText: {
    fontSize: '13px',
    color: theme.textSecondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export default FileUpload;
