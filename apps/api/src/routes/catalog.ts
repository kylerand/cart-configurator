/**
 * Catalog API routes.
 * 
 * Provides read-only access to platforms, options, and materials.
 */

import { Router, Request, Response } from 'express';
import { PLATFORM, OPTIONS, MATERIALS } from '../data/seed.js';

export const catalogRouter = Router();

/**
 * GET /api/catalog/platform
 * Returns the base platform definition.
 */
catalogRouter.get('/platform', (_req: Request, res: Response) => {
  res.json(PLATFORM);
});

/**
 * GET /api/catalog/options
 * Returns all available configuration options.
 */
catalogRouter.get('/options', (_req: Request, res: Response) => {
  res.json(OPTIONS);
});

/**
 * GET /api/catalog/materials
 * Returns all available materials.
 */
catalogRouter.get('/materials', (_req: Request, res: Response) => {
  res.json(MATERIALS);
});

/**
 * GET /api/catalog/materials/:zone
 * Returns materials for a specific zone.
 */
catalogRouter.get('/materials/:zone', (req: Request, res: Response) => {
  const { zone } = req.params;
  const filtered = MATERIALS.filter(m => m.zone === zone);
  res.json(filtered);
});
