import { Router } from 'express';
import {
  createApiKeyHandler,
  listApiKeysHandler,
  revokeApiKeyHandler,
} from '../controllers/apiKeys.controller';
import { jwtAuth } from '../middleware/jwtAuth';

const router = Router();

// All API key management routes require a valid JWT
router.use(jwtAuth);

router.post('/', createApiKeyHandler);
router.get('/', listApiKeysHandler);
router.delete('/:id', revokeApiKeyHandler);

export default router;
