import { Router } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { requireImageUpload, optionalProcessedImageUpload } from '../middleware/uploadMiddleware';
import {
  createJobHandler,
  listJobsHandler,
  updateJobHandler,
} from '../controllers/jobs.controller';

const router = Router();

/** POST /jobs — public; upload user image and create a job */
router.post('/', requireImageUpload, createJobHandler);

/** GET /jobs — API key required; list all jobs */
router.get('/', apiKeyAuth, listJobsHandler);

/** PATCH /jobs/:id — API key required; update job with result data */
router.patch('/:id', apiKeyAuth, optionalProcessedImageUpload, updateJobHandler);

export default router;
