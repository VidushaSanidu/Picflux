import { Router } from 'express';
import {
  listPendingHandler,
  getPendingHandler,
  approveHandler,
  rejectHandler,
  setFeaturedHandler,
  deleteImageHandler,
} from '../controllers/admin.controller';
import { jwtAuth } from '../middleware/jwtAuth';
import { requireRole } from '../middleware/requireRole';
import { UserRole } from '../entities/User';

const router = Router();

// All admin routes require a valid JWT + admin role
router.use(jwtAuth, requireRole(UserRole.ADMIN));

router.get('/images/pending', listPendingHandler);
router.get('/images/:id', getPendingHandler);
router.patch('/images/:id/approve', approveHandler);
router.patch('/images/:id/reject', rejectHandler);
router.patch('/images/:id/featured', setFeaturedHandler);
router.delete('/images/:id', deleteImageHandler);

export default router;
