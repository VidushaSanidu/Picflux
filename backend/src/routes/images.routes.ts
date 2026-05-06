import { Router } from 'express';
import { uploadHandler, myImagesHandler } from '../controllers/images.controller';
import { jwtAuth } from '../middleware/jwtAuth';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import { requireRole } from '../middleware/requireRole';
import { UserRole } from '../entities/User';

const router = Router();

// All routes require a valid JWT
router.use(jwtAuth);

// Temporarily restricted to admins only
router.post('/upload', requireRole(UserRole.ADMIN), uploadMiddleware, uploadHandler);
router.get('/mine', myImagesHandler);

export default router;
