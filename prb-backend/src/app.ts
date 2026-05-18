import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jobsRoutes from './routes/jobs.routes';
import { HttpError } from './utils/httpError';

export function createApp(): express.Application {
  const app = express();

  // ─── CORS ─────────────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.PRB_ALLOWED_ORIGINS ?? '').split(',').map(o => o.trim()).filter(Boolean);
  app.use(
    cors({
      origin: allowedOrigins.length > 0
        ? (allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins)
        : false,
      credentials: true,
    }),
  );

  // ─── Body parsers ─────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── Routes ───────────────────────────────────────────────────────────────
  app.use('/jobs', jobsRoutes);

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
    console.error('[Unhandled error]', err);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
