/**
 * Express middleware for authentication and authorization.
 * 
 * Supports both legacy JWT and Supabase authentication based on 
 * the USE_SUPABASE_AUTH environment variable.
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  extractTokenFromHeader,
  verifyAccessToken,
  hasRole,
  UserRole,
  JWTPayload,
} from './authUtils.js';
import { verifySupabaseToken, SupabaseAuthUser } from './supabaseAuth.js';

const prisma = new PrismaClient();

// Check if Supabase auth is enabled
const USE_SUPABASE_AUTH = process.env.USE_SUPABASE_AUTH === 'true';

/**
 * Extends Express Request to include authenticated user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      supabaseUser?: SupabaseAuthUser;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT.
 * 
 * Supports both legacy JWT and Supabase JWT based on USE_SUPABASE_AUTH env var.
 * Extracts and verifies JWT token from Authorization header.
 * Attaches user info to request object.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    if (USE_SUPABASE_AUTH) {
      // Verify using Supabase
      const supabaseUser = await verifySupabaseToken(token);
      
      if (!supabaseUser) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
      
      // Check if user exists in local database and is active
      let localUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { supabaseUserId: supabaseUser.id },
            { email: supabaseUser.email.toLowerCase() },
          ],
        },
      });
      
      // If user doesn't exist locally, create them (first-time sync)
      if (!localUser) {
        localUser = await prisma.user.create({
          data: {
            supabaseUserId: supabaseUser.id,
            email: supabaseUser.email.toLowerCase(),
            name: supabaseUser.name,
            role: supabaseUser.role,
            passwordHash: '', // Not used with Supabase auth
          },
        });
      } else if (!localUser.supabaseUserId) {
        // Link existing user to Supabase account
        localUser = await prisma.user.update({
          where: { id: localUser.id },
          data: { supabaseUserId: supabaseUser.id },
        });
      }
      
      if (!localUser.isActive) {
        res.status(401).json({ error: 'User account is inactive' });
        return;
      }
      
      // Attach Supabase user to request
      req.supabaseUser = supabaseUser;
      
      // Set legacy user format for backwards compatibility
      req.user = {
        userId: localUser.id,
        email: supabaseUser.email,
        role: supabaseUser.role as UserRole,
      };
      
      next();
    } else {
      // Legacy JWT verification
      const payload = verifyAccessToken(token);
      
      if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token' });
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
      
      // Attach user to request
      req.user = payload;
      
      next();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to require specific roles.
 * 
 * Usage: requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])
 * 
 * @param allowedRoles - Array of roles that can access this route
 * @returns Express middleware function
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const userRole = req.user.role as UserRole;
    
    if (!hasRole(userRole, allowedRoles)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole,
      });
      return;
    }
    
    next();
  };
}

/**
 * Middleware for optional authentication.
 * 
 * Attaches user if token is valid, but doesn't fail if no token.
 * Useful for routes that behave differently based on auth status.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  
  next();
}
