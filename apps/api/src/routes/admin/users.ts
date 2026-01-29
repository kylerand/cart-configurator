/**
 * Admin user management routes.
 * 
 * CRUD operations for managing admin users (Super Admin only).
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../../auth/authMiddleware.js';
import { UserRole, hashPassword } from '../../auth/authUtils.js';

const router = Router();
const prisma = new PrismaClient();

// All user management routes require Super Admin
router.use(authenticate);

/**
 * GET /api/admin/users
 * 
 * List all users (Super Admin only).
 */
router.get(
  '/',
  requireRole([UserRole.SUPER_ADMIN]),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      res.json({ users });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ error: 'Failed to list users' });
    }
  }
);

/**
 * GET /api/admin/users/:id
 * 
 * Get single user (Super Admin only).
 */
router.get(
  '/:id',
  requireRole([UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
);

/**
 * POST /api/admin/users
 * 
 * Create new user (Super Admin only).
 */
router.post(
  '/',
  requireRole([UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name, password, role } = req.body;
      
      // Validation
      if (!email || !name || !password || !role) {
        res.status(400).json({ error: 'Email, name, password, and role are required' });
        return;
      }
      
      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }
      
      // Check if user already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({ error: 'User with this email already exists' });
        return;
      }
      
      // Hash password
      const passwordHash = await hashPassword(password);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'CREATE',
          entityType: 'User',
          entityId: user.id,
          changes: JSON.stringify({ email, name, role }),
          ipAddress: req.ip,
        },
      });
      
      res.status(201).json({ user });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

/**
 * PUT /api/admin/users/:id
 * 
 * Update user (Super Admin only).
 */
router.put(
  '/:id',
  requireRole([UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, role, isActive } = req.body;
      
      // Get existing user
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      // Build update data
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }
      
      // Update user
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'UPDATE',
          entityType: 'User',
          entityId: user.id,
          changes: JSON.stringify({ before: existing, after: user }),
          ipAddress: req.ip,
        },
      });
      
      res.json({ user });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

/**
 * PUT /api/admin/users/:id/password
 * 
 * Change user password (Super Admin only).
 */
router.put(
  '/:id/password',
  requireRole([UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      if (!password || password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }
      
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      // Hash new password
      const passwordHash = await hashPassword(password);
      
      // Update password
      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'UPDATE',
          entityType: 'User',
          entityId: id,
          changes: JSON.stringify({ action: 'password_changed' }),
          ipAddress: req.ip,
        },
      });
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

/**
 * DELETE /api/admin/users/:id
 * 
 * Deactivate user (Super Admin only).
 */
router.delete(
  '/:id',
  requireRole([UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Prevent deleting self
      if (id === req.user!.userId) {
        res.status(400).json({ error: 'Cannot deactivate your own account' });
        return;
      }
      
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      // Deactivate user
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'DELETE',
          entityType: 'User',
          entityId: id,
          changes: JSON.stringify({ deactivated: true }),
          ipAddress: req.ip,
        },
      });
      
      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  }
);

export default router;
