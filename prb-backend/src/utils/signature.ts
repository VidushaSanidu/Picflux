const ALLOW_UNSIGNED_DEV = process.env.ALLOW_UNSIGNED_DEV?.toLowerCase() === 'true';

/** Verifies an sr25519 signature (hex-encoded) over `bodyBytes` for the given SS58 hotkey. */
export async function verifySr25519Signature(
  hotkeySS58: string,
  signatureHex: string,
  bodyBytes: Buffer,
): Promise<boolean> {
  if (ALLOW_UNSIGNED_DEV) {
    return true;
  }

  try {
    const { sr25519Verify, decodeAddress, cryptoWaitReady } = await import('@polkadot/util-crypto');
    const { hexToU8a } = await import('@polkadot/util');

    await cryptoWaitReady();

    const publicKey = decodeAddress(hotkeySS58);
    const signature = hexToU8a(signatureHex.startsWith('0x') ? signatureHex : `0x${signatureHex}`);
    return sr25519Verify(bodyBytes, signature, publicKey);
  } catch {
    return false;
  }
}
