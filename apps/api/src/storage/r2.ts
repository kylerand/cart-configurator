/**
 * Cloudflare R2 storage integration.
 * 
 * Provides upload, download, and delete functionality for GLB files
 * and other assets using Cloudflare R2 (S3-compatible storage).
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 Configuration from environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cart-configurator-assets';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional: Custom domain or R2.dev URL

// Validate configuration
const isConfigured = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);

if (!isConfigured) {
  console.warn('[R2] Missing R2 configuration. File uploads will not work.');
  console.warn('[R2] Required env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
}

/**
 * S3-compatible client for Cloudflare R2
 */
const r2Client = isConfigured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

/**
 * Allowed file types for upload
 */
const ALLOWED_TYPES: Record<string, string[]> = {
  models: ['.glb', '.gltf'],
  textures: ['.png', '.jpg', '.jpeg', '.webp'],
  images: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
};

/**
 * Maximum file sizes (in bytes)
 */
const MAX_FILE_SIZES: Record<string, number> = {
  models: 50 * 1024 * 1024, // 50MB for 3D models
  textures: 10 * 1024 * 1024, // 10MB for textures
  images: 5 * 1024 * 1024, // 5MB for images
};

/**
 * Upload result interface
 */
export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

/**
 * Generate a unique filename with timestamp
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')).replace(/[^a-zA-Z0-9-_]/g, '-');
  return `${baseName}-${timestamp}-${random}${ext}`;
}

/**
 * Validate file type and size
 */
export function validateFile(
  filename: string,
  size: number,
  category: keyof typeof ALLOWED_TYPES
): { valid: boolean; error?: string } {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  const allowedExts = ALLOWED_TYPES[category];
  const maxSize = MAX_FILE_SIZES[category];

  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExts.join(', ')}`,
    };
  }

  if (size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Upload a file to R2
 * 
 * @param buffer - File content as Buffer
 * @param filename - Original filename
 * @param category - File category (models, textures, images)
 * @param contentType - MIME type
 * @returns Upload result with URL
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  category: keyof typeof ALLOWED_TYPES,
  contentType: string
): Promise<UploadResult> {
  if (!r2Client) {
    return { success: false, error: 'R2 storage not configured' };
  }

  const validation = validateFile(filename, buffer.length, category);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const uniqueFilename = generateUniqueFilename(filename);
  const key = `${category}/${uniqueFilename}`;

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Generate public URL
    const url = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    return {
      success: true,
      key,
      url,
    };
  } catch (error) {
    console.error('[R2] Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete a file from R2
 * 
 * @param key - File key (path in bucket)
 * @returns Success status
 */
export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  if (!r2Client) {
    return { success: false, error: 'R2 storage not configured' };
  }

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );

    return { success: true };
  } catch (error) {
    console.error('[R2] Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Generate a presigned URL for direct upload (client-side upload)
 * 
 * @param filename - Original filename
 * @param category - File category
 * @param contentType - MIME type
 * @param expiresIn - URL expiration in seconds (default 1 hour)
 * @returns Presigned URL and file key
 */
export async function getPresignedUploadUrl(
  filename: string,
  category: keyof typeof ALLOWED_TYPES,
  contentType: string,
  expiresIn = 3600
): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  if (!r2Client) {
    return { success: false, error: 'R2 storage not configured' };
  }

  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  const allowedExts = ALLOWED_TYPES[category];

  if (!allowedExts.includes(ext)) {
    return {
      success: false,
      error: `Invalid file type. Allowed: ${allowedExts.join(', ')}`,
    };
  }

  const uniqueFilename = generateUniqueFilename(filename);
  const key = `${category}/${uniqueFilename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn });

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('[R2] Presigned URL error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate upload URL',
    };
  }
}

/**
 * Get the public URL for a file
 * 
 * @param key - File key (path in bucket)
 * @returns Public URL
 */
export function getPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`;
  }
  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

/**
 * Check if R2 is configured and ready
 */
export function isR2Configured(): boolean {
  return isConfigured;
}
