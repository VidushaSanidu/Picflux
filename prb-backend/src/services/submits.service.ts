import { AppDataSource } from '../config/database';
import { Submit } from '../entities/Submit';

/** Returns all submissions, most recently created first. */
export async function listSubmits(): Promise<Submit[]> {
  const repo = AppDataSource.getRepository(Submit);
  return repo.find({ order: { createdAt: 'DESC' } });
}

/**
 * Creates or updates the submission for the given miner. Each miner has at
 * most one row in `prb_submits`; resubmitting overwrites the image URL.
 */
export async function upsertSubmit(minerUid: number, imageUrl: string): Promise<Submit> {
  const repo = AppDataSource.getRepository(Submit);
  const existing = await repo.findOne({ where: { minerUid } });

  const submit = existing ?? repo.create({ minerUid });
  submit.imageUrl = imageUrl;

  return repo.save(submit);
}
