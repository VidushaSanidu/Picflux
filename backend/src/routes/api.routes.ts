import { Router } from 'express';
import {
  listImagesHandler,
  getImageHandler,
  downloadImageHandler,
  apiUploadHandler,
  popularTagsHandler,
  guestDownloadLimiter,
} from '../controllers/api.controller';
import { apiKeyAuth, optionalApiKeyAuth } from '../middleware/apiKeyAuth';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = Router();

// Public browsing — no auth required
router.get('/images', listImagesHandler);
router.get('/tags/popular', popularTagsHandler);
router.get('/images/:id', getImageHandler);

// Download — optional auth; IP rate-limit for guests, UsageCounter for authenticated users
router.get(
  '/images/:id/download',
  optionalApiKeyAuth,
  guestDownloadLimiter,
  downloadImageHandler,
);

// API upload — requires a valid API key
router.post('/images', apiKeyAuth, uploadMiddleware, apiUploadHandler);

export default router;
