/**
 * Express API server for Golf Cart Configurator.
 * 
 * Provides REST endpoints for:
 * - Saving/loading configurations
 * - Submitting quote requests
 * - Admin quote management
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { catalogRouter } from './routes/catalog.js';
import { configurationRouter } from './routes/configuration.js';
import { quoteRouter } from './routes/quote.js';
import adminAuthRouter from './routes/admin/auth.js';
import adminSupabaseAuthRouter from './routes/admin/supabaseAuth.js';
import adminPlatformsRouter from './routes/admin/platforms.js';
import adminOptionsRouter from './routes/admin/options.js';
import adminMaterialsRouter from './routes/admin/materials.js';
import adminAuditLogsRouter from './routes/admin/auditLogs.js';
import adminUsersRouter from './routes/admin/users.js';
import adminSearchRouter from './routes/admin/search.js';
import adminUploadsRouter from './routes/admin/uploads.js';

const app = express();
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Public routes
app.use('/api/catalog', catalogRouter);
app.use('/api/configurations', configurationRouter(prisma));
app.use('/api/quotes', quoteRouter(prisma));

// Admin routes
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/auth/supabase', adminSupabaseAuthRouter);
app.use('/api/admin/platforms', adminPlatformsRouter);
app.use('/api/admin/options', adminOptionsRouter);
app.use('/api/admin/materials', adminMaterialsRouter);
app.use('/api/admin/audit-logs', adminAuditLogsRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/search', adminSearchRouter);
app.use('/api/admin/uploads', adminUploadsRouter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cart Configurator API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});
