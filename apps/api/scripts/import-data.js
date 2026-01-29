#!/usr/bin/env node

/**
 * Import data from JSON export into PostgreSQL database
 * Run this after migrating the schema to Supabase
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function importData() {
  const dataFile = process.argv[2] || path.join(__dirname, '../exports/latest.json');

  if (!fs.existsSync(dataFile)) {
    console.error(`❌ Data file not found: ${dataFile}`);
    console.error('Usage: node import-data.js [path-to-export.json]');
    process.exit(1);
  }

  console.log(`📦 Importing data from: ${dataFile}\n`);

  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    console.log('📊 Data to import:');
    console.log(`   Users:           ${data.users?.length || 0}`);
    console.log(`   Platforms:       ${data.platforms?.length || 0}`);
    console.log(`   Options:         ${data.options?.length || 0}`);
    console.log(`   Option Rules:    ${data.optionRelations?.length || 0}`);
    console.log(`   Materials:       ${data.materials?.length || 0}`);
    console.log(`   Configurations:  ${data.configurations?.length || 0}`);
    console.log(`   Quotes:          ${data.quotes?.length || 0}`);
    console.log(`   Audit Logs:      ${data.auditLogs?.length || 0}`);
    console.log(`   Pricing Settings: ${data.pricingSettings?.length || 0}`);
    console.log('');

    // Import in order (respecting foreign keys)
    console.log('⏳ Importing users...');
    for (const user of data.users || []) {
      await prisma.user.upsert({
        where: { id: user.id },
        create: user,
        update: user,
      });
    }
    console.log('✅ Users imported');

    console.log('⏳ Importing platforms...');
    for (const platform of data.platforms || []) {
      await prisma.platform.upsert({
        where: { id: platform.id },
        create: platform,
        update: platform,
      });
    }
    console.log('✅ Platforms imported');

    console.log('⏳ Importing options...');
    for (const option of data.options || []) {
      await prisma.option.upsert({
        where: { id: option.id },
        create: option,
        update: option,
      });
    }
    console.log('✅ Options imported');

    console.log('⏳ Importing option relations...');
    for (const relation of data.optionRelations || []) {
      await prisma.optionRelation.upsert({
        where: { id: relation.id },
        create: relation,
        update: relation,
      });
    }
    console.log('✅ Option relations imported');

    console.log('⏳ Importing materials...');
    for (const material of data.materials || []) {
      await prisma.material.upsert({
        where: { id: material.id },
        create: material,
        update: material,
      });
    }
    console.log('✅ Materials imported');

    console.log('⏳ Importing configurations...');
    for (const config of data.configurations || []) {
      await prisma.configuration.upsert({
        where: { id: config.id },
        create: config,
        update: config,
      });
    }
    console.log('✅ Configurations imported');

    console.log('⏳ Importing quotes...');
    for (const quote of data.quotes || []) {
      await prisma.quote.upsert({
        where: { id: quote.id },
        create: quote,
        update: quote,
      });
    }
    console.log('✅ Quotes imported');

    console.log('⏳ Importing audit logs...');
    for (const log of data.auditLogs || []) {
      await prisma.auditLog.upsert({
        where: { id: log.id },
        create: log,
        update: log,
      });
    }
    console.log('✅ Audit logs imported');

    console.log('⏳ Importing pricing settings...');
    for (const setting of data.pricingSettings || []) {
      await prisma.pricingSetting.upsert({
        where: { id: setting.id },
        create: setting,
        update: setting,
      });
    }
    console.log('✅ Pricing settings imported');

    console.log('\n🎉 All data imported successfully!\n');

  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
