import { Request, Response, NextFunction } from 'express';
import { verifySr25519Signature } from '../utils/signature';

// ─── Config ───────────────────────────────────────────────────────────────────
const SIGNATURE_MAX_AGE_S = parseInt(process.env.SIGNATURE_MAX_AGE_SECONDS ?? '120', 10);

export interface SubmitBody {
  miner_hotkey: string;
  timestamp: string;
  imageURL: string;
}

/**
 * Authenticates a miner submission using the same sr25519 signing scheme as
 * `validatorAuth`: the raw JSON body is signed with the miner's hotkey, and
 * the signature is supplied via the `X-Signature` header alongside the
 * signing hotkey in `X-Miner-Hotkey`.
 *
 * On success, sets `req.minerHotkey` and replaces `req.body` with the parsed,
 * verified JSON payload.
 */
export async function minerAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const hotkey = req.headers['x-miner-hotkey'] as string | undefined;
  const signature = req.headers['x-signature'] as string | undefined;

  if (!hotkey || !signature) {
    res.status(401).json({ message: 'Missing X-Miner-Hotkey or X-Signature header' });
    return;
  }

  // ── 1. Verify the sr25519 signature over the raw body ─────────────────────
  const rawBody = req.rawBody;
  if (!rawBody || rawBody.length === 0) {
    res.status(400).json({ message: 'Empty request body' });
    return;
  }

  const sigValid = await verifySr25519Signature(hotkey, signature, rawBody);
  if (!sigValid) {
    res.status(401).json({ message: 'Invalid signature' });
    return;
  }

  // ── 2. Parse and validate the JSON body ───────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody.toString()) as Record<string, unknown>;
  } catch {
    res.status(422).json({ message: 'Invalid JSON body' });
    return;
  }

  const minerHotkey = typeof body.miner_hotkey === 'string' ? body.miner_hotkey : undefined;
  if (!minerHotkey || typeof body.timestamp !== 'string' || typeof body.imageURL !== 'string') {
    res.status(422).json({ message: 'Missing required fields in body (miner_hotkey, timestamp, imageURL)' });
    return;
  }

  // ── 3. Signing hotkey must match body.miner_hotkey ─────────────────────────
  if (minerHotkey !== hotkey) {
    res.status(403).json({ message: 'X-Miner-Hotkey does not match body.miner_hotkey' });
    return;
  }

  // ── 4. Replay protection: reject stale timestamps ──────────────────────────
  let ageSeconds: number;
  try {
    const ts = new Date(body.timestamp);
    if (isNaN(ts.getTime())) {
      throw new Error('unparseable');
    }
    ageSeconds = (Date.now() - ts.getTime()) / 1000;
  } catch {
    res.status(422).json({ message: 'Invalid timestamp format' });
    return;
  }

  if (ageSeconds > SIGNATURE_MAX_AGE_S) {
    res.status(401).json({ message: `Submission too old (${Math.round(ageSeconds)}s > ${SIGNATURE_MAX_AGE_S}s)` });
    return;
  }

  req.body = body as unknown as SubmitBody;
  req.minerHotkey = hotkey;

  next();
}
