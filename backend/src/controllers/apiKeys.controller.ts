import { Request, Response, NextFunction } from 'express';
import { createApiKey, listApiKeys, revokeApiKey } from '../services/apiKeys.service';
import { HttpError } from '../utils/httpError';

export async function createApiKeyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'Authentication required');

    const { rawKey, apiKey } = await createApiKey(req.user.id);

    // rawKey is returned only once; it cannot be recovered from the stored hash
    res.status(201).json({
      message: 'Store this key securely. It will not be shown again.',
      key: rawKey,
      id: apiKey.id,
      keyPrefix: apiKey.keyPrefix,
      createdAt: apiKey.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

export async function listApiKeysHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'Authentication required');
    const keys = await listApiKeys(req.user.id);
    res.json(keys);
  } catch (err) {
    next(err);
  }
}

export async function revokeApiKeyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, 'Authentication required');
    await revokeApiKey(req.params.id, req.user.id);
    res.json({ message: 'API key revoked' });
  } catch (err) {
    next(err);
  }
}
