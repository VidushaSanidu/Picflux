import { AppDataSource } from '../config/database';
import { Submit } from '../entities/Submit';

/** Returns all submissions, most recently created first. */
export async function listSubmits(): Promise<Submit[]> {
  const repo = AppDataSource.getRepository(Submit);
  return repo.find({ order: { createdAt: 'DESC' } });
}
