import 'dotenv/config';
import { AppDataSource } from './config/database';
import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '4001', 10);

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  console.log('Database connection established');

  // Initialise the sr25519 WASM module used by validatorAuth.
  // Skipped in dev when ALLOW_UNSIGNED_DEV=true to avoid the dependency.
  if (process.env.ALLOW_UNSIGNED_DEV?.toLowerCase() !== 'true') {
    try {
      const { cryptoWaitReady } = await import('@polkadot/util-crypto');
      await cryptoWaitReady();
      console.log('Polkadot WASM crypto initialised');
    } catch (err) {
      console.warn(
        '[startup] @polkadot/util-crypto not available — sr25519 verification disabled.',
        err,
      );
    }
  }

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`PRB API listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
