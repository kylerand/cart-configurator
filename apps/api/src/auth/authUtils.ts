/**
 * Authentication utilities for admin panel.
 * 
 * Provides JWT token generation/verification and password hashing.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * JWT secret (in production, use environment variable)
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';

/**
 * Token expiration times
 */
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

/**
 * User role enumeration
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  ENGINEERING = 'ENGINEERING',
  PRODUCTION = 'PRODUCTION',
  VIEWER = 'VIEWER',
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Token pair (access + refresh)
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Hashes a password using bcrypt.
 * 
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifies a password against a hash.
 * 
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns true if match, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates an access token.
 * 
 * @param payload - JWT payload
 * @returns JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generates a refresh token.
 * 
 * @param payload - JWT payload
 * @returns JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Generates both access and refresh tokens.
 * 
 * @param payload - JWT payload
 * @returns Token pair
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verifies an access token.
 * 
 * @param token - JWT token
 * @returns Decoded payload or null if invalid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verifies a refresh token.
 * 
 * @param token - JWT refresh token
 * @returns Decoded payload or null if invalid
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extracts token from Authorization header.
 * 
 * @param authHeader - Authorization header value
 * @returns Token or null
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Checks if user has required role.
 * 
 * @param userRole - User's role
 * @param requiredRoles - Required roles
 * @returns true if authorized
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  // Super admin can do everything
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }
  
  return requiredRoles.includes(userRole);
}

/**
 * Checks if user can edit specific fields based on role.
 * 
 * @param userRole - User's role
 * @param fieldName - Field being edited
 * @returns true if allowed
 */
export function canEditField(userRole: UserRole, fieldName: string): boolean {
  // Super admin and admin can edit everything
  if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
    return true;
  }
  
  // Field-level permissions by role
  const permissions: Record<string, UserRole[]> = {
    // Pricing fields
    'partPrice': [UserRole.SALES, UserRole.PRODUCTION],
    'laborHours': [UserRole.PRODUCTION, UserRole.ENGINEERING],
    'priceMultiplier': [UserRole.SALES],
    
    // Description fields
    'name': [UserRole.SALES],
    'description': [UserRole.SALES],
    
    // Technical fields
    'specifications': [UserRole.ENGINEERING],
    'requires': [UserRole.ENGINEERING],
    'excludes': [UserRole.ENGINEERING],
    'assetPath': [UserRole.ENGINEERING],
    
    // Production fields
    'leadTime': [UserRole.PRODUCTION],
    'stockStatus': [UserRole.PRODUCTION],
  };
  
  const allowedRoles = permissions[fieldName];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}
