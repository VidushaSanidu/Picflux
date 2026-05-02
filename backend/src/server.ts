import 'dotenv/config';
import { AppDataSource } from './config/database';
import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

async function bootstrap(): Promise<void> {
  // Initialise TypeORM (creates/syncs tables in dev)
  await AppDataSource.initialize();
  console.log('Database connection established');

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Picflux API listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
