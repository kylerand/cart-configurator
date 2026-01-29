/**
 * Admin material management routes.
 * 
 * CRUD operations for materials and finishes.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../../auth/authMiddleware.js';
import { UserRole } from '../../auth/authUtils.js';

const router = Router();
const prisma = new PrismaClient();

// All material routes require authentication
router.use(authenticate);

/**
 * GET /api/admin/materials
 * 
 * List all materials with filters.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone, type, isActive } = req.query;
    
    const where: any = {};
    if (zone) where.zone = zone;
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    const materials = await prisma.material.findMany({
      where,
      orderBy: [{ zone: 'asc' }, { name: 'asc' }],
    });
    
    res.json({ materials });
  } catch (error) {
    console.error('List materials error:', error);
    res.status(500).json({ error: 'Failed to list materials' });
  }
});

/**
 * GET /api/admin/materials/:id
 * 
 * Get single material by ID.
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const material = await prisma.material.findUnique({
      where: { id },
    });
    
    if (!material) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }
    
    res.json({ material });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ error: 'Failed to get material' });
  }
});

/**
 * POST /api/admin/materials
 * 
 * Create new material (Admin/Sales only).
 */
router.post(
  '/',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SALES]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        id,
        zone,
        type,
        name,
        description,
        color,
        finish,
        priceMultiplier,
        specifications,
      } = req.body;
      
      // Validation
      if (!id || !zone || !type || !name || !description || !color || !finish) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      if (priceMultiplier === undefined) {
        res.status(400).json({ error: 'Price multiplier required' });
        return;
      }
      
      // Validate color format (hex)
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        res.status(400).json({ error: 'Color must be valid hex format (#RRGGBB)' });
        return;
      }
      
      // Check if ID already exists
      const existing = await prisma.material.findUnique({ where: { id } });
      if (existing) {
        res.status(409).json({ error: 'Material ID already exists' });
        return;
      }
      
      // Create material
      const material = await prisma.material.create({
        data: {
          id,
          zone,
          type,
          name,
          description,
          color: color.toUpperCase(),
          finish,
          priceMultiplier: parseFloat(priceMultiplier),
          specifications: specifications ? JSON.stringify(specifications) : '{}',
          createdBy: req.user?.userId,
        },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'CREATE',
          entityType: 'Material',
          entityId: material.id,
          changes: JSON.stringify(material),
          ipAddress: req.ip,
        },
      });
      
      res.status(201).json({ material });
    } catch (error) {
      console.error('Create material error:', error);
      res.status(500).json({ error: 'Failed to create material' });
    }
  }
);

/**
 * PUT /api/admin/materials/:id
 * 
 * Update material (Admin/Sales only).
 */
router.put(
  '/:id',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SALES]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Get existing material
      const existing = await prisma.material.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }
      
      // Build update data
      const updateData: any = {};
      const { name, description, color, finish, priceMultiplier, specifications, isActive } = req.body;
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (color !== undefined) {
        // Validate hex format
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
          res.status(400).json({ error: 'Color must be valid hex format (#RRGGBB)' });
          return;
        }
        updateData.color = color.toUpperCase();
      }
      if (finish !== undefined) updateData.finish = finish;
      if (priceMultiplier !== undefined) updateData.priceMultiplier = parseFloat(priceMultiplier);
      if (specifications !== undefined) updateData.specifications = JSON.stringify(specifications);
      if (isActive !== undefined) updateData.isActive = isActive;
      
      // Update material
      const material = await prisma.material.update({
        where: { id },
        data: updateData,
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'UPDATE',
          entityType: 'Material',
          entityId: material.id,
          changes: JSON.stringify({ before: existing, after: material }),
          ipAddress: req.ip,
        },
      });
      
      res.json({ material });
    } catch (error) {
      console.error('Update material error:', error);
      res.status(500).json({ error: 'Failed to update material' });
    }
  }
);

/**
 * DELETE /api/admin/materials/:id
 * 
 * Soft delete material (Admin+ only).
 */
router.delete(
  '/:id',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const existing = await prisma.material.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }
      
      // Soft delete
      const material = await prisma.material.update({
        where: { id },
        data: { isActive: false },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'DELETE',
          entityType: 'Material',
          entityId: material.id,
          changes: JSON.stringify({ deleted: true }),
          ipAddress: req.ip,
        },
      });
      
      res.json({ message: 'Material deleted', material });
    } catch (error) {
      console.error('Delete material error:', error);
      res.status(500).json({ error: 'Failed to delete material' });
    }
  }
);

export default router;
