import crypto from 'crypto';

/** Generate a cryptographically random 64-character hex API key. */
export function generateKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** SHA-256 hash a key for safe storage. */
export function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
