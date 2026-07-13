import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { ApiKey } from '../entities/ApiKey';
import { getTask } from '../services/task.service';
import { TaskStatus } from '../entities/Task';
import { verifyToken } from '../utils/jwt';
import { PrbUserRole } from '../entities/User';

/**
 * Access control for the submits endpoints:
 *   - Admin API key (`PRB_API_KEY` env var) or admin JWT cookie: always
 *     allowed, regardless of task status.
 *   - Regular API key (`Authorization: Bearer <key>` from `prb_api_keys`):
 *     allowed only while the single `prb_task` row has status `validating`.
 */
export async function submitsAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const providedKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;

  // ── Admin API key bypass (PRB_API_KEY env var) ───────────────────────────
  const adminApiKey = process.env.PRB_API_KEY;
  if (providedKey && adminApiKey && providedKey === adminApiKey) {
    next();
    return;
  }

  // ── Admin JWT bypass ──────────────────────────────────────────────────────
  const token: string | undefined = req.cookies?.token;
  if (token) {
    try {
      const payload = verifyToken(token);
      if (payload.role === PrbUserRole.ADMIN) {
        req.user = { id: payload.sub, role: payload.role };
        next();
        return;
      }
    } catch {
      // fall through to API key check
    }
  }

  // ── Regular API key check (gated by task status) ─────────────────────────
  if (!providedKey) {
    res.status(401).json({ message: 'Valid API key or admin credentials required' });
    return;
  }

  const apiKeyRepo = AppDataSource.getRepository(ApiKey);
  const apiKey = await apiKeyRepo.findOne({ where: { apiKey: providedKey } });

  if (!apiKey) {
    res.status(401).json({ message: 'Invalid API key' });
    return;
  }

  const task = await getTask();
  if (!task || task.status !== TaskStatus.VALIDATING) {
    res.status(403).json({ message: 'Submissions are only available while the task status is validating' });
    return;
  }

  apiKey.lastUsed = new Date();
  apiKey.usedCount += 1;
  await apiKeyRepo.save(apiKey);

  next();
}
