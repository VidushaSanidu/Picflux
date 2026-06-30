import { Request, Response, NextFunction } from 'express';
import { MinerData, NetworkBlock } from '../entities/ValidatorReport';

// ─── Config ───────────────────────────────────────────────────────────────────
const SIGNATURE_MAX_AGE_S = parseInt(
  process.env.SIGNATURE_MAX_AGE_SECONDS ?? '120',
  10,
);
const ALLOW_UNSIGNED_DEV =
  process.env.ALLOW_UNSIGNED_DEV?.toLowerCase() === 'true';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ReportBody {
  task_id: string;
  timestamp: string;
  validator_hotkey: string;
  network: NetworkBlock;
  miners: MinerData[];
}

// ─── sr25519 signature verification ──────────────────────────────────────────
async function verifySignature(
  hotkeySS58: string,
  signatureHex: string,
  bodyBytes: Buffer,
): Promise<boolean> {
  if (ALLOW_UNSIGNED_DEV) {
    return true;
  }

  try {
    const { sr25519Verify, decodeAddress, cryptoWaitReady } = await import(
      '@polkadot/util-crypto'
    );
    const { hexToU8a } = await import('@polkadot/util');

    await cryptoWaitReady();

    const publicKey = decodeAddress(hotkeySS58);
    const signature = hexToU8a(
      signatureHex.startsWith('0x') ? signatureHex : `0x${signatureHex}`,
    );
    return sr25519Verify(bodyBytes, signature, publicKey);
  } catch {
    return false;
  }
}

// ─── Metagraph validator registration check ───────────────────────────────────
// Stub: in production replace this with a real metagraph/subtensor HTTP call.
// Returns (isValidator, stake).
function isRegisteredValidator(_hotkey: string): [boolean, number] {
  if (ALLOW_UNSIGNED_DEV) {
    return [true, 1.0];
  }
  // TODO: query Bittensor metagraph API to verify stake
  // e.g. GET https://metagraph.api/is-validator?hotkey=...
  // For now, allow all hotkeys with a nominal stake so the service can operate
  // without a full bittensor node.
  return [true, 1.0];
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export async function validatorAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const hotkey = req.headers['x-validator-hotkey'] as string | undefined;
  const signature = req.headers['x-signature'] as string | undefined;

  if (!hotkey || !signature) {
    res
      .status(401)
      .json({ message: 'Missing X-Validator-Hotkey or X-Signature header' });
    return;
  }

  // ── 1. Verify the sr25519 signature over the raw body ─────────────────────
  const rawBody = req.rawBody;
  if (!rawBody || rawBody.length === 0) {
    res.status(400).json({ message: 'Empty request body' });
    return;
  }

  const sigValid = await verifySignature(hotkey, signature, rawBody);
  if (!sigValid) {
    res.status(401).json({ message: 'Invalid signature' });
    return;
  }

  // ── 2. Parse and validate the JSON body ───────────────────────────────────
  let body: ReportBody;
  try {
    body = JSON.parse(rawBody.toString()) as ReportBody;
  } catch {
    res.status(422).json({ message: 'Invalid JSON body' });
    return;
  }

  if (
    !body.task_id ||
    !body.timestamp ||
    !body.validator_hotkey ||
    !body.network ||
    !Array.isArray(body.miners)
  ) {
    res.status(422).json({ message: 'Missing required fields in body' });
    return;
  }

  // ── 3. Signing hotkey must match body.validator_hotkey ────────────────────
  if (body.validator_hotkey !== hotkey) {
    res
      .status(403)
      .json({ message: 'X-Validator-Hotkey does not match body.validator_hotkey' });
    return;
  }

  // ── 4. Replay protection: reject stale timestamps ─────────────────────────
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
    res
      .status(401)
      .json({ message: `Report too old (${Math.round(ageSeconds)}s > ${SIGNATURE_MAX_AGE_S}s)` });
    return;
  }

  // ── 5. Verify hotkey is a registered validator with stake ─────────────────
  const [isValidator, stake] = isRegisteredValidator(hotkey);
  if (!isValidator) {
    res.status(403).json({ message: 'Hotkey is not a registered validator' });
    return;
  }

  // Attach parsed data for downstream handlers
  req.body = body;
  req.validatorHotkey = hotkey;
  req.validatorStake = stake;

  next();
}
