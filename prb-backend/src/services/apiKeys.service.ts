import { AppDataSource } from '../config/database';
import { ApiKey } from '../entities/ApiKey';
import { generateApiKey } from '../utils/apiKey';
import { HttpError } from '../utils/httpError';

/** Creates a new API key for the given label. */
export async function createApiKey(apiUser: string): Promise<ApiKey> {
  const repo = AppDataSource.getRepository(ApiKey);

  const apiKey = repo.create({
    apiUser,
    apiKey: generateApiKey(),
    lastUsed: null,
    usedCount: 0,
  });

  return repo.save(apiKey);
}

/** Returns all API keys, most recently created first. */
export async function listApiKeys(): Promise<ApiKey[]> {
  const repo = AppDataSource.getRepository(ApiKey);
  return repo.find({ order: { createdDate: 'DESC' } });
}

/** Regenerates the key value for an existing API key record, resetting its usage stats. */
export async function regenerateApiKey(id: string): Promise<ApiKey> {
  const repo = AppDataSource.getRepository(ApiKey);
  const apiKey = await repo.findOne({ where: { id } });

  if (!apiKey) throw new HttpError(404, 'API key not found');

  apiKey.apiKey = generateApiKey();
  apiKey.lastUsed = null;
  apiKey.usedCount = 0;

  return repo.save(apiKey);
}

/** Deletes an API key record. */
export async function deleteApiKey(id: string): Promise<void> {
  const repo = AppDataSource.getRepository(ApiKey);
  const apiKey = await repo.findOne({ where: { id } });

  if (!apiKey) throw new HttpError(404, 'API key not found');

  await repo.remove(apiKey);
}
