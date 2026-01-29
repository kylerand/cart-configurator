#!/usr/bin/env node

/**
 * Export data from SQLite to JSON for migration to PostgreSQL
 * This ensures no data loss during the migration
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function exportData() {
  console.log('📦 Starting data export from SQLite...\n');

  try {
    // Export all data
    const data = {
      exportedAt: new Date().toISOString(),
      users: await prisma.user.findMany(),
      platforms: await prisma.platform.findMany(),
      options: await prisma.option.findMany(),
      optionRelations: await prisma.optionRelation.findMany(),
      materials: await prisma.material.findMany(),
      configurations: await prisma.configuration.findMany(),
      quotes: await prisma.quote.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
      pricingSettings: await prisma.pricingSetting.findMany(),
    };

    // Calculate counts
    const counts = {
      users: data.users.length,
      platforms: data.platforms.length,
      options: data.options.length,
      optionRelations: data.optionRelations.length,
      materials: data.materials.length,
      configurations: data.configurations.length,
      quotes: data.quotes.length,
      auditLogs: data.auditLogs.length,
      pricingSettings: data.pricingSettings.length,
    };

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Write to file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `data-export-${timestamp}.json`;
    const filepath = path.join(exportsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    console.log('✅ Data export completed successfully!\n');
    console.log('📊 Export summary:');
    console.log(`   Users:           ${counts.users}`);
    console.log(`   Platforms:       ${counts.platforms}`);
    console.log(`   Options:         ${counts.options}`);
    console.log(`   Option Rules:    ${counts.optionRelations}`);
    console.log(`   Materials:       ${counts.materials}`);
    console.log(`   Configurations:  ${counts.configurations}`);
    console.log(`   Quotes:          ${counts.quotes}`);
    console.log(`   Audit Logs:      ${counts.auditLogs}`);
    console.log(`   Pricing Settings: ${counts.pricingSettings}`);
    console.log(`\n💾 Saved to: ${filepath}\n`);

    // Also create a latest.json symlink/copy
    const latestPath = path.join(exportsDir, 'latest.json');
    fs.copyFileSync(filepath, latestPath);
    console.log(`📎 Also saved as: ${latestPath}\n`);

  } catch (error) {
    console.error('❌ Error during export:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
