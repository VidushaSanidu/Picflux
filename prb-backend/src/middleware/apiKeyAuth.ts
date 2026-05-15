import { Request, Response, NextFunction } from 'express';

/**
 * Reads `Authorization: Bearer <key>` header and compares it against
 * the PRB_API_KEY environment variable. Returns 401 if missing or invalid.
 */
export function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expectedKey = process.env.PRB_API_KEY;

  if (!expectedKey) {
    res.status(500).json({ message: 'Server misconfiguration: PRB_API_KEY is not set' });
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'API key required (Authorization: Bearer <key>)' });
    return;
  }

  const providedKey = authHeader.slice(7).trim();

  if (!providedKey || providedKey !== expectedKey) {
    res.status(401).json({ message: 'Invalid API key' });
    return;
  }

  next();
}
