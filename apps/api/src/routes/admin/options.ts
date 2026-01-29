/**
 * Admin option management routes.
 * 
 * CRUD operations for configuration options with rule management.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../../auth/authMiddleware.js';
import { UserRole, canEditField } from '../../auth/authUtils.js';

const router = Router();
const prisma = new PrismaClient();

// All option routes require authentication
router.use(authenticate);

/**
 * GET /api/admin/options
 * 
 * List all options with filters.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { platformId, category, isActive } = req.query;
    
    const where: any = {};
    if (platformId) where.platformId = platformId;
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    const options = await prisma.option.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      include: {
        platform: {
          select: { id: true, name: true },
        },
        _count: {
          select: { requires: true, requiredBy: true },
        },
      },
    });
    
    res.json({ options });
  } catch (error) {
    console.error('List options error:', error);
    res.status(500).json({ error: 'Failed to list options' });
  }
});

/**
 * GET /api/admin/options/:id
 * 
 * Get single option with rules.
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const option = await prisma.option.findUnique({
      where: { id },
      include: {
        platform: true,
        requires: {
          include: {
            related: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        requiredBy: {
          include: {
            option: {
              select: { id: true, name: true, category: true },
            },
          },
        },
      },
    });
    
    if (!option) {
      res.status(404).json({ error: 'Option not found' });
      return;
    }
    
    res.json({ option });
  } catch (error) {
    console.error('Get option error:', error);
    res.status(500).json({ error: 'Failed to get option' });
  }
});

/**
 * POST /api/admin/options
 * 
 * Create new option (Admin+ only).
 */
router.post(
  '/',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        id,
        platformId,
        category,
        name,
        description,
        partPrice,
        laborHours,
        assetPath,
        specifications,
      } = req.body;
      
      // Validation
      if (!id || !platformId || !category || !name || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      if (partPrice === undefined || laborHours === undefined) {
        res.status(400).json({ error: 'Part price and labor hours required' });
        return;
      }
      
      // Check if ID already exists
      const existing = await prisma.option.findUnique({ where: { id } });
      if (existing) {
        res.status(409).json({ error: 'Option ID already exists' });
        return;
      }
      
      // Verify platform exists
      const platform = await prisma.platform.findUnique({ where: { id: platformId } });
      if (!platform) {
        res.status(404).json({ error: 'Platform not found' });
        return;
      }
      
      // Create option
      const option = await prisma.option.create({
        data: {
          id,
          platformId,
          category,
          name,
          description,
          partPrice: parseFloat(partPrice),
          laborHours: parseFloat(laborHours),
          assetPath: assetPath || '',
          specifications: specifications ? JSON.stringify(specifications) : '{}',
          createdBy: req.user?.userId,
        },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'CREATE',
          entityType: 'Option',
          entityId: option.id,
          changes: JSON.stringify(option),
          ipAddress: req.ip,
        },
      });
      
      res.status(201).json({ option });
    } catch (error) {
      console.error('Create option error:', error);
      res.status(500).json({ error: 'Failed to create option' });
    }
  }
);

/**
 * PUT /api/admin/options/:id
 * 
 * Update option (respects role permissions).
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user!.role as UserRole;
    
    // Get existing option
    const existing = await prisma.option.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Option not found' });
      return;
    }
    
    // Build update data based on role permissions
    const updateData: any = {};
    const requestedFields = Object.keys(req.body);
    
    for (const field of requestedFields) {
      // Check if user can edit this field
      if (
        userRole === UserRole.SUPER_ADMIN ||
        userRole === UserRole.ADMIN ||
        canEditField(userRole, field)
      ) {
        const value = req.body[field];
        
        // Handle special fields
        if (field === 'specifications') {
          updateData[field] = typeof value === 'string' ? value : JSON.stringify(value);
        } else if (field === 'partPrice' || field === 'laborHours') {
          updateData[field] = parseFloat(value);
        } else if (field !== 'id' && field !== 'platformId') {
          // Don't allow changing ID or platform
          updateData[field] = value;
        }
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      res.status(403).json({ error: 'No permissions to update requested fields' });
      return;
    }
    
    // Update option
    const option = await prisma.option.update({
      where: { id },
      data: updateData,
    });
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'UPDATE',
        entityType: 'Option',
        entityId: option.id,
        changes: JSON.stringify({ before: existing, after: option, updatedFields: Object.keys(updateData) }),
        ipAddress: req.ip,
      },
    });
    
    res.json({ option });
  } catch (error) {
    console.error('Update option error:', error);
    res.status(500).json({ error: 'Failed to update option' });
  }
});

/**
 * DELETE /api/admin/options/:id
 * 
 * Soft delete option (Admin+ only).
 */
router.delete(
  '/:id',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const existing = await prisma.option.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Option not found' });
        return;
      }
      
      // Soft delete
      const option = await prisma.option.update({
        where: { id },
        data: { isActive: false },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'DELETE',
          entityType: 'Option',
          entityId: option.id,
          changes: JSON.stringify({ deleted: true }),
          ipAddress: req.ip,
        },
      });
      
      res.json({ message: 'Option deleted', option });
    } catch (error) {
      console.error('Delete option error:', error);
      res.status(500).json({ error: 'Failed to delete option' });
    }
  }
);

/**
 * POST /api/admin/options/:id/rules
 * 
 * Add compatibility rule (Engineering+ only).
 */
router.post(
  '/:id/rules',
  requireRole([UserRole.ENGINEERING, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { relatedId, type, reason } = req.body;
      
      // Validation
      if (!relatedId || !type) {
        res.status(400).json({ error: 'Related option ID and type required' });
        return;
      }
      
      if (type !== 'REQUIRES' && type !== 'EXCLUDES') {
        res.status(400).json({ error: 'Type must be REQUIRES or EXCLUDES' });
        return;
      }
      
      // Verify both options exist
      const [option, related] = await Promise.all([
        prisma.option.findUnique({ where: { id } }),
        prisma.option.findUnique({ where: { id: relatedId } }),
      ]);
      
      if (!option || !related) {
        res.status(404).json({ error: 'Option not found' });
        return;
      }
      
      // Create rule
      const rule = await prisma.optionRelation.create({
        data: {
          optionId: id,
          relatedId,
          type,
          reason,
          createdBy: req.user?.userId,
        },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'CREATE',
          entityType: 'OptionRelation',
          entityId: rule.id,
          changes: JSON.stringify(rule),
          ipAddress: req.ip,
        },
      });
      
      res.status(201).json({ rule });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Rule already exists' });
        return;
      }
      console.error('Create rule error:', error);
      res.status(500).json({ error: 'Failed to create rule' });
    }
  }
);

/**
 * DELETE /api/admin/options/:id/rules/:ruleId
 * 
 * Delete compatibility rule (Engineering+ only).
 */
router.delete(
  '/:id/rules/:ruleId',
  requireRole([UserRole.ENGINEERING, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { ruleId } = req.params;
      
      const rule = await prisma.optionRelation.findUnique({ where: { id: ruleId } });
      if (!rule) {
        res.status(404).json({ error: 'Rule not found' });
        return;
      }
      
      await prisma.optionRelation.delete({ where: { id: ruleId } });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'DELETE',
          entityType: 'OptionRelation',
          entityId: ruleId,
          changes: JSON.stringify(rule),
          ipAddress: req.ip,
        },
      });
      
      res.json({ message: 'Rule deleted' });
    } catch (error) {
      console.error('Delete rule error:', error);
      res.status(500).json({ error: 'Failed to delete rule' });
    }
  }
);

export default router;
