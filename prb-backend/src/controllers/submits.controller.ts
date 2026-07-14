import { Request, Response, NextFunction } from 'express';
import { listSubmits, upsertSubmit } from '../services/submits.service';
import { getTask } from '../services/task.service';
import { TaskStatus } from '../entities/Task';
import { HttpError } from '../utils/httpError';
import { SubmitBody } from '../middleware/minerAuth';

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

/**
 * POST /api/v1/submits — miner submission, authenticated via `minerAuth`.
 * Only accepted while the single `prb_task` row has status `open`; the
 * miner's hotkey must be one of the ranked hotkeys on that task, and the
 * hotkey's rank (`minerId`) is used as the `miner_uid` in `prb_submits`.
 */
export async function createSubmitHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { imageURL } = req.body as SubmitBody;
    const minerHotkey = req.minerHotkey;

    if (!minerHotkey) {
      throw new HttpError(401, 'Miner hotkey not authenticated');
    }

    if (typeof imageURL !== 'string' || imageURL.trim().length === 0) {
      throw new HttpError(400, 'imageURL is required');
    }

    const task = await getTask();
    if (!task || task.status !== TaskStatus.OPEN) {
      throw new HttpError(403, 'Submissions are only available while the task status is open');
    }

    const matchedHotkey = task.hotkeys.find((h) => h.hotkey === minerHotkey);
    if (!matchedHotkey) {
      throw new HttpError(403, 'Hotkey is not registered for the current task');
    }

    const submit = await upsertSubmit(matchedHotkey.minerId, imageURL.trim());

    res.status(201).json({
      miner_uid: submit.minerUid,
      imageURL: submit.imageUrl,
      created_at: submit.createdAt,
    });
  } catch (err) {
    next(err);
  }
}
