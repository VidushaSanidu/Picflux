import { AppDataSource } from '../config/database';
import { APIKey } from '../entities/APIKey';
import { AuditLog, AuditAction } from '../entities/AuditLog';
import { generateKey, hashKey } from '../utils/apiKey';
import { HttpError } from '../utils/httpError';

export interface ApiKeyPublic {
  id: string;
  keyPrefix: string;
  createdAt: Date;
  revokedAt: Date | null;
}

/**
 * Creates a new API key for the user.
 * Returns the raw plaintext key — this is the ONLY time it is available.
 */
export async function createApiKey(
  userId: string,
): Promise<{ rawKey: string; apiKey: ApiKeyPublic }> {
  const rawKey = generateKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 8);

  const apiKeyRepo = AppDataSource.getRepository(APIKey);
  const apiKey = apiKeyRepo.create({ userId, keyHash, keyPrefix });
  await apiKeyRepo.save(apiKey);

  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(
    auditRepo.create({ userId, action: AuditAction.API_KEY_CREATE }),
  );

  return {
    rawKey,
    apiKey: {
      id: apiKey.id,
      keyPrefix: apiKey.keyPrefix,
      createdAt: apiKey.createdAt,
      revokedAt: apiKey.revokedAt,
    },
  };
}

/** Returns all non-revoked API keys for the user (prefix + metadata only). */
export async function listApiKeys(userId: string): Promise<ApiKeyPublic[]> {
  const apiKeyRepo = AppDataSource.getRepository(APIKey);
  const keys = await apiKeyRepo.find({
    where: { userId },
    order: { createdAt: 'DESC' },
  });

  return keys.map((k) => ({
    id: k.id,
    keyPrefix: k.keyPrefix,
    createdAt: k.createdAt,
    revokedAt: k.revokedAt,
  }));
}

/** Revokes (soft-deletes) an API key. Verifies ownership. */
export async function revokeApiKey(keyId: string, userId: string): Promise<void> {
  const apiKeyRepo = AppDataSource.getRepository(APIKey);
  const apiKey = await apiKeyRepo.findOne({ where: { id: keyId } });

  if (!apiKey) throw new HttpError(404, 'API key not found');
  if (apiKey.userId !== userId) throw new HttpError(403, 'Forbidden');
  if (apiKey.revokedAt !== null) throw new HttpError(409, 'API key is already revoked');

  apiKey.revokedAt = new Date();
  await apiKeyRepo.save(apiKey);

  const auditRepo = AppDataSource.getRepository(AuditLog);
  await auditRepo.save(
    auditRepo.create({ userId, action: AuditAction.API_KEY_REVOKE }),
  );
}
