import { Request, Response, NextFunction } from 'express';
import {
  upsertReport,
  getReportByHotkey,
  getAllValidatorHotkeys,
  getBurnRate,
  setBurnRate,
} from '../services/leaderboard.service';
import { ReportBody } from '../middleware/validatorAuth';

// ─── POST /api/v1/report ──────────────────────────────────────────────────────
export async function reportHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as ReportBody;
    const stake = req.validatorStake ?? 1.0;

    const report = await upsertReport(body, stake);

    res.json({
      ok: true,
      task_id: report.taskId,
      miners: report.miners.length,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/leaderboard/:hotkey ─────────────────────────────────────────
export async function leaderboardHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { hotkey } = req.params;
    const report = await getReportByHotkey(hotkey);

    if (!report) {
      res.status(404).json({ message: 'No data found for this validator' });
      return;
    }

    res.json({
      validatorHotkey: report.validatorHotkey,
      taskId: report.taskId,
      timestamp: report.validatorTimestamp.toISOString(),
      network: {
        totalMiners: report.network.total_miners,
        availableMiners: report.network.available_miners,
        avgScore: report.network.avg_score,
        avgRmse: report.network.avg_rmse,
        avgNorm: report.network.avg_norm,
        successCount: report.network.success_count,
      },
      miners: report.miners.map((m) => ({
        uid: m.uid,
        hotkey: m.hotkey,
        coldkey: m.coldkey,
        incentive: m.incentive,
        avgScore: m.avg_score,
        lastScore: m.last_score,
        rmse: m.rmse,
        norm: m.norm,
        result: m.result,
        imageUrl: m.image_url,
      })),
      updatedAt: report.updatedAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/validators ──────────────────────────────────────────────────────────────────────────────
export async function listValidatorsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const hotkeys = await getAllValidatorHotkeys();
    res.json({ validators: hotkeys });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/burn-rate ────────────────────────────────────────────────────
export async function getBurnRateHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const burnRate = await getBurnRate();
    res.json({ burnRate });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/burn-rate ───────────────────────────────────────────────────
export async function setBurnRateHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { burnRate } = req.body as { burnRate?: unknown };

    if (typeof burnRate !== 'number' || !isFinite(burnRate)) {
      res.status(422).json({ message: 'burnRate must be a finite number' });
      return;
    }

    await setBurnRate(burnRate);
    res.json({ ok: true, burnRate });
  } catch (err) {
    next(err);
  }
}
