import { Router } from 'express';
import { uploadHandler, myImagesHandler } from '../controllers/images.controller';
import { jwtAuth } from '../middleware/jwtAuth';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = Router();

// All routes require a valid JWT
router.use(jwtAuth);

router.post('/upload', uploadMiddleware, uploadHandler);
router.get('/mine', myImagesHandler);

export default router;
