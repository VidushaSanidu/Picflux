import { Router } from 'express';
import { submitsAccess } from '../middleware/submitsAccess';
import { minerAuth } from '../middleware/minerAuth';
import { listSubmitsHandler, createSubmitHandler } from '../controllers/submits.controller';

const router = Router();

/**
 * GET /api/v1/submits — API key holder (only while task status is `validating`)
 * or admin JWT (always, bypassing the status check).
 */
router.get('/', submitsAccess, listSubmitsHandler);

/**
 * POST /api/v1/submits — miner submission, signed with the miner's hotkey.
 * Allowed only while the task status is `open`.
 */
router.post('/', minerAuth, createSubmitHandler);

export default router;
