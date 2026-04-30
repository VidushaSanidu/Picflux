import { Router } from 'express';
import { registerHandler, loginHandler, logoutHandler, meHandler } from '../controllers/auth.controller';
import { jwtAuth } from '../middleware/jwtAuth';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.get('/me', jwtAuth, meHandler);

export default router;
