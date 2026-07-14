import { Request, Response, NextFunction } from 'express';
import { getTask, upsertTask } from '../services/task.service';
import { TaskHotkey, TaskStatus } from '../entities/Task';
import { HttpError } from '../utils/httpError';

interface CreateTaskBody {
  task_id?: unknown;
  imageURL?: unknown;
  status?: unknown;
  hotkeys?: unknown;
}

function asRequiredTrimmedString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

function asRequiredStatus(value: unknown): TaskStatus {
  if (typeof value !== 'string' || !Object.values(TaskStatus).includes(value as TaskStatus)) {
    throw new HttpError(400, `status is required and must be one of: ${Object.values(TaskStatus).join(', ')}`);
  }
  return value as TaskStatus;
}

/**
 * Validates the `hotkeys` array and ranks each entry by its position in the
 * array — the array index becomes the `minerId`.
 */
function asHotkeys(value: unknown): TaskHotkey[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, 'hotkeys is required and must be an array');
  }

  return value.map((entry, index) => {
    if (typeof entry !== 'string' || entry.trim().length === 0) {
      throw new HttpError(400, `hotkeys[${index}] must be a non-empty string`);
    }
    return { minerId: index, hotkey: entry.trim() };
  });
}

export async function getTaskHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await getTask();

    if (!task) {
      throw new HttpError(404, 'No task found');
    }

    res.json({
      task_id: task.taskId,
      imageURL: task.imageUrl,
      hotkeys: task.hotkeys,
    });
  } catch (err) {
    next(err);
  }
}

export async function createTaskHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as CreateTaskBody;

    const task = await upsertTask({
      taskId: asRequiredTrimmedString(body.task_id, 'task_id'),
      imageUrl: asRequiredTrimmedString(body.imageURL, 'imageURL'),
      status: asRequiredStatus(body.status),
      hotkeys: asHotkeys(body.hotkeys),
    });

    res.status(201).json({
      task_id: task.taskId,
      imageURL: task.imageUrl,
      status: task.status,
      hotkeys: task.hotkeys,
      updatedAt: task.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}
