import { Router } from 'express';
import { validatorAuth } from '../middleware/validatorAuth';
import { apiKeyOrAdmin } from '../middleware/apiKeyOrAdmin';
import {
  reportHandler,
  leaderboardHandler,
  listValidatorsHandler,
  clearLeaderboardHandler,
  getBurnRateHandler,
  setBurnRateHandler,
} from '../controllers/leaderboard.controller';

const router = Router();

// POST /api/v1/report — validators write (sr25519 signed)
router.post('/report', validatorAuth, reportHandler);

// GET /api/v1/validators — list all validator hotkeys (public)
router.get('/validators', listValidatorsHandler);

// GET /api/v1/leaderboard/:hotkey — public read
router.get('/leaderboard/:hotkey', leaderboardHandler);

// DELETE /api/v1/leaderboard/clear — admin only (API key or admin JWT)
router.delete('/leaderboard/clear', apiKeyOrAdmin, clearLeaderboardHandler);

// POST /api/v1/burn-rate — admin only (API key or admin JWT)
router.post('/burn-rate', apiKeyOrAdmin, setBurnRateHandler);

// GET /api/v1/burn-rate — public read
router.get('/burn-rate', getBurnRateHandler);

export default router;
