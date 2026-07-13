import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth';
import { requireRole } from '../middleware/requireRole';
import { PrbUserRole } from '../entities/User';
import {
  createApiKeyHandler,
  listApiKeysHandler,
  regenerateApiKeyHandler,
  deleteApiKeyHandler,
} from '../controllers/apiKeys.controller';

const router = Router();

// All API key management routes are admin-only
router.use(jwtAuth, requireRole(PrbUserRole.ADMIN));

/** POST /api/v1/api-keys — create a new API key */
router.post('/', createApiKeyHandler);

/** GET /api/v1/api-keys — list all API keys */
router.get('/', listApiKeysHandler);

/** PATCH /api/v1/api-keys/:id/regenerate — regenerate the key value */
router.patch('/:id/regenerate', regenerateApiKeyHandler);

/** DELETE /api/v1/api-keys/:id — delete an API key */
router.delete('/:id', deleteApiKeyHandler);

export default router;
