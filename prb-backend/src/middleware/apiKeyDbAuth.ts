import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { ApiKey } from '../entities/ApiKey';

/**
 * Reads `Authorization: Bearer <key>` header and validates it against the
 * `prb_api_keys` table (managed via the /api/v1/api-keys admin endpoints).
 * On success, updates `last_used` and increments `used_count`.
 *
 * This is a DB-backed alternative to the static-env-var `apiKeyAuth` middleware.
 */
export async function apiKeyDbAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'API key required (Authorization: Bearer <key>)' });
    return;
  }

  const providedKey = authHeader.slice(7).trim();

  if (!providedKey) {
    res.status(401).json({ message: 'Invalid API key' });
    return;
  }

  const apiKeyRepo = AppDataSource.getRepository(ApiKey);
  const apiKey = await apiKeyRepo.findOne({ where: { apiKey: providedKey } });

  if (!apiKey) {
    res.status(401).json({ message: 'Invalid API key' });
    return;
  }

  apiKey.lastUsed = new Date();
  apiKey.usedCount += 1;
  await apiKeyRepo.save(apiKey);

  next();
}
