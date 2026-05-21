import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  googleInitHandler,
  googleCallbackHandler,
  verifyEmailHandler,
} from '../controllers/auth.controller';
import { jwtAuth } from '../middleware/jwtAuth';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.get('/me', jwtAuth, meHandler);
router.get('/verify-email', verifyEmailHandler);

// Google OAuth
router.get('/google', googleInitHandler);
router.get('/google/callback', googleCallbackHandler);

export default router;
