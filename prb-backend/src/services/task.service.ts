import { AppDataSource } from '../config/database';
import { Task, TaskHotkey, TaskStatus } from '../entities/Task';

/** Returns the single task row, or `null` if none has been created yet. */
export async function getTask(): Promise<Task | null> {
  const repo = AppDataSource.getRepository(Task);
  const [task] = await repo.find({ take: 1 });
  return task ?? null;
}

/**
 * Overwrites the single task row with the given values.
 * Creates the row on first call; updates it in place on every subsequent call.
 */
export async function upsertTask(input: {
  taskId: string;
  imageUrl: string;
  status: TaskStatus;
  hotkeys: TaskHotkey[];
}): Promise<Task> {
  const repo = AppDataSource.getRepository(Task);
  const [existing] = await repo.find({ take: 1 });

  const task = existing ?? repo.create();
  task.taskId = input.taskId;
  task.imageUrl = input.imageUrl;
  task.status = input.status;
  task.hotkeys = input.hotkeys;

  return repo.save(task);
}
