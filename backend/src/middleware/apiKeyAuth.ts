import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { APIKey } from '../entities/APIKey';
import { hashKey } from '../utils/apiKey';
import { UserRole } from '../entities/User';

/**
 * Reads `Authorization: Bearer <key>` header, hashes the raw key,
 * looks up the non-revoked APIKey record, and attaches `req.user`.
 * Returns 401 if the key is missing, invalid, or revoked.
 */
export async function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'API key required (Authorization: Bearer <key>)' });
    return;
  }

  const rawKey = authHeader.slice(7).trim();

  if (!rawKey) {
    res.status(401).json({ message: 'API key required' });
    return;
  }

  try {
    const keyHash = hashKey(rawKey);
    const apiKeyRepo = AppDataSource.getRepository(APIKey);

    const apiKey = await apiKeyRepo.findOne({
      where: { keyHash },
      relations: ['user'],
    });

    if (!apiKey || apiKey.revokedAt !== null) {
      res.status(401).json({ message: 'Invalid or revoked API key' });
      return;
    }

    req.user = { id: apiKey.userId, role: apiKey.user.role as UserRole };
    next();
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Optional variant — attaches req.user if a valid API key is present,
 * but does NOT block the request if it's absent. Useful for endpoints
 * that are public but want to track authenticated downloads.
 */
export async function optionalApiKeyAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey) return next();

  try {
    const keyHash = hashKey(rawKey);
    const apiKeyRepo = AppDataSource.getRepository(APIKey);

    const apiKey = await apiKeyRepo.findOne({
      where: { keyHash },
      relations: ['user'],
    });

    if (apiKey && apiKey.revokedAt === null) {
      req.user = { id: apiKey.userId, role: apiKey.user.role as UserRole };
    }
  } catch {
    // Silently ignore errors in optional auth
  }

  next();
}
