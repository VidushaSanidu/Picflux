import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth';
import { getTaskHandler, createTaskHandler } from '../controllers/task.controller';
import { apiKeyOrAdmin } from '../middleware/apiKeyOrAdmin';

const router = Router();

/** GET /api/v1/task — public, no auth */
router.get('/', getTaskHandler);

/** POST /api/v1/task — admin only; overwrites the single task row */
router.post('/', apiKeyOrAdmin, createTaskHandler);

export default router;
