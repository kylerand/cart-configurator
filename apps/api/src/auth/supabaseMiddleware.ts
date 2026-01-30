/**
 * Supabase authentication middleware for Express.
 * 
 * Validates Supabase JWT tokens and attaches user info to requests.
 * Can be used alongside or instead of the existing JWT middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifySupabaseToken, SupabaseAuthUser } from './supabaseAuth.js';
import { UserRole, hasRole } from './authUtils.js';

const prisma = new PrismaClient();

/**
 * Extends Express Request to include Supabase user.
 */
declare global {
  namespace Express {
    interface Request {
      supabaseUser?: SupabaseAuthUser;
    }
  }
}

/**
 * Extract token from Authorization header.
 * 
 * @param header - Authorization header value
 * @returns Token or null
 */
function extractToken(header?: string): string | null {
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7);
}

/**
 * Middleware to authenticate requests using Supabase JWT.
 * 
 * Extracts and verifies Supabase JWT token from Authorization header.
 * Attaches user info to request object.
 * 
 * Also syncs with local User table to ensure user exists locally.
 */
export async function authenticateSupabase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
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
    
    // Attach both Supabase user and legacy user format to request
    req.supabaseUser = supabaseUser;
    
    // Also set legacy user format for backwards compatibility
    req.user = {
      userId: localUser.id,
      email: supabaseUser.email,
      role: supabaseUser.role as UserRole,
    };
    
    next();
  } catch (error) {
    console.error('Supabase authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to require specific roles (works with Supabase auth).
 * 
 * Usage: requireSupabaseRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])
 * 
 * @param allowedRoles - Array of roles that can access this route
 * @returns Express middleware function
 */
export function requireSupabaseRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.supabaseUser) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const userRole = req.supabaseUser.role;
    
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
 * Optional Supabase authentication middleware.
 * 
 * Attempts to authenticate but continues even if no token.
 * Useful for routes that work differently for authenticated users.
 */
export async function optionalSupabaseAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const supabaseUser = await verifySupabaseToken(token);
      
      if (supabaseUser) {
        req.supabaseUser = supabaseUser;
        
        // Set legacy user format too
        const localUser = await prisma.user.findFirst({
          where: { 
            OR: [
              { supabaseUserId: supabaseUser.id },
              { email: supabaseUser.email.toLowerCase() },
            ],
          },
        });
        
        if (localUser) {
          req.user = {
            userId: localUser.id,
            email: supabaseUser.email,
            role: supabaseUser.role as UserRole,
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}
