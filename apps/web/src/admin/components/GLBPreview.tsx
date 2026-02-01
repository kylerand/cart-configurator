/**
 * GLB Preview Component for Admin Panel.
 * 
 * Renders a 3D preview of a GLB file using React Three Fiber.
 * Useful for validating uploaded models.
 */

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, Html } from '@react-three/drei';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { Theme } from '../store/themeStore';

interface GLBPreviewProps {
  url: string;
  height?: number;
}

// Separate component for the model to handle loading states
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  
  const clonedScene = useMemo(() => {
    return scene.clone(true);
  }, [scene]);

  return (
    <Center>
      <primitive object={clonedScene} />
    </Center>
  );
}

// Loading indicator inside the canvas
function LoadingIndicator() {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        color: '#666',
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '3px solid #e0e0e0',
          borderTopColor: '#0066cc',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ fontSize: '12px' }}>Loading model...</span>
      </div>
    </Html>
  );
}

// Error boundary for GLB loading
function ErrorFallback({ url, onRetry }: { url: string; onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '12px',
      padding: '20px',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '32px' }}>⚠️</span>
      <span style={{ fontSize: '14px', color: '#d32f2f' }}>
        Failed to load GLB
      </span>
      <span style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
        {url.length > 60 ? `...${url.slice(-57)}` : url}
      </span>
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          background: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Retry
      </button>
    </div>
  );
}

export const GLBPreview: React.FC<GLBPreviewProps> = ({ url, height = 300 }) => {
  const styles = useThemedStyles(createStyles);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
    setKey(prev => prev + 1);
  }, [url]);

  const handleRetry = () => {
    // Clear the GLTF cache for this URL
    useGLTF.clear(url);
    setHasError(false);
    setKey(prev => prev + 1);
  };

  if (!url) {
    return (
      <div style={{ ...styles.container, height }}>
        <div style={styles.placeholder}>
          <span style={{ fontSize: '32px' }}>📦</span>
          <span style={{ fontSize: '14px', color: '#666' }}>No model URL provided</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ ...styles.container, height }}>
        <ErrorFallback url={url} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, height }}>
      <div style={styles.header}>
        <span style={styles.headerText}>3D Preview</span>
        <span style={styles.urlText} title={url}>
          {url.length > 40 ? `...${url.slice(-37)}` : url}
        </span>
      </div>
      <div style={styles.canvas}>
        <Canvas
          key={key}
          camera={{ position: [3, 2, 5], fov: 50 }}
          onError={() => setHasError(true)}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={<LoadingIndicator />}>
            <ErrorBoundary onError={() => setHasError(true)}>
              <Model url={url} />
            </ErrorBoundary>
            <Environment preset="studio" />
          </Suspense>
          <OrbitControls 
            autoRotate 
            autoRotateSpeed={2}
            enableZoom={true}
            enablePan={true}
          />
        </Canvas>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const createStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: theme.surface,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: `1px solid ${theme.border}`,
    backgroundColor: theme.background,
  },
  headerText: {
    fontSize: '12px',
    fontWeight: 600,
    color: theme.text,
  },
  urlText: {
    fontSize: '10px',
    color: theme.textSecondary,
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  canvas: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '8px',
  },
});

export default GLBPreview;
