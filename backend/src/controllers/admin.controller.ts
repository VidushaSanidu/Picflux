import { Request, Response, NextFunction } from 'express';
import {
  getPendingImages,
  getPendingImageById,
  approveImage,
  rejectImage,
} from '../services/admin.service';
import { HttpError } from '../utils/httpError';

export async function listPendingHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const images = await getPendingImages();
    res.json(
      images.map((img) => ({
        id: img.id,
        title: img.title,
        tags: img.tags,
        mimeType: img.mimeType,
        sizeBytes: img.sizeBytes,
        createdAt: img.createdAt,
        uploader: { id: img.uploader.id, email: img.uploader.email },
      })),
    );
  } catch (err) {
    next(err);
  }
}

export async function getPendingHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const image = await getPendingImageById(req.params.id);
    res.json({
      id: image.id,
      title: image.title,
      location: image.location,
      tags: image.tags,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      createdAt: image.createdAt,
      uploader: { id: image.uploader.id, email: image.uploader.email },
      previewUrl: image.previewUrl,
    });
  } catch (err) {
    next(err);
  }
}

export async function approveHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'Authentication required');
    const image = await approveImage(req.params.id, req.user.id);
    res.json({ id: image.id, status: image.status, approvedAt: image.approvedAt });
  } catch (err) {
    next(err);
  }
}

export async function rejectHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'Authentication required');

    const { reason } = req.body as { reason?: unknown };
    const rejectionReason =
      typeof reason === 'string' && reason.trim() ? reason.trim() : undefined;

    const image = await rejectImage(req.params.id, req.user.id, rejectionReason);
    res.json({ id: image.id, status: image.status, rejectionReason: image.rejectionReason });
  } catch (err) {
    next(err);
  }
}
