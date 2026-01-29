#!/usr/bin/env node

/**
 * Create a fresh admin user for production
 * Run this after deployment to create login credentials
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@golfcarts.com';
  const password = 'admin123';
  const name = 'Admin User';

  console.log('Creating admin user...');

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('User already exists, updating password...');
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        isActive: true,
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✅ Password updated for:', email);
  } else {
    console.log('Creating new user...');
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✅ User created:', email);
  }

  console.log('\nLogin credentials:');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\nYou can now log in at: https://cart-configurator-web.vercel.app/admin');

  await prisma.$disconnect();
}

createAdmin().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
