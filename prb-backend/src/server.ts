import 'dotenv/config';
import { AppDataSource } from './config/database';
import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '4001', 10);

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  console.log('Database connection established');

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`PRB API listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
