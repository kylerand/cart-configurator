/**
 * Supabase Authentication utilities for admin panel.
 * 
 * Provides Supabase client initialization, token verification,
 * and user management functions.
 */

import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole } from './authUtils.js';

/**
 * Environment variable validation
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log('[SupabaseAuth] SUPABASE_URL configured:', !!SUPABASE_URL);
console.log('[SupabaseAuth] SUPABASE_SERVICE_KEY configured:', !!SUPABASE_SERVICE_KEY);

if (!SUPABASE_URL) {
  console.warn('Warning: SUPABASE_URL not set. Supabase auth will not work.');
}

if (!SUPABASE_SERVICE_KEY) {
  console.warn('Warning: SUPABASE_SERVICE_KEY not set. Supabase admin operations will not work.');
}

/**
 * Supabase Admin Client (uses service key for admin operations)
 * 
 * Use this for:
 * - Creating/inviting users
 * - Updating user metadata
 * - Managing user roles
 * - Admin-level operations
 */
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * User metadata structure stored in Supabase auth.users
 */
export interface SupabaseUserMetadata {
  name: string;
  role: UserRole;
  invitedBy?: string;
  invitedAt?: string;
}

/**
 * Response from Supabase user verification
 */
export interface SupabaseAuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  supabaseUser: SupabaseUser;
}

/**
 * Verify a Supabase JWT token and return user info.
 * 
 * @param token - JWT token from Authorization header
 * @returns User info if valid, null if invalid
 */
export async function verifySupabaseToken(token: string): Promise<SupabaseAuthUser | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      console.error('Supabase token verification failed:', error?.message);
      return null;
    }
    
    const user = data.user;
    const metadata = user.user_metadata as SupabaseUserMetadata;
    
    return {
      id: user.id,
      email: user.email || '',
      name: metadata?.name || user.email?.split('@')[0] || 'Unknown',
      role: metadata?.role || UserRole.VIEWER,
      supabaseUser: user,
    };
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return null;
  }
}

/**
 * Create a new user via Supabase Admin API and send invitation email.
 * 
 * @param email - User's email address
 * @param name - User's display name
 * @param role - User's role in the system
 * @param invitedBy - ID of user sending the invitation
 * @returns Created user or error
 */
export async function inviteUser(
  email: string,
  name: string,
  role: UserRole,
  invitedBy?: string
): Promise<{ user: SupabaseUser | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        name,
        role,
        invitedBy,
        invitedAt: new Date().toISOString(),
      } as SupabaseUserMetadata,
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/set-password`,
    });
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to invite user';
    return { user: null, error: message };
  }
}

/**
 * Create a user with email/password directly (for migration purposes).
 * 
 * @param email - User's email address
 * @param password - User's password
 * @param metadata - User metadata (name, role, etc.)
 * @returns Created user or error
 */
export async function createUserWithPassword(
  email: string,
  password: string,
  metadata: SupabaseUserMetadata
): Promise<{ user: SupabaseUser | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return { user: null, error: message };
  }
}

/**
 * Update a user's role in Supabase.
 * 
 * @param userId - Supabase user ID
 * @param role - New role
 * @returns Updated user or error
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<{ user: SupabaseUser | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user role';
    return { user: null, error: message };
  }
}

/**
 * Get a user by email from Supabase.
 * 
 * @param email - User's email address
 * @returns User or null
 */
export async function getUserByEmail(email: string): Promise<SupabaseUser | null> {
  try {
    // List users with filter - note: this requires service key
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error || !data.users) {
      return null;
    }
    
    return data.users.find(u => u.email?.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Delete a user from Supabase Auth.
 * 
 * @param userId - Supabase user ID
 * @returns Success or error
 */
export async function deleteUser(userId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return { error: message };
  }
}

/**
 * Sign in a user with email and password.
 * Used for the new Supabase login endpoint.
 * 
 * @param email - User's email
 * @param password - User's password
 * @returns Session or error
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{
  session: { access_token: string; refresh_token: string } | null;
  user: SupabaseAuthUser | null;
  error: string | null;
}> {
  try {
    // For server-side auth, we need to create a new client instance
    // that can handle user authentication
    const supabaseAuth = createClient(
      SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error || !data.session || !data.user) {
      return { session: null, user: null, error: error?.message || 'Login failed' };
    }
    
    const metadata = data.user.user_metadata as SupabaseUserMetadata;
    
    return {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: metadata?.name || data.user.email?.split('@')[0] || 'Unknown',
        role: metadata?.role || UserRole.VIEWER,
        supabaseUser: data.user,
      },
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return { session: null, user: null, error: message };
  }
}

/**
 * Send a password reset email.
 * 
 * @param email - User's email address
 * @returns Success or error
 */
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  try {
    const supabaseAuth = createClient(
      SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password`,
    });
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send reset email';
    return { error: message };
  }
}
