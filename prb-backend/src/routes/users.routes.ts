import { Router } from 'express';
import { listUsersHandler, updateRoleHandler, updateProfileHandler, setWaitlistHandler } from '../controllers/users.controller';
import { jwtAuth } from '../middleware/jwtAuth';
import { requireRole } from '../middleware/requireRole';
import { PrbUserRole } from '../entities/User';

const router = Router();

/** GET /users — admin only; list all users */
router.get('/', jwtAuth, requireRole(PrbUserRole.ADMIN), listUsersHandler);

/** PATCH /users/me — any authenticated user; update own profile */
router.patch('/me', jwtAuth, updateProfileHandler);

/** PATCH /users/:id/role — admin only; update a user's role */
router.patch('/:id/role', jwtAuth, requireRole(PrbUserRole.ADMIN), updateRoleHandler);

/** PATCH /users/:id/waitlist — any authenticated user; add themselves to the waitlist */
router.patch('/:id/waitlist', jwtAuth, setWaitlistHandler);

export default router;
