import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { PrbUserRole } from '../entities/User';

/**
 * Accepts either:
 *   1. A valid `Authorization: Bearer <PRB_API_KEY>` header (for the ML processing service), or
 *   2. A valid JWT cookie belonging to an admin user.
 *
 * Preserves backwards-compatibility with the ML processing service while
 * also allowing admin users to access these endpoints via the browser.
 */
export function apiKeyOrAdmin(req: Request, res: Response, next: NextFunction): void {
  // ── Try API key first ────────────────────────────────────────────────────
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7);
    const expectedKey = process.env.PRB_API_KEY;

    if (!expectedKey) {
      res.status(500).json({ message: 'PRB_API_KEY is not configured' });
      return;
    }

    if (key === expectedKey) {
      next();
      return;
    }
  }

  // ── Try admin JWT ────────────────────────────────────────────────────────
  const token: string | undefined = req.cookies?.token;
  if (token) {
    try {
      const payload = verifyToken(token);
      if (payload.role === PrbUserRole.ADMIN) {
        req.user = { id: payload.sub, role: payload.role };
        next();
        return;
      }
    } catch {
      // fall through to 401
    }
  }

  res.status(401).json({ message: 'Valid API key or admin credentials required' });
}
