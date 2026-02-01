/**
 * Admin platform management routes.
 * 
 * CRUD operations for cart platforms.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../../auth/authMiddleware.js';
import { UserRole } from '../../auth/authUtils.js';

const router = Router();
const prisma = new PrismaClient();

// All platform routes require authentication
router.use(authenticate);

/**
 * GET /api/admin/platforms
 * 
 * List all platforms.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive } = req.query;
    
    const platforms = await prisma.platform.findMany({
      where: isActive !== undefined ? { isActive: isActive === 'true' } : undefined,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { options: true },
        },
      },
    });
    
    res.json({ platforms });
  } catch (error) {
    console.error('List platforms error:', error);
    res.status(500).json({ error: 'Failed to list platforms' });
  }
});

/**
 * GET /api/admin/platforms/:id
 * 
 * Get single platform by ID.
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const platform = await prisma.platform.findUnique({
      where: { id },
      include: {
        options: {
          select: {
            id: true,
            name: true,
            category: true,
            isActive: true,
          },
        },
      },
    });
    
    if (!platform) {
      res.status(404).json({ error: 'Platform not found' });
      return;
    }
    
    res.json({ platform });
  } catch (error) {
    console.error('Get platform error:', error);
    res.status(500).json({ error: 'Failed to get platform' });
  }
});

/**
 * POST /api/admin/platforms
 * 
 * Create new platform (Admin+ only).
 */
router.post(
  '/',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, name, description, basePrice, defaultAssetPath, specifications, subassemblyOffsets } = req.body;
      
      // Validation
      if (!id || !name || !description || basePrice === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      // Check if ID already exists
      const existing = await prisma.platform.findUnique({ where: { id } });
      if (existing) {
        res.status(409).json({ error: 'Platform ID already exists' });
        return;
      }
      
      // Create platform
      const platform = await prisma.platform.create({
        data: {
          id,
          name,
          description,
          basePrice: parseFloat(basePrice),
          defaultAssetPath: defaultAssetPath || '',
          specifications: specifications ? JSON.stringify(specifications) : '{}',
          subassemblyOffsets: subassemblyOffsets ? JSON.stringify(subassemblyOffsets) : '{}',
          createdBy: req.user?.userId,
        },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'CREATE',
          entityType: 'Platform',
          entityId: platform.id,
          changes: JSON.stringify(platform),
          ipAddress: req.ip,
        },
      });
      
      res.status(201).json({ platform });
    } catch (error) {
      console.error('Create platform error:', error);
      res.status(500).json({ error: 'Failed to create platform' });
    }
  }
);

/**
 * PUT /api/admin/platforms/:id
 * 
 * Update platform (Admin+ only).
 */
router.put(
  '/:id',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, basePrice, defaultAssetPath, specifications, subassemblyOffsets, isActive } = req.body;
      
      // Get existing platform
      const existing = await prisma.platform.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Platform not found' });
        return;
      }
      
      // Build update data
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
      if (defaultAssetPath !== undefined) updateData.defaultAssetPath = defaultAssetPath;
      if (specifications !== undefined) updateData.specifications = JSON.stringify(specifications);
      if (subassemblyOffsets !== undefined) updateData.subassemblyOffsets = JSON.stringify(subassemblyOffsets);
      if (isActive !== undefined) updateData.isActive = isActive;
      
      // Update platform
      const platform = await prisma.platform.update({
        where: { id },
        data: updateData,
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'UPDATE',
          entityType: 'Platform',
          entityId: platform.id,
          changes: JSON.stringify({ before: existing, after: platform }),
          ipAddress: req.ip,
        },
      });
      
      res.json({ platform });
    } catch (error) {
      console.error('Update platform error:', error);
      res.status(500).json({ error: 'Failed to update platform' });
    }
  }
);

/**
 * DELETE /api/admin/platforms/:id
 * 
 * Soft delete platform (Super Admin only).
 */
router.delete(
  '/:id',
  requireRole([UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const existing = await prisma.platform.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Platform not found' });
        return;
      }
      
      // Soft delete by marking inactive
      const platform = await prisma.platform.update({
        where: { id },
        data: { isActive: false },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'DELETE',
          entityType: 'Platform',
          entityId: platform.id,
          changes: JSON.stringify({ deleted: true }),
          ipAddress: req.ip,
        },
      });
      
      res.json({ message: 'Platform deleted', platform });
    } catch (error) {
      console.error('Delete platform error:', error);
      res.status(500).json({ error: 'Failed to delete platform' });
    }
  }
);

export default router;
