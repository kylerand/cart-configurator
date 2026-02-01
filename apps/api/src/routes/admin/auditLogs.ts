/**
 * Admin audit log routes.
 * 
 * View system audit trail with filtering.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../auth/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// All audit routes require authentication
router.use(authenticate);

/**
 * GET /api/admin/audit-logs
 * 
 * List audit logs with filters and pagination.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      action,
      entityType,
      userId,
      startDate,
      endDate,
      page = '1',
      perPage = '50',
    } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(perPage as string);
    const take = parseInt(perPage as string);
    
    const where: any = {};
    
    // Only add filters if they have valid values (not undefined or "undefined" string)
    if (action && action !== 'undefined') where.action = action;
    if (entityType && entityType !== 'undefined') where.entityType = entityType;
    if (userId && userId !== 'undefined') where.userId = userId;
    
    // Date range filtering - validate dates before using
    if (startDate || endDate) {
      const startDateObj = startDate && startDate !== 'undefined' ? new Date(startDate as string) : null;
      const endDateObj = endDate && endDate !== 'undefined' ? new Date(endDate as string) : null;
      
      // Only add timestamp filter if we have valid dates
      if ((startDateObj && !isNaN(startDateObj.getTime())) || (endDateObj && !isNaN(endDateObj.getTime()))) {
        where.timestamp = {};
        if (startDateObj && !isNaN(startDateObj.getTime())) {
          where.timestamp.gte = startDateObj;
        }
        if (endDateObj && !isNaN(endDateObj.getTime())) {
          where.timestamp.lte = endDateObj;
        }
      }
    }
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);
    
    res.json({
      logs,
      pagination: {
        page: parseInt(page as string),
        perPage: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('List audit logs error:', error);
    res.status(500).json({ error: 'Failed to list audit logs' });
  }
});

/**
 * GET /api/admin/audit-logs/stats
 * 
 * Get audit log statistics.
 */
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalLogs, recentLogs, actionCounts] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
      }),
    ]);
    
    res.json({
      totalLogs,
      recentLogs,
      actionCounts: actionCounts.map((ac: { action: string; _count: { action: number } }) => ({
        action: ac.action,
        count: ac._count.action,
      })),
    });
  } catch (error) {
    console.error('Audit stats error:', error);
    res.status(500).json({ error: 'Failed to get audit stats' });
  }
});

export default router;
