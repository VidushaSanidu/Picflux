import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth';
import { getTaskHandler, createTaskHandler, updateTaskStatusHandler } from '../controllers/task.controller';
import { apiKeyOrAdmin } from '../middleware/apiKeyOrAdmin';

const router = Router();

/** GET /api/v1/task — public, no auth */
router.get('/', getTaskHandler);

/** POST /api/v1/task — admin only; overwrites the single task row */
router.post('/', apiKeyOrAdmin, createTaskHandler);

/** PATCH /api/v1/task/status — admin only; updates only the task's status */
router.patch('/status', apiKeyOrAdmin, updateTaskStatusHandler);

export default router;
