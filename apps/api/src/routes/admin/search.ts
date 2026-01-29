/**
 * Global search API endpoint.
 * 
 * Search across platforms, options, materials, and users.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../auth/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

/**
 * GET /api/admin/search?q=query
 * 
 * Search across all entities.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      res.json({
        results: [],
        message: 'Query must be at least 2 characters',
      });
      return;
    }

    const query = q.trim().toLowerCase();
    const limit = 10; // Limit results per type

    // Search platforms
    const platforms = await prisma.platform.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
      },
    });

    // Search options
    const options = await prisma.option.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        partPrice: true,
      },
    });

    // Search materials
    const materials = await prisma.material.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { type: { contains: query } },
          { finish: { contains: query } },
          { zone: { contains: query } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        zone: true,
        type: true,
        finish: true,
        color: true,
      },
    });

    // Search users (Super Admin only)
    let users: any[] = [];
    if (req.user?.role === 'SUPER_ADMIN') {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: query } },
            { name: { contains: query } },
          ],
          isActive: true,
        },
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    }

    const results = {
      platforms: platforms.map((p: { id: string; name: string; description: string; basePrice: number }) => ({
        type: 'platform' as const,
        id: p.id,
        title: p.name,
        subtitle: `$${p.basePrice.toFixed(2)} - ${p.description.substring(0, 60)}${p.description.length > 60 ? '...' : ''}`,
        url: `/admin/platforms`,
      })),
      options: options.map((o: { id: string; name: string; category: string; partPrice: number }) => ({
        type: 'option' as const,
        id: o.id,
        title: o.name,
        subtitle: `${o.category} - $${o.partPrice.toFixed(2)}`,
        url: `/admin/options/${o.id}`,
      })),
      materials: materials.map((m: { id: string; name: string; zone: string; type: string; finish: string; color: string }) => ({
        type: 'material' as const,
        id: m.id,
        title: m.name,
        subtitle: `${m.zone} - ${m.type} (${m.finish})`,
        url: `/admin/materials`,
        color: m.color,
      })),
      users: users.map((u) => ({
        type: 'user' as const,
        id: u.id,
        title: u.name,
        subtitle: `${u.email} - ${u.role}`,
        url: `/admin/users`,
      })),
    };

    const totalResults = 
      results.platforms.length +
      results.options.length +
      results.materials.length +
      results.users.length;

    res.json({
      query,
      totalResults,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform search',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
