import { AppDataSource } from '../config/database';
import { Task, TaskHotkey, TaskStatus } from '../entities/Task';
import { clearSubmits } from './submits.service';

/** Returns the single task row, or `null` if none has been created yet. */
export async function getTask(): Promise<Task | null> {
  const repo = AppDataSource.getRepository(Task);
  const [task] = await repo.find({ take: 1 });
  return task ?? null;
}

/**
 * Overwrites the single task row with the given values.
 * Creates the row on first call; updates it in place on every subsequent call.
 *
 * If the `taskId` changes from the previously stored task, all rows in
 * `prb_submits` are cleared, since those submissions belonged to the old task.
 */
export async function upsertTask(input: {
  taskId: string;
  imageUrl: string;
  status: TaskStatus;
  hotkeys: TaskHotkey[];
}): Promise<Task> {
  return AppDataSource.transaction(async (manager) => {
    const repo = manager.getRepository(Task);
    const [existing] = await repo.find({ take: 1 });

    const taskIdChanged = existing !== undefined && existing.taskId !== input.taskId;

    const task = existing ?? repo.create();
    task.taskId = input.taskId;
    task.imageUrl = input.imageUrl;
    task.status = input.status;
    task.hotkeys = input.hotkeys;

    const saved = await repo.save(task);

    if (taskIdChanged) {
      await clearSubmits(manager);
    }

    return saved;
  });
}

/** Updates only the `status` field of the existing single task row. Returns `null` if no task exists yet. */
export async function updateTaskStatus(status: TaskStatus): Promise<Task | null> {
  const repo = AppDataSource.getRepository(Task);
  const [existing] = await repo.find({ take: 1 });

  if (!existing) {
    return null;
  }

  existing.status = status;
  return repo.save(existing);
}
