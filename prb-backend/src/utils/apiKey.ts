import crypto from 'crypto';

/** Generate a cryptographically random API key, prefixed for easy identification. */
export function generateApiKey(): string {
  return `prb_${crypto.randomBytes(32).toString('hex')}`;
}
