/**
 * Admin authentication routes.
 * 
 * Handles login, logout, token refresh, and user info.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  verifyPassword,
  generateTokenPair,
  verifyRefreshToken,
  UserRole,
} from '../../auth/authUtils.js';
import { authenticate } from '../../auth/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/admin/auth/login
 * 
 * Authenticate user and return JWT tokens.
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    if (!user.isActive) {
      res.status(401).json({ error: 'Account is inactive' });
      return;
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    // Log login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        changes: JSON.stringify({ email: user.email }),
        ipAddress: req.ip,
      },
    });
    
    res.json({
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/admin/auth/refresh
 * 
 * Refresh access token using refresh token.
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }
    
    const payload = verifyRefreshToken(refreshToken);
    
    if (!payload) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }
    
    // Generate new token pair
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });
    
    res.json(tokens);
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * GET /api/admin/auth/me
 * 
 * Get current user info (requires authentication).
 */
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * POST /api/admin/auth/logout
 * 
 * Logout user (client should delete tokens).
 */
router.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user) {
      // Log logout
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'LOGOUT',
          entityType: 'User',
          entityId: req.user.userId,
          changes: '{}',
          ipAddress: req.ip,
        },
      });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
