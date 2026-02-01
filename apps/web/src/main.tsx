/**
 * Main application entry point.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ConfiguratorPage } from './pages/ConfiguratorPage';
import { QuotePage } from './pages/QuotePage';
import { AdminQuotesPage } from './pages/AdminQuotesPage';
import { useCatalogLoader } from './hooks/useCatalogLoader';
import { useThemeStore } from './admin/store/themeStore';

// Admin imports
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { PlatformsPage } from './admin/pages/PlatformsPage';
import { OptionsPage } from './admin/pages/OptionsPage';
import { OptionDetailPage } from './admin/pages/OptionDetailPage';
import { MaterialsPage } from './admin/pages/MaterialsPage';
import { AuditLogsPage } from './admin/pages/AuditLogsPage';
import { UsersPage } from './admin/pages/UsersPage';
import { ResetPasswordPage } from './admin/pages/ResetPasswordPage';
import { ForgotPasswordPage } from './admin/pages/ForgotPasswordPage';
import { ProtectedRoute } from './admin/components/ProtectedRoute';

function App() {
  const { loading, error } = useCatalogLoader();
  const { mode } = useThemeStore();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Loading Golf Cart Configurator...</h1>
          <p>Please wait while we load the catalog.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'red' }}>
          <h1>Error Loading Configurator</h1>
          <p>{error.message}</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Make sure the API server is running on port 3001.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast notifications with theme support */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: mode === 'dark' ? '#1e293b' : '#ffffff',
            color: mode === 'dark' ? '#f1f5f9' : '#111827',
            border: mode === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<ConfiguratorPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/admin/quotes" element={<AdminQuotesPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/platforms" element={<PlatformsPage />} />
          <Route path="/admin/options" element={<OptionsPage />} />
          <Route path="/admin/options/:id" element={<OptionDetailPage />} />
          <Route path="/admin/materials" element={<MaterialsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
