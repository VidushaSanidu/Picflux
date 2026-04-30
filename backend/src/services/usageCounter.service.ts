import { AppDataSource } from '../config/database';
import { UsageCounter } from '../entities/UsageCounter';
import { HttpError } from '../utils/httpError';

const DAILY_LIMIT = 5;

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

type UploadType = 'web' | 'api';
type DownloadType = 'web' | 'api';

/**
 * Atomically checks and increments today's upload counter for a user.
 * Throws a 429 HttpError if the daily limit has been reached.
 */
export async function checkAndIncrementUpload(
  userId: string,
  type: UploadType,
): Promise<void> {
  const repo = AppDataSource.getRepository(UsageCounter);
  const date = todayISO();

  await AppDataSource.transaction(async (em) => {
    const counterRepo = em.getRepository(UsageCounter);

    // Ensure row exists (INSERT … ON CONFLICT DO NOTHING)
    await em.query(
      `INSERT INTO usage_counters (id, user_id, date, web_upload_count, web_download_count, api_upload_count, api_download_count)
       VALUES (gen_random_uuid(), $1, $2, 0, 0, 0, 0)
       ON CONFLICT (user_id, date) DO NOTHING`,
      [userId, date],
    );

    const counter = await counterRepo.findOne({
      where: { userId, date },
      lock: { mode: 'pessimistic_write' },
    });

    if (!counter) throw new Error('Usage counter row missing after insert');

    const field = type === 'web' ? 'webUploadCount' : 'apiUploadCount';

    if (counter[field] >= DAILY_LIMIT) {
      const resetTime = `${date}T23:59:59Z`;
      throw new HttpError(
        429,
        `Daily upload limit of ${DAILY_LIMIT} reached. Resets at ${resetTime}.`,
      );
    }

    counter[field] += 1;
    await counterRepo.save(counter);
  });

  void repo; // suppress unused variable warning
}

/**
 * Atomically checks and increments today's download counter for a user.
 * Throws a 429 HttpError if the daily limit has been reached.
 */
export async function checkAndIncrementDownload(
  userId: string,
  type: DownloadType,
): Promise<void> {
  const repo = AppDataSource.getRepository(UsageCounter);
  const date = todayISO();

  await AppDataSource.transaction(async (em) => {
    const counterRepo = em.getRepository(UsageCounter);

    await em.query(
      `INSERT INTO usage_counters (id, user_id, date, web_upload_count, web_download_count, api_upload_count, api_download_count)
       VALUES (gen_random_uuid(), $1, $2, 0, 0, 0, 0)
       ON CONFLICT (user_id, date) DO NOTHING`,
      [userId, date],
    );

    const counter = await counterRepo.findOne({
      where: { userId, date },
      lock: { mode: 'pessimistic_write' },
    });

    if (!counter) throw new Error('Usage counter row missing after insert');

    const field = type === 'web' ? 'webDownloadCount' : 'apiDownloadCount';

    if (counter[field] >= DAILY_LIMIT) {
      const resetTime = `${date}T23:59:59Z`;
      throw new HttpError(
        429,
        `Daily download limit of ${DAILY_LIMIT} reached. Resets at ${resetTime}.`,
      );
    }

    counter[field] += 1;
    await counterRepo.save(counter);
  });

  void repo;
}
