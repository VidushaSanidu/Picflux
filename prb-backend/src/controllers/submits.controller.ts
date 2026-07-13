import { Request, Response, NextFunction } from 'express';
import { listSubmits } from '../services/submits.service';

export async function listSubmitsHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const submits = await listSubmits();

    res.json(
      submits.map((s) => ({
        miner_uid: s.minerUid,
        imageURL: s.imageUrl,
        created_at: s.createdAt,
      })),
    );
  } catch (err) {
    next(err);
  }
}
