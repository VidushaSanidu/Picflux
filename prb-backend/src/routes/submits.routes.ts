import { Router } from 'express';
import { submitsAccess } from '../middleware/submitsAccess';
import { minerAuth } from '../middleware/minerAuth';
import { apiKeyOrAdmin } from '../middleware/apiKeyOrAdmin';
import { listSubmitsHandler, createSubmitHandler, createSubmitAdminHandler } from '../controllers/submits.controller';

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

/**
 * POST /api/v1/submits/admin — same as above, but authenticated with the
 * admin API key or admin JWT instead of a miner signature. Not gated by
 * task status.
 */
router.post('/admin', apiKeyOrAdmin, createSubmitAdminHandler);

export default router;
