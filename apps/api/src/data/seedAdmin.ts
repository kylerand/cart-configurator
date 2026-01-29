/**
 * Seed script for creating initial admin user.
 * 
 * Run with: npm run seed:admin
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword, UserRole } from '../auth/authUtils';

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('🌱 Seeding admin user...');
  
  const adminEmail = 'admin@golfcarts.com';
  const adminPassword = 'admin123';  // Change this in production!
  
  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  
  if (existing) {
    console.log('✅ Admin user already exists');
    console.log(`Email: ${adminEmail}`);
    return;
  }
  
  // Hash password
  const passwordHash = await hashPassword(adminPassword);
  
  // Create admin user
  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: 'Admin User',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  
  console.log('✅ Admin user created successfully!');
  console.log('\nLogin credentials:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('\n⚠️  IMPORTANT: Change this password in production!\n');
}

seedAdmin()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding admin:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
