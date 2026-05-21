import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth';
import { requireRole } from '../middleware/requireRole';
import { apiKeyOrAdmin } from '../middleware/apiKeyOrAdmin';
import { requireImageUpload, optionalJobUpdateUpload } from '../middleware/uploadMiddleware';
import { PrbUserRole } from '../entities/User';
import {
  createJobHandler,
  listJobsHandler,
  getJobHandler,
  updateJobHandler,
  proceedJobHandler,
} from '../controllers/jobs.controller';

const router = Router();

/** POST /jobs — granted or admin only; upload user image and create a job */
router.post('/', jwtAuth, requireRole(PrbUserRole.GRANTED, PrbUserRole.ADMIN), requireImageUpload, createJobHandler);

/** POST /jobs/:id/proceed — granted or admin only; transition job CLASSIFIED → PENDING */
router.post('/:id/proceed', jwtAuth, requireRole(PrbUserRole.GRANTED, PrbUserRole.ADMIN), proceedJobHandler);

/** GET /jobs — API key or admin JWT required; list all jobs */
router.get('/', apiKeyOrAdmin, listJobsHandler);

/** GET /jobs/:id — API key or admin JWT required; get a single job by ID */
router.get('/:id', getJobHandler);

/** PATCH /jobs/:id — API key or admin JWT required; update job with result data */
router.patch('/:id', apiKeyOrAdmin, optionalJobUpdateUpload, updateJobHandler);

export default router;
