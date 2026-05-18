import { Router } from 'express';
import { listUsersHandler, updateRoleHandler } from '../controllers/users.controller';
import { jwtAuth } from '../middleware/jwtAuth';
import { requireRole } from '../middleware/requireRole';
import { PrbUserRole } from '../entities/User';

const router = Router();

/** GET /users — admin only; list all users */
router.get('/', jwtAuth, requireRole(PrbUserRole.ADMIN), listUsersHandler);

/** PATCH /users/:id/role — admin only; update a user's role */
router.patch('/:id/role', jwtAuth, requireRole(PrbUserRole.ADMIN), updateRoleHandler);

export default router;
