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
 * Validates a file buffer using magic bytes.
 * Returns the detected MIME type, or null if invalid.
 */
async function validateMagicBytes(file: Express.Multer.File): Promise<string | null> {
  const detected = await fromBuffer(file.buffer);
  if (!detected || !ALLOWED_MIMES.has(detected.mime)) return null;
  return detected.mime;
}

/**
 * Parses a required single `image` field from a multipart/form-data request,
 * then verifies the actual file content using magic bytes.
 */
export async function requireImageUpload(
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

    const detectedMime = await validateMagicBytes(req.file);
    if (!detectedMime) {
      res.status(400).json({
        message: 'File content does not match an allowed image format (JPEG, PNG, WebP, GIF)',
      });
      return;
    }

    req.file.mimetype = detectedMime;
    next();
  });
}

/**
 * Parses an optional single `processedImage` field from a multipart/form-data request.
 * If a file is present, validates its content using magic bytes.
 * The request proceeds even if no file is provided.
 */
export async function optionalProcessedImageUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  multerInstance.single('processedImage')(req, res, async (err) => {
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

    if (req.file) {
      const detectedMime = await validateMagicBytes(req.file);
      if (!detectedMime) {
        res.status(400).json({
          message: 'File content does not match an allowed image format (JPEG, PNG, WebP, GIF)',
        });
        return;
      }
      req.file.mimetype = detectedMime;
    }

    next();
  });
}

/**
 * Parses optional `processedImage` (single) and `exampleImages` (up to 20) fields
 * from a multipart/form-data PATCH request, validating each file via magic bytes.
 * The request proceeds even if no files are provided.
 */
export async function optionalJobUpdateUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  multerInstance.fields([
    { name: 'processedImage', maxCount: 1 },
    { name: 'exampleImages', maxCount: 20 },
    { name: 'perturbedExampleImages', maxCount: 20 },
  ])(req, res, async (err) => {
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

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const processedImage = files?.['processedImage']?.[0];
    if (processedImage) {
      const detectedMime = await validateMagicBytes(processedImage);
      if (!detectedMime) {
        res.status(400).json({
          message: 'processedImage content does not match an allowed image format (JPEG, PNG, WebP, GIF)',
        });
        return;
      }
      processedImage.mimetype = detectedMime;
    }

    const exampleImages = files?.['exampleImages'] ?? [];
    for (const file of exampleImages) {
      const detectedMime = await validateMagicBytes(file);
      if (!detectedMime) {
        res.status(400).json({
          message: 'One or more exampleImages do not match an allowed image format (JPEG, PNG, WebP, GIF)',
        });
        return;
      }
      file.mimetype = detectedMime;
    }

    const perturbedExampleImages = files?.['perturbedExampleImages'] ?? [];
    for (const file of perturbedExampleImages) {
      const detectedMime = await validateMagicBytes(file);
      if (!detectedMime) {
        res.status(400).json({
          message: 'One or more perturbedExampleImages do not match an allowed image format (JPEG, PNG, WebP, GIF)',
        });
        return;
      }
      file.mimetype = detectedMime;
    }

    next();
  });
}
