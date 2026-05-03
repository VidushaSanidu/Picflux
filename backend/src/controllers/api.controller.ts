import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getApprovedImages,
  getApprovedImageById,
  getDownloadUrl,
  uploadImage,
  getTopTags,
} from '../services/images.service';
import { getPresignedUrl } from '../services/r2.service';
import { HttpError } from '../utils/httpError';

// IP-based rate limiter for unauthenticated downloads (5 per day per IP)
export const guestDownloadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message: { message: 'Daily download limit of 5 reached. Resets in 24 hours.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !!req.user, // skip for authenticated users
});

export async function listImagesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { q, tags: rawTags, page: rawPage, limit: rawLimit } = req.query;

    const tags =
      typeof rawTags === 'string'
        ? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

    const page = rawPage ? parseInt(String(rawPage), 10) : 1;
    const limit = rawLimit ? parseInt(String(rawLimit), 10) : 20;

    if (isNaN(page) || page < 1) {
      throw new HttpError(400, 'Invalid page parameter');
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new HttpError(400, 'limit must be between 1 and 100');
    }

    const result = await getApprovedImages({
      q: typeof q === 'string' ? q : undefined,
      tags,
      page,
      limit,
    });

    const topTags = await getTopTags(5);

    const publicUrl = process.env.R2_PUBLIC_URL ?? null;

    res.json({
      data: result.images.map((img) => ({
        id: img.id,
        title: img.title,
        location: img.location,
        tags: img.tags,
        mimeType: img.mimeType,
        sizeBytes: img.sizeBytes,
        createdAt: img.createdAt,
        thumbnailUrl: publicUrl ? `${publicUrl}/${img.storageKey}` : null,
        uploader: { id: img.uploader.id, email: img.uploader.email },
      })),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / result.limit),
      },
      topTags,
    });
  } catch (err) {
    next(err);
  }
}

export async function getImageHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const image = await getApprovedImageById(req.params.id);
    const viewUrl = await getPresignedUrl(image.storageKey, 600);

    res.json({
      id: image.id,
      title: image.title,
      location: image.location,
      tags: image.tags,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      createdAt: image.createdAt,
      approvedAt: image.approvedAt,
      uploader: { id: image.uploader.id, email: image.uploader.email },
      viewUrl,
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadImageHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Determine if authenticated (web or API key)
    const userId = req.user?.id;
    const source = req.headers.authorization ? 'api' : 'web';

    const presignedUrl = await getDownloadUrl(req.params.id, userId, source);
    res.json({ downloadUrl: presignedUrl });
  } catch (err) {
    next(err);
  }
}

export async function apiUploadHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'Authentication required');
    if (!req.file) throw new HttpError(400, 'Image file is required (field name: image)');

    const { title, location, tags: rawTags } = req.body as {
      title?: string;
      location?: string;
      tags?: string | string[];
    };

    let tags: string[] = [];
    if (Array.isArray(rawTags)) {
      tags = rawTags.flatMap((t) => t.split(',').map((s) => s.trim())).filter(Boolean);
    } else if (typeof rawTags === 'string') {
      tags = rawTags.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const image = await uploadImage(
      req.user.id,
      {
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        title: title?.trim() || undefined,
        location: location?.trim() || undefined,
        tags,
      },
      'api',
    );

    res.status(201).json({
      id: image.id,
      status: image.status,
      title: image.title,
      location: image.location,
      tags: image.tags,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      createdAt: image.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

export async function popularTagsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tags = await getTopTags(5);
    res.json({ tags });
  } catch (err) {
    next(err);
  }
}
