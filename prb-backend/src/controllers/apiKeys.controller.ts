import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../entities/ApiKey';
import {
  createApiKey,
  listApiKeys,
  regenerateApiKey,
  deleteApiKey,
} from '../services/apiKeys.service';
import { HttpError } from '../utils/httpError';

interface CreateApiKeyBody {
  api_user?: unknown;
}

function toApiKeyResponse(apiKey: ApiKey) {
  return {
    id: apiKey.id,
    api_user: apiKey.apiUser,
    api_key: apiKey.apiKey,
    created_date: apiKey.createdDate,
    updated_date: apiKey.updatedDate,
    last_used: apiKey.lastUsed,
    used_count: apiKey.usedCount,
  };
}

function asRequiredTrimmedString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

export async function createApiKeyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as CreateApiKeyBody;
    const apiUser = asRequiredTrimmedString(body.api_user, 'api_user');

    const apiKey = await createApiKey(apiUser);
    res.status(201).json(toApiKeyResponse(apiKey));
  } catch (err) {
    next(err);
  }
}

export async function listApiKeysHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const apiKeys = await listApiKeys();
    res.json(apiKeys.map(toApiKeyResponse));
  } catch (err) {
    next(err);
  }
}

export async function regenerateApiKeyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const apiKey = await regenerateApiKey(req.params.id);
    res.json(toApiKeyResponse(apiKey));
  } catch (err) {
    next(err);
  }
}

export async function deleteApiKeyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteApiKey(req.params.id);
    res.json({ message: 'API key deleted' });
  } catch (err) {
    next(err);
  }
}
