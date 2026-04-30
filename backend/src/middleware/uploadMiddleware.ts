import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { fromBuffer } from 'file-type';

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
});

/**
 * Parses a single `image` field from a multipart/form-data request,
 * then verifies the actual file content using magic bytes (file-type).
 * Rejects non-image payloads even if the Content-Type header was spoofed.
 */
export async function uploadMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  multerInstance.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: 'File exceeds the 10 MB size limit' });
      } else {
        res.status(400).json({ message: err.message });
      }
      return;
    }

    if (err) {
      res.status(400).json({ message: (err as Error).message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'An image file is required (field name: image)' });
      return;
    }

    // Verify actual content via magic bytes
    const detected = await fromBuffer(req.file.buffer);
    if (!detected || !ALLOWED_MIMES.has(detected.mime)) {
      res.status(400).json({
        message: 'File content does not match an allowed image format (JPEG, PNG, WebP, GIF)',
      });
      return;
    }

    // Normalise mimetype to the detected value (defends against spoofed Content-Type)
    req.file.mimetype = detected.mime;

    next();
  });
}
