#!/usr/bin/env npx tsx
/**
 * Set password for admin user in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setPassword() {
  // The Supabase user ID from the migration
  const userId = '40317d8e-035d-4fe9-81eb-8ecf2decd897';
  const newPassword = 'Admin123!';
  
  console.log('Setting password for admin user...');
  
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword
  });
  
  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
  
  console.log('✓ Password updated successfully!');
  console.log('  Email:', data.user.email);
  console.log('  New Password:', newPassword);
  console.log('\nYou can now log in with these credentials.');
}

setPassword();
