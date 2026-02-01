/**
 * File upload routes for admin panel.
 * 
 * Handles file uploads to Cloudflare R2 storage for:
 * - 3D models (.glb, .gltf)
 * - Textures (.png, .jpg, .webp)
 * - Images (.png, .jpg, .webp, .svg)
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../../auth/authMiddleware.js';
import { UserRole } from '../../auth/authUtils.js';
import { 
  uploadFile, 
  deleteFile, 
  getPresignedUploadUrl, 
  isR2Configured,
  validateFile 
} from '../../storage/r2.js';

const router = Router();

// Configure multer for memory storage (files go to buffer, then to R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// All upload routes require authentication
router.use(authenticate);

/**
 * GET /api/admin/uploads/status
 * 
 * Check if file uploads are configured and available.
 */
router.get('/status', (_req: Request, res: Response): void => {
  res.json({
    configured: isR2Configured(),
    allowedTypes: {
      models: ['.glb', '.gltf'],
      textures: ['.png', '.jpg', '.jpeg', '.webp'],
      images: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
    },
    maxSizes: {
      models: '50MB',
      textures: '10MB',
      images: '5MB',
    },
  });
});

/**
 * POST /api/admin/uploads/model
 * 
 * Upload a 3D model file (.glb, .gltf).
 * Returns the public URL to use in assetPath fields.
 */
router.post(
  '/model',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ENGINEERING]),
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const result = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'models',
        req.file.mimetype || 'model/gltf-binary'
      );

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        success: true,
        url: result.url,
        key: result.key,
        filename: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

/**
 * POST /api/admin/uploads/texture
 * 
 * Upload a texture file (.png, .jpg, .webp).
 */
router.post(
  '/texture',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ENGINEERING]),
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const result = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'textures',
        req.file.mimetype || 'image/png'
      );

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        success: true,
        url: result.url,
        key: result.key,
        filename: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

/**
 * POST /api/admin/uploads/image
 * 
 * Upload a general image file (.png, .jpg, .webp, .svg).
 */
router.post(
  '/image',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const result = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        'images',
        req.file.mimetype || 'image/png'
      );

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        success: true,
        url: result.url,
        key: result.key,
        filename: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

/**
 * POST /api/admin/uploads/presigned
 * 
 * Get a presigned URL for direct client-side upload.
 * Useful for large files to avoid going through the server.
 */
router.post(
  '/presigned',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ENGINEERING]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename, category, contentType } = req.body;

      if (!filename || !category || !contentType) {
        res.status(400).json({ 
          error: 'Missing required fields: filename, category, contentType' 
        });
        return;
      }

      if (!['models', 'textures', 'images'].includes(category)) {
        res.status(400).json({ error: 'Invalid category' });
        return;
      }

      const result = await getPresignedUploadUrl(filename, category, contentType);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        success: true,
        uploadUrl: result.url,
        key: result.key,
        expiresIn: 3600,
      });
    } catch (error) {
      console.error('Presigned URL error:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  }
);

/**
 * DELETE /api/admin/uploads/:key
 * 
 * Delete a file from storage.
 * Key should be URL-encoded.
 */
router.delete(
  '/:key(*)',
  requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({ error: 'No file key provided' });
        return;
      }

      const result = await deleteFile(key);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ success: true, message: 'File deleted' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Delete failed' });
    }
  }
);

/**
 * POST /api/admin/uploads/validate
 * 
 * Validate a file before upload (check type and size).
 */
router.post('/validate', (req: Request, res: Response): void => {
  const { filename, size, category } = req.body;

  if (!filename || !size || !category) {
    res.status(400).json({ 
      error: 'Missing required fields: filename, size, category' 
    });
    return;
  }

  if (!['models', 'textures', 'images'].includes(category)) {
    res.status(400).json({ error: 'Invalid category' });
    return;
  }

  const result = validateFile(filename, size, category);
  
  res.json({
    valid: result.valid,
    error: result.error,
  });
});

export default router;
