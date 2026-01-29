/**
 * Catalog API routes.
 * 
 * Provides read-only access to platforms, options, and materials from database.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const catalogRouter = Router();
const prisma = new PrismaClient();

/**
 * GET /api/catalog/platforms
 * Returns all active platforms.
 */
catalogRouter.get('/platforms', async (_req: Request, res: Response): Promise<void> => {
  try {
    const platforms = await prisma.platform.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        defaultAssetPath: true,
      },
    });
    
    res.json(platforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

/**
 * GET /api/catalog/platform
 * Returns the first active platform definition.
 */
catalogRouter.get('/platform', async (_req: Request, res: Response): Promise<void> => {
  try {
    const platform = await prisma.platform.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    
    if (!platform) {
      res.status(404).json({ error: 'No platform found' });
      return;
    }
    
    res.json({
      id: platform.id,
      name: platform.name,
      description: platform.description,
      basePrice: platform.basePrice,
      defaultAssetPath: platform.defaultAssetPath,
    });
  } catch (error) {
    console.error('Error fetching platform:', error);
    res.status(500).json({ error: 'Failed to fetch platform' });
  }
});

/**
 * GET /api/catalog/options
 * Returns all active configuration options.
 */
catalogRouter.get('/options', async (_req: Request, res: Response): Promise<void> => {
  try {
    const options = await prisma.option.findMany({
      where: { isActive: true },
      include: {
        requires: {
          select: {
            relatedId: true,
            type: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
    
    // Transform to match expected format
    const formatted = options.map(option => ({
      id: option.id,
      platformId: option.platformId,
      category: option.category,
      name: option.name,
      description: option.description,
      partPrice: option.partPrice,
      laborHours: option.laborHours,
      assetPath: option.assetPath,
      requires: option.requires
        .filter(r => r.type === 'REQUIRES')
        .map(r => r.relatedId),
      excludes: option.requires
        .filter(r => r.type === 'EXCLUDES')
        .map(r => r.relatedId),
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching options:', error);
    res.status(500).json({ error: 'Failed to fetch options' });
  }
});

/**
 * GET /api/catalog/materials
 * Returns all active materials.
 */
catalogRouter.get('/materials', async (_req: Request, res: Response): Promise<void> => {
  try {
    const materials = await prisma.material.findMany({
      where: { isActive: true },
      orderBy: [
        { zone: 'asc' },
        { name: 'asc' },
      ],
    });
    
    res.json(materials.map(m => ({
      id: m.id,
      zone: m.zone,
      type: m.type,
      name: m.name,
      description: m.description,
      color: m.color,
      finish: m.finish,
      priceMultiplier: m.priceMultiplier,
    })));
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

/**
 * GET /api/catalog/materials/:zone
 * Returns materials for a specific zone.
 */
catalogRouter.get('/materials/:zone', async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone } = req.params;
    
    const materials = await prisma.material.findMany({
      where: {
        zone: zone.toUpperCase(),
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
    
    res.json(materials.map(m => ({
      id: m.id,
      zone: m.zone,
      type: m.type,
      name: m.name,
      description: m.description,
      color: m.color,
      finish: m.finish,
      priceMultiplier: m.priceMultiplier,
    })));
  } catch (error) {
    console.error('Error fetching materials by zone:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});
