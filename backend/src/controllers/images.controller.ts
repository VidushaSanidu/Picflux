import { Request, Response, NextFunction } from 'express';
import { uploadImage, getMyImages } from '../services/images.service';
import { HttpError } from '../utils/httpError';

export async function uploadHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'Authentication required');
    if (!req.file) throw new HttpError(400, 'Image file is required');

    const { title, location, tags: rawTags } = req.body as {
      title?: string;
      location?: string;
      tags?: string | string[];
    };

    // Normalise tags: accept comma-separated string or repeated fields
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
      'web',
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

export async function myImagesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'Authentication required');

    const images = await getMyImages(req.user.id);
    res.json(
      images.map((img) => ({
        id: img.id,
        status: img.status,
        title: img.title,
        location: img.location,
        tags: img.tags,
        mimeType: img.mimeType,
        sizeBytes: img.sizeBytes,
        createdAt: img.createdAt,
        rejectionReason: img.rejectionReason,
      })),
    );
  } catch (err) {
    next(err);
  }
}
