/**
 * Configuration API routes.
 * 
 * Handles saving and retrieving cart configurations.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CartConfiguration } from '@cart-configurator/types';

export function configurationRouter(prisma: PrismaClient): Router {
  const router = Router();

  /**
   * POST /api/configurations
   * Saves a new configuration or updates an existing one.
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const config: CartConfiguration = req.body;

      const saved = await prisma.configuration.upsert({
        where: { id: config.id },
        update: {
          platformId: config.platformId,
          selectedOptions: JSON.stringify(config.selectedOptions),
          materialSelections: JSON.stringify(config.materialSelections),
          buildNotes: config.buildNotes,
          updatedAt: config.updatedAt
        },
        create: {
          id: config.id,
          platformId: config.platformId,
          selectedOptions: JSON.stringify(config.selectedOptions),
          materialSelections: JSON.stringify(config.materialSelections),
          buildNotes: config.buildNotes,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt
        }
      });

      res.json({ success: true, configurationId: saved.id });
    } catch (error) {
      console.error('Error saving configuration:', error);
      res.status(500).json({ error: 'Failed to save configuration' });
    }
  });

  /**
   * GET /api/configurations/:id
   * Retrieves a saved configuration by ID.
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const saved = await prisma.configuration.findUnique({
        where: { id }
      });

      if (!saved) {
        res.status(404).json({ error: 'Configuration not found' });
        return;
      }

      const config: CartConfiguration = {
        id: saved.id,
        platformId: saved.platformId,
        selectedOptions: JSON.parse(saved.selectedOptions),
        materialSelections: JSON.parse(saved.materialSelections),
        buildNotes: saved.buildNotes,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt
      };

      res.json(config);
    } catch (error) {
      console.error('Error retrieving configuration:', error);
      res.status(500).json({ error: 'Failed to retrieve configuration' });
    }
  });

  return router;
}
