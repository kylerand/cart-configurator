/**
 * Supabase authentication routes for admin panel.
 * 
 * Provides endpoints for Supabase-based authentication alongside
 * the existing JWT system during the migration period.
 * 
 * Endpoints:
 * - POST /api/admin/auth/supabase/login - Login with email/password
 * - POST /api/admin/auth/supabase/logout - Logout
 * - GET /api/admin/auth/supabase/me - Get current user
 * - POST /api/admin/auth/supabase/reset-password - Request password reset
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  signInWithPassword,
  sendPasswordReset,
  verifySupabaseToken,
} from '../../auth/supabaseAuth.js';
import { authenticateSupabase } from '../../auth/supabaseMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/admin/auth/supabase/login
 * 
 * Authenticate user with email/password via Supabase and return session.
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    
    // Sign in with Supabase
    const { session, user, error } = await signInWithPassword(email, password);
    
    if (error || !session || !user) {
      res.status(401).json({ error: error || 'Invalid credentials' });
      return;
    }
    
    // Ensure user exists in local database and is active
    let localUser = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseUserId: user.id },
          { email: email.toLowerCase() },
        ],
      },
    });
    
    if (!localUser) {
      // Create local user record
      localUser = await prisma.user.create({
        data: {
          supabaseUserId: user.id,
          email: user.email.toLowerCase(),
          name: user.name,
          role: user.role,
          passwordHash: null, // Not used with Supabase auth
        },
      });
    } else if (!localUser.supabaseUserId) {
      // Link existing user to Supabase account
      localUser = await prisma.user.update({
        where: { id: localUser.id },
        data: { supabaseUserId: user.id },
      });
    }
    
    if (!localUser.isActive) {
      res.status(401).json({ error: 'Account is inactive' });
      return;
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: localUser.id },
      data: { lastLoginAt: new Date() },
    });
    
    // Log login
    await prisma.auditLog.create({
      data: {
        userId: localUser.id,
        action: 'LOGIN_SUPABASE',
        entityType: 'User',
        entityId: localUser.id,
        changes: JSON.stringify({ email: localUser.email, authMethod: 'supabase' }),
        ipAddress: req.ip,
      },
    });
    
    res.json({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: {
        id: localUser.id,
        supabaseId: user.id,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
      },
    });
  } catch (error) {
    console.error('Supabase login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/admin/auth/supabase/me
 * 
 * Get current user info using Supabase token.
 */
router.get('/me', authenticateSupabase, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.supabaseUser) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        supabaseUserId: true,
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
    console.error('Get Supabase user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * POST /api/admin/auth/supabase/logout
 * 
 * Logout user (logs the action, client should clear tokens).
 */
router.post('/logout', authenticateSupabase, async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user) {
      // Log logout
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'LOGOUT_SUPABASE',
          entityType: 'User',
          entityId: req.user.userId,
          changes: JSON.stringify({ authMethod: 'supabase' }),
          ipAddress: req.ip,
        },
      });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Supabase logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * POST /api/admin/auth/supabase/reset-password
 * 
 * Request a password reset email.
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }
    
    // Check if user exists in local database
    const localUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    // Don't reveal if user exists or not for security
    if (!localUser || !localUser.isActive) {
      // Still return success to prevent email enumeration
      res.json({ message: 'If an account exists, a password reset email will be sent' });
      return;
    }
    
    // Send password reset via Supabase
    const { error } = await sendPasswordReset(email);
    
    if (error) {
      console.error('Password reset error:', error);
      // Don't reveal the specific error
      res.json({ message: 'If an account exists, a password reset email will be sent' });
      return;
    }
    
    // Log the password reset request
    await prisma.auditLog.create({
      data: {
        userId: localUser.id,
        action: 'PASSWORD_RESET_REQUEST',
        entityType: 'User',
        entityId: localUser.id,
        changes: JSON.stringify({ email: localUser.email }),
        ipAddress: req.ip,
      },
    });
    
    res.json({ message: 'If an account exists, a password reset email will be sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

/**
 * POST /api/admin/auth/supabase/verify-token
 * 
 * Verify a Supabase token and return user info.
 * Useful for validating tokens on the client side.
 */
router.post('/verify-token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ error: 'Token required' });
      return;
    }
    
    const user = await verifySupabaseToken(token);
    
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    
    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

export default router;
