import { Router } from 'express';
import { submitsAccess } from '../middleware/submitsAccess';
import { listSubmitsHandler } from '../controllers/submits.controller';

const router = Router();

/**
 * GET /api/v1/submits — API key holder (only while task status is `validating`)
 * or admin JWT (always, bypassing the status check).
 */
router.get('/', submitsAccess, listSubmitsHandler);

export default router;
