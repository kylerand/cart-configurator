#!/usr/bin/env npx tsx
/**
 * Supabase Auth Migration Script
 * 
 * This script migrates existing users from the custom JWT/bcrypt auth system
 * to Supabase Auth. For each user in the PostgreSQL User table:
 * 
 * 1. Creates a Supabase auth user via Admin API
 * 2. Sets user metadata (role, name)
 * 3. Sends password reset email (user must set new password)
 * 4. Updates User table with supabaseUserId
 * 5. Logs migration status
 * 
 * Usage:
 *   npx tsx scripts/migrate-to-supabase-auth.ts [--dry-run]
 * 
 * Options:
 *   --dry-run    Preview what would be migrated without making changes
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Check for dry-run flag
const DRY_RUN = process.argv.includes('--dry-run');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface MigrationResult {
  userId: string;
  email: string;
  success: boolean;
  supabaseUserId?: string;
  error?: string;
}

/**
 * Migrate a single user to Supabase Auth.
 */
async function migrateUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  supabaseUserId: string | null;
}): Promise<MigrationResult> {
  console.log(`\nMigrating user: ${user.email}`);
  
  // Skip if already migrated
  if (user.supabaseUserId) {
    console.log(`  ✓ Already migrated (Supabase ID: ${user.supabaseUserId})`);
    return {
      userId: user.id,
      email: user.email,
      success: true,
      supabaseUserId: user.supabaseUserId,
    };
  }
  
  if (DRY_RUN) {
    console.log('  [DRY RUN] Would create Supabase user and send password reset');
    return {
      userId: user.id,
      email: user.email,
      success: true,
    };
  }
  
  try {
    // Check if user already exists in Supabase (by email)
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === user.email.toLowerCase()
    );
    
    let supabaseUserId: string;
    
    if (existingUser) {
      console.log(`  → User exists in Supabase, linking...`);
      supabaseUserId = existingUser.id;
      
      // Update user metadata in Supabase
      await supabase.auth.admin.updateUserById(supabaseUserId, {
        user_metadata: {
          name: user.name,
          role: user.role,
          migratedFromLegacy: true,
          migratedAt: new Date().toISOString(),
        },
      });
    } else {
      // Create new Supabase user with a temporary random password
      // User will need to reset their password
      const tempPassword = crypto.randomUUID() + 'Aa1!';
      
      console.log(`  → Creating Supabase user...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true, // Mark as confirmed since they were already verified
        user_metadata: {
          name: user.name,
          role: user.role,
          migratedFromLegacy: true,
          migratedAt: new Date().toISOString(),
        },
      });
      
      if (error) {
        console.log(`  ✗ Failed to create Supabase user: ${error.message}`);
        return {
          userId: user.id,
          email: user.email,
          success: false,
          error: error.message,
        };
      }
      
      supabaseUserId = data.user.id;
      console.log(`  → Supabase user created: ${supabaseUserId}`);
    }
    
    // Update local User record with Supabase user ID
    await prisma.user.update({
      where: { id: user.id },
      data: { supabaseUserId },
    });
    console.log(`  → Updated local user record`);
    
    // Send password reset email
    // Note: Using the auth client with anon key for this
    const anonKey = process.env.SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY;
    const supabaseAuth = createClient(SUPABASE_URL!, anonKey!);
    await supabaseAuth.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password`,
    });
    console.log(`  → Password reset email sent`);
    
    console.log(`  ✓ Migration complete`);
    return {
      userId: user.id,
      email: user.email,
      success: true,
      supabaseUserId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.log(`  ✗ Migration failed: ${message}`);
    return {
      userId: user.id,
      email: user.email,
      success: false,
      error: message,
    };
  }
}

/**
 * Main migration function.
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Supabase Auth Migration Script');
  console.log('='.repeat(60));
  
  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made\n');
  }
  
  // Fetch all users that need migration
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      supabaseUserId: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  
  console.log(`\nFound ${users.length} active user(s) to process`);
  
  const alreadyMigrated = users.filter(u => u.supabaseUserId).length;
  const needsMigration = users.filter(u => !u.supabaseUserId).length;
  
  console.log(`  - Already migrated: ${alreadyMigrated}`);
  console.log(`  - Needs migration: ${needsMigration}`);
  
  if (needsMigration === 0) {
    console.log('\n✓ All users are already migrated!\n');
    return;
  }
  
  // Migrate each user
  const results: MigrationResult[] = [];
  
  for (const user of users) {
    const result = await migrateUser(user);
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\nTotal processed: ${results.length}`);
  console.log(`  ✓ Successful: ${successful}`);
  console.log(`  ✗ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed migrations:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.email}: ${r.error}`));
  }
  
  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN - Run without --dry-run to execute migration\n');
  } else if (successful > 0) {
    console.log('\n📧 Password reset emails have been sent to migrated users.');
    console.log('   Users must check their email and set a new password.\n');
  }
}

// Run the migration
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
