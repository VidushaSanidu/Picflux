import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import imagesRoutes from './routes/images.routes';
import adminRoutes from './routes/admin.routes';
import apiKeysRoutes from './routes/apiKeys.routes';
import apiRoutes from './routes/api.routes';
import { HttpError } from './utils/httpError';

export function createApp(): express.Application {
  const app = express();

  // ─── Security / CORS ──────────────────────────────────────────────────────
  const allowedOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true, // required for httpOnly cookie exchange
    }),
  );

  // ─── Body parsers ─────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── Routes ───────────────────────────────────────────────────────────────
  app.use('/auth', authRoutes);
  app.use('/images', imagesRoutes);
  app.use('/admin', adminRoutes);
  app.use('/api-keys', apiKeysRoutes);
  app.use('/v1', apiRoutes);

  // ─── 404 ──────────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  // ─── Global error handler ─────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }

    // Multer errors (already handled in uploadMiddleware, but just in case)
    if (err instanceof Error && err.message) {
      console.error('[Unhandled error]', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    console.error('[Unknown error]', err);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
